from uuid import uuid4
from api.errors import (
    ApplicationError,
    ExpiredAuthToken,
    InvalidCredentials,
    InvalidLoginForm,
    InvalidPostCreationForm,
    InvalidRegistrationForm,
    InvalidRequest,
    Unauthenticated,
)
from flask import Flask, jsonify, request, make_response, g
from api.schemas import (
    ChangePasswordForm,
    LoginForm,
    Post,
    PostCreateForm,
    PostEditForm,
    User,
    UserRegistrationForm,
)
from api.bigquery import big_query
from api.datastore import users_datastore, posts_datastore
from api.image_storage import image_storage
from jwt import encode, decode, ExpiredSignatureError
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
            "id": valid_credentials["id"],
            "user_name": valid_credentials["user_name"],
            "image": valid_credentials["image"],
            "exp": exp,
        }
        token = encode(
            payload,
            jwt_secret,
            algorithm=jwt_algorithms[0],
        )
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
    new_user_result = users_datastore.add_user(
        User.parse_obj({**valid_form.dict(), "image": image_url})
    )
    if new_user_result != True:
        raise new_user_result
    else:

        response = make_response()
        response.status_code = 201
        return response


@app.route("/api/change_password", methods=["POST"])
@authenticated_route
def change_password():
    data = request.json
    try:
        valid_form = ChangePasswordForm(**data)
    except ValidationError as error:
        raise InvalidRequest().with_details({"errors": error.errors()})

    user = User(**users_datastore.get_user_by_id(g.user["id"]))

    if user.password != valid_form.old_password:
        raise InvalidRequest().with_message("The old password is incorrect")

    user.password = valid_form.new_password
    users_datastore.update_user(user)
    return make_response()


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
    files = list(request.files.values())
    image_file = files[0] if len(files) > 0 else None

    try:
        valid_post = PostCreateForm(**request.form, image=image_file)
    except ValidationError as error:
        raise InvalidPostCreationForm().with_details({"errors": error.errors()})

    image_url = image_storage.upload_image(image_file)
    post = Post.parse_obj(
        {
            **valid_post.dict(),
            "id": str(uuid4()),
            "image": image_url,
            "user_id": g.user["id"],
            "created_at": datetime.now().timestamp(),
            "updated_at": datetime.now().timestamp(),
        }
    )
    posts_datastore.upsert(post)
    response = jsonify(post.dict())
    response.status_code = 201
    return response


@app.route("/api/posts", methods=["PUT"])
@authenticated_route
def update_post():
    if not request.form["id"]:
        raise InvalidRequest()

    previous_post = posts_datastore.get_post_by_id(request.form["id"])

    if not previous_post:
        raise InvalidRequest()

    files = list(request.files.values())
    image_file = files[0] if len(files) > 0 else None

    try:
        valid_post = PostEditForm.parse_obj(
            {**request.form, "image": image_file}
        )
    except ValidationError as error:
        raise InvalidPostCreationForm().with_details({"errors": error.errors()})

    if image_file:
        image_url = image_storage.upload_image(image_file)
    else:
        image_url = previous_post["image"]
    post = Post.parse_obj(
        {
            **previous_post,
            **valid_post.dict(),
            "image": image_url,
            "updated_at": datetime.now().timestamp(),
        }
    )
    print(post)
    posts_datastore.upsert(post)
    response = jsonify(post.dict())
    return response


@app.route("/api/big-query/top_time_slots")
def big_query_top_time_slots():
    return {"rows": [row.dict() for row in big_query.top_time_slots()]}


@app.route("/api/big-query/top_deficit_countries")
def big_query_top_deficit_countries():
    return {"rows": [row.dict() for row in big_query.top_deficit_countries()]}


@app.route("/api/big-query/top_surplus_services")
def big_query_top_surplus_services():
    return {"rows": [row.dict() for row in big_query.top_surplus_services()]}


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
