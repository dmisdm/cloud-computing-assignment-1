from typing import BinaryIO
from pydantic import BaseModel
from datetime import datetime

from werkzeug.datastructures import FileStorage


class UserRegistrationForm(BaseModel):
    id: str
    user_name: str
    password: str
    image: FileStorage

    class Config:
        arbitrary_types_allowed = True


class User(BaseModel):
    id: str
    user_name: str
    password: str
    image: str


class PostCreateForm(BaseModel):
    subject: str
    message: str
    image: FileStorage

    class Config:
        arbitrary_types_allowed = True


class Post(PostCreateForm):
    id: str
    user_id: str
    image: str
    created_at: datetime
    updated_at: datetime


class PostViewModel(Post):
    user_image: str


class LoginForm(BaseModel):
    id: str
    password: str
