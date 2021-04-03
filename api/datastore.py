from typing import Union, Literal

from google.cloud import datastore
from google.cloud.datastore.entity import Entity

datastore_client = datastore.Client()


class UsersDatastore:

    def __init__(self, datastore_client: datastore.Client):
        self.datastore_client = datastore_client

    def get_users(self, offset=None, limit=None, filters: list[(str, str)] = []) -> list[Entity]:
        query = self.datastore_client.query(kind="user")
        for filter in filters:
            query = query.add_filter(filter[0], "=", filter[1])

        return list(query.fetch(limit=limit, offset=offset))

    def get_user_by_id(self, key: int):
        return self.datastore_client.get(key=self.datastore_client.key("user", key))

    def validate_user_uniqueness(self, id: int, user_name: str):
        existing_users = self.get_users(
            filters=[("id", id), ("user_name", user_name)])

        if len(existing_users) > 0:
            if len([user for user in existing_users if user.id == id]) > 0:
                return "The ID already exists"
            else:
                return "The username already exists"
        return None

    def add_user(self, id: int, user_name: str, password: str, image: str):
        uniqueness_error = self.validate_user_uniqueness(
            id=id, user_name=user_name)
        if uniqueness_error:
            return uniqueness_error

        entity = datastore.Entity(key=datastore_client.key("user"))

        entity.update(id=id, user_name=user_name,
                      password=password, image=image)
        self.datastore_client.put(entity)
        return True

    def patch_user(self, id: int, changes: list[(str, str)]):
        found_user: Union[Entity, None] = self.get_user_by_id(id)
        if found_user:
            for change in changes:
                found_user[change[0]] = change[1]
            uniqueness_error = self.validate_user_uniqueness(
                id=found_user.id, user_name=found_user.user_name)
            if uniqueness_error:
                return uniqueness_error
            self.datastore_client.put(found_user)
            return True
        return "User not found"


users_datastore = UsersDatastore(datastore_client=datastore_client)
