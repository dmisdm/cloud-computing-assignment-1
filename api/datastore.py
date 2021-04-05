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

    def get_user_by_key(self, key: int):
        return self.datastore_client.get(
            key=self.datastore_client.key("user", key)
        )

    def validate_user_uniqueness(self, id: int, user_name: str):
        existing_users = self.get_users(
            filters=[("id", id), ("user_name", user_name)]
        )

        if len(existing_users) > 0:
            if len([user for user in existing_users if user.id == id]) > 0:
                return UserIDAlreadyExists()
            else:
                return UserNameAlreadyExists()
        return None

    def add_user(self, user: User):
        uniqueness_error = self.validate_user_uniqueness(
            id=user.id, user_name=user.user_name
        )
        if uniqueness_error:
            return uniqueness_error

        entity = datastore.Entity(key=datastore_client.key("user"))

        entity.update(**user)
        self.datastore_client.put(entity)
        return True

    def patch_user(self, id: int, changes: list[(str, str)]):
        found_user = self.get_user_by_key(id)
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
            filters=[("id", id), ("password", password)]
        )
        if len(found_users) == 1:
            return found_users[0]
        else:
            return False


class PostsDatastore:
    def __init__(self, datastore_client: datastore.Client) -> None:
        self.datastore_client = datastore_client

    def top_ten(self):
        query = self.datastore_client.query(kind="post")
        query.order = ["-created_at"]
        return list(query.fetch(limit=10))

    def create(self, post: Post):
        post_entity = datastore.Entity(key=datastore_client.key("post"))
        post_entity.update(post)
        self.datastore_client.put(post_entity)
        return True

    def user_posts(self, user_id: str):
        query = self.datastore_client.query(kind="post")
        query.add_filter("user_id", user_id)
        query.order = ["-created_at"]
        return list(query.fetch(limit=10))


users_datastore = UsersDatastore(datastore_client=datastore_client)
posts_datastore = PostsDatastore(datastore_client=datastore_client)