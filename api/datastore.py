from api.schemas import Post, User
from api.errors import (
    UserIDAlreadyExists,
    UserNameAlreadyExists,
)
from typing import Union, Literal

from google.cloud import datastore
from google.cloud.datastore.entity import Entity


datastore_client = datastore.Client()


class UsersDatastore:
    def __init__(self, datastore_client: datastore.Client):
        self.datastore_client = datastore_client

    def get_users(
        self, offset=None, limit=None, filters: list[(str, str)] = []
    ) -> list[Entity]:
        query = self.datastore_client.query(kind="user")
        for filter in filters:
            query = query.add_filter(filter[0], "=", filter[1])

        return list(query.fetch(limit=limit, offset=offset))

    def get_user_by_id(self, id: str):
        return self.datastore_client.get(
            key=self.datastore_client.key("user", id)
        )

    def validate_user_uniqueness(self, id: str, user_name: str):
        if self.get_user_by_id(id):
            return UserIDAlreadyExists()

        existing_users = self.get_users(
            filters=[
                ("user_name", user_name),
            ]
        )

        if len(existing_users) > 0:
            return UserNameAlreadyExists()

        return None

    def add_user(self, user: User):
        uniqueness_error = self.validate_user_uniqueness(
            id=user.id, user_name=user.user_name
        )
        if uniqueness_error:
            return uniqueness_error

        entity = datastore.Entity(key=datastore_client.key("user", user.id))

        entity.update(**user.dict())
        self.datastore_client.put(entity)
        return True

    def patch_user(self, id: str, changes: list[(str, str)]):
        found_user = self.get_user_by_id(id)
        if found_user:
            for change in changes:
                found_user[change[0]] = change[1]
            uniqueness_error = self.validate_user_uniqueness(
                id=found_user.id, user_name=found_user.user_name
            )
            if uniqueness_error:
                return uniqueness_error
            self.datastore_client.put(found_user)
            return True
        return "User not found"

    def validate_credentials(self, id: str, password: str):
        found_users = self.get_users(
            filters=[
                ("__key__", self.datastore_client.key("user", id)),
                ("password", password),
            ]
        )
        if len(found_users) == 1:
            return found_users[0]
        else:
            return False


class PostsDatastore:
    def __init__(self, datastore_client: datastore.Client) -> None:
        self.datastore_client = datastore_client

    def top_ten(self):
        posts_query = self.datastore_client.query(kind="post")
        posts_query.order = ["-created_at"]
        posts = list(posts_query.fetch(limit=10))

        users = users_datastore.get_users(
            filters=[
                ("__key__", self.datastore_client.key("user", post["user_id"]))
                for post in posts
            ]
        )

        return [
            {
                **post,
                "user_image": next(
                    (
                        user["image"]
                        for user in users
                        if user["id"] == post["user_id"]
                    ),
                ),
            }
            for post in posts
        ]

    def create(self, post: Post):
        post_entity = datastore.Entity(
            key=datastore_client.key("post", post.id)
        )
        post_entity.update(post)
        self.datastore_client.put(post_entity)
        return True

    def user_posts(self, user_id: str):
        posts_query = self.datastore_client.query(kind="post")
        posts_query.order = ["-created_at"]
        posts_query.add_filter("user_id", "=", user_id)
        posts = list(posts_query.fetch())

        user = users_datastore.get_user_by_id(user_id)

        return [{**post, "user_image": user["image"]} for post in posts]


users_datastore = UsersDatastore(datastore_client=datastore_client)
posts_datastore = PostsDatastore(datastore_client=datastore_client)