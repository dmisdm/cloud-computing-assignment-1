from google.cloud import storage
from uuid import uuid4
from werkzeug.datastructures import FileStorage
from api.config import project_id


class ImageStorage:
    client = storage.Client()
    bucket_name = f"{project_id}.appspot.com"
    bucket = client.get_bucket(bucket_name)

    def upload_image(self, image: FileStorage):
        name = f"{uuid4()}-{image.filename}"
        blob = self.bucket.blob(name)
        blob.upload_from_file(image.stream)
        blob.make_public()
        return blob.public_url


image_storage = ImageStorage()
