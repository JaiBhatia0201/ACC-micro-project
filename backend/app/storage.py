import io
from minio import Minio
from . import config

_client = Minio(
    config.MINIO_ENDPOINT,
    access_key=config.MINIO_ACCESS_KEY,
    secret_key=config.MINIO_SECRET_KEY,
    secure=False,
)


def ensure_bucket():
    if not _client.bucket_exists(config.MINIO_BUCKET):
        _client.make_bucket(config.MINIO_BUCKET)


def upload_resume(key: str, data: bytes, content_type: str):
    ensure_bucket()
    _client.put_object(config.MINIO_BUCKET, key, io.BytesIO(data), len(data),
                       content_type=content_type)


def download_resume(key: str) -> bytes:
    resp = _client.get_object(config.MINIO_BUCKET, key)
    try:
        return resp.read()
    finally:
        resp.close()
        resp.release_conn()