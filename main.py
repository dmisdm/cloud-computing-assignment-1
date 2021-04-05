from threading import local
from uuid import uuid4
from api.errors import (
    ApplicationError,
    ExpiredAuthToken,
    InvalidCredentials,
    InvalidLoginForm,
    InvalidPostCreationForm,
    InvalidRegistrationForm,
    Unauthenticated,
)
from flask import Flask, jsonify, request, make_response, url_for, redirect, g
from api.schemas import (
    LoginForm,
    Post,
    PostCreateForm,
    User,
    UserRegistrationForm,
)
from api.datastore import users_datastore, posts_datastore
from api.image_storage import image_storage
from jwt import DecodeError, encode, decode, ExpiredSignatureError
from datetime import timedelta, datetime
from functools import wraps
from pydantic import ValidationError

jwt_algorithms = ["HS256"]
jwt_exp_duration = timedelta(hours=5)
jwt_secret = "supersecretandshouldnotbeinsourcecode"
local_web_server = "http://localhost:3000"
is_dev = False

app = Flask(__name__, template_folder="web/public")
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024


def authenticate_request():
    auth_token = request.cookies.get("auth_token")
    if not auth_token:
        raise Unauthenticated()
    try:
        decoded = decode(auth_token, jwt_secret, algorithms=jwt_algorithms)
        return decoded
    except ExpiredSignatureError as err:
        raise ExpiredAuthToken().with_details(str(err))
    except Exception as err:
        raise Unauthenticated().with_details(str(err))


@app.route("/api/me", methods=["GET"])
def me():
    return jsonify(authenticate_request())


def authenticated_route(f):
    @wraps(f)
    def fn(*args, **kwargs):
        g.user = authenticate_request()
        return f(*args, **kwargs)

    return fn


@app.errorhandler(ApplicationError)
def handle_invalid_usage(error: ApplicationError):
    return error.to_flask_response()


@app.route("/api/login", methods=["POST"])
def login():
    form_data = request.json

    try:
        valid_form = LoginForm(**form_data)
    except:
        raise InvalidLoginForm()

    valid_credentials = users_datastore.validate_credentials(
        **valid_form.dict()
    )
    if valid_credentials:
        local_exp = datetime.now() + jwt_exp_duration
        exp = datetime.utcnow() + jwt_exp_duration
        payload = {
            **valid_credentials,
            "exp": exp,
        }
        token = encode(
            payload,
            jwt_secret,
            algorithm=jwt_algorithms[0],
        )
        del payload["password"]
        del payload["exp"]
        payload["authExpireDate"] = local_exp.timestamp()
        response = jsonify(payload)
        response.set_cookie("auth_token", token)
        return response
    else:
        raise InvalidCredentials()


@app.route("/api/register", methods=["POST"])
def register():
    data = request.form
    image_file = list(request.files.values())[0]
    try:
        valid_form = UserRegistrationForm(**data, image=image_file)
    except ValidationError as error:
        raise InvalidRegistrationForm().with_details({"errors": error.errors()})

    image_url = image_storage.upload_image(image_file)
    form_without_image = valid_form.dict()
    del form_without_image["image"]
    new_user_result = users_datastore.add_user(
        User(**form_without_image, image=image_url)
    )
    if new_user_result != True:
        raise new_user_result
    else:

        response = make_response()
        response.status_code = 201
        return response


@app.route("/api/posts", methods=["GET"])
@authenticated_route
def top_ten_posts():
    return {
        "posts": [
            {
                **post,
                "created_at": post["created_at"].timestamp(),
                "updated_at": post["updated_at"].timestamp(),
            }
            for post in posts_datastore.top_ten()
        ]
    }


@app.route("/api/my_posts", methods=["GET"])
@authenticated_route
def my_posts():
    return {
        "posts": [
            {
                **post,
                "created_at": post["created_at"].timestamp(),
                "updated_at": post["updated_at"].timestamp(),
            }
            for post in posts_datastore.user_posts(g.user["id"])
        ]
    }


@app.route("/api/posts", methods=["POST"])
@authenticated_route
def create_post():
    image_file = list(request.files.values())[0]
    try:
        valid_post = PostCreateForm(**request.form, image=image_file)
    except ValidationError as error:
        raise InvalidPostCreationForm().with_details({"errors": error.errors()})

    image_url = image_storage.upload_image(image_file)
    form_without_image = valid_post.dict()
    del form_without_image["image"]
    post = Post(
        **form_without_image,
        id=str(uuid4()),
        image=image_url,
        user_id=g.user["id"],
        created_at=datetime.now().timestamp(),
        updated_at=datetime.now().timestamp(),
    )
    posts_datastore.create(post)
    response = jsonify(post.dict())
    response.status_code = 201
    return response


if __name__ == "__main__":
    # This is used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. This
    # can be configured by adding an `entrypoint` to app.yaml.
    # Flask's development server will automatically serve static files in
    # the "static" directory. See:
    # http://flask.pocoo.org/docs/1.0/quickstart/#static-files. Once deployed,
    # App Engine itself will serve those files as configured in app.yaml.
    is_dev = True
    app.run(host="0.0.0.0", port=8080, debug=True)
