from pydantic import BaseModel
from datetime import datetime


class User(BaseModel):
    id: str
    user_name: str
    password: str
    image: str


class PostCreateForm(BaseModel):
    subject: str
    message: str


class Post(PostCreateForm):
    id: str
    user_id: str
    image: str
    created_at: datetime
    updated_at: datetime


class LoginForm(BaseModel):
    id: str
    password: str
