from typing import Any
from flask import json


class ApplicationError(Exception):
    status_code = 500
    message = "Internal Error"
    details: Any = None

    def with_details(self, data: object):
        self.details = data
        return self

    def with_message(self, message: str):
        self.message = message
        return self

    def to_flask_response(self):
        response = json.jsonify(
            {
                "error": {
                    "name": self.__class__.__name__,
                    "message": self.message,
                    "details": self.details,
                }
            }
        )
        response.status_code = self.status_code
        return response


class InvalidRequest(ApplicationError):
    status_code = 400
    message = "Invalid request"


# Auth errors
class InvalidCredentials(ApplicationError):
    status_code = 400
    message = "The ID or password was incorrect"


class Unauthenticated(ApplicationError):
    status_code = 401
    message = "A valid authentication token is required"


class ExpiredAuthToken(ApplicationError):
    status_code = 401
    message = "Expired authentication token"


# Validation errors
class InvalidLoginForm(ApplicationError):
    status_code = 400
    message = "The ID or password is invalid"


class InvalidRegistrationForm(ApplicationError):
    status_code = 400
    message = "Invalid registration form data"


class InvalidPostCreationForm(ApplicationError):
    status_code = 400
    message = "Invalid post creation data"


# Logic errors
class UserIDAlreadyExists(ApplicationError):
    status_code = 400
    message = "The ID already exists"


class UserNameAlreadyExists(ApplicationError):
    status_code = 400
    message = "The username already exists"