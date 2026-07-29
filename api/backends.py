from django.conf import settings
from storages.backends.s3boto3 import S3Boto3Storage
from storages.backends.azure_storage import AzureStorage

from core.settings import env

# STORAGE BACKENDS
class StaticStorage(S3Boto3Storage):
    location = 'static'
    default_acl = 'public-read'


class PublicMediaStorage(S3Boto3Storage):
    location = 'media'
    default_acl = 'public-read'
    file_overwrite = False
    
# AZURE STORAGE BACKENDS
class AzureMediaStorage(AzureStorage):
    account_name = env('AZURE_STORAGE_ACCOUNT_NAME')
    account_key = env('AZURE_STORAGE_ACCOUNT_KEY')
    azure_container = 'media'
    expiration_secs = None
    overwrite_files = True


class AzureStaticStorage(AzureStorage):
    account_name = env('AZURE_STORAGE_ACCOUNT_NAME')
    account_key = env('AZURE_STORAGE_ACCOUNT_KEY')
    azure_container = 'static'
    expiration_secs = None
    