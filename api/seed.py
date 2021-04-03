import os

from datastore import users_datastore

project_id = os.getenv("GOOGLE_CLOUD_PROJECT", "neon-trilogy-307702")

base_image_url = f"https://storage.googleapis.com/{project_id}.appspot.com/Numbers/"
ints = list("01234567890123456789")

users = [{
    "id": f"s3429288{index}",
    "user_name": f"Daniel Manning{index}",
    "password": "".join(ints[index:index+6]),
    "image": f"{base_image_url}{index}.png"
}
    for index in range(0, 10)]

for user in users:
    result = users_datastore.add_user(
        id=user["id"], user_name=user["user_name"], password=user["password"], image=user["image"])
    user_id = user["id"]
    if result == True:
        print(f"Created user {user_id}")
    else:
        print(f"Error creating {user_id}: {result}")
