import json

from django.db import IntegrityError, transaction
from core.settings import *
from .models import *
from django.core.files.storage import default_storage


from oauth2_provider.models import Application, AccessToken, RefreshToken
from oauth2_provider.settings import oauth2_settings
from oauth2_provider.views.mixins import OAuthLibMixin
from oauthlib.oauth2.rfc6749.errors import (
    InvalidClientError,
    UnsupportedGrantTypeError,
    AccessDeniedError,
    MissingClientIdError,
    InvalidRequestError,
)

from rest_framework.request import Request

from django.core.mail import EmailMessage
from django.http import HttpRequest
from django.utils.encoding import smart_str, DjangoUnicodeDecodeError, force_bytes
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.contrib.auth.tokens import PasswordResetTokenGenerator

from drf_social_oauth2.oauth2_backends import KeepRequestCore
from drf_social_oauth2.oauth2_endpoints import SocialTokenServer
from drf_social_oauth2.views import TokenView, ConvertTokenView
        
        


 
class TokenManager(OAuthLibMixin):
    """
    Implements an endpoint to provide access tokens

    The endpoint is used in the following flows:

    * Authorization code
    * Password
    * Client credentials
    """
    def __init__(self, request: Request, backend = "password") -> None:
        self.request = request
        self.backend = backend
        if backend == "password":
            self.server_class = oauth2_settings.OAUTH2_SERVER_CLASS
            self.validator_class = oauth2_settings.OAUTH2_VALIDATOR_CLASS
            self.oauthlib_backend_class = oauth2_settings.OAUTH2_BACKEND_CLASS
        else:
            self.server_class = SocialTokenServer
            self.validator_class = oauth2_settings.OAUTH2_VALIDATOR_CLASS
            self.oauthlib_backend_class = KeepRequestCore
        print(self.oauthlib_backend_class)
        
           
    # To Obtain Token from Oauth create_token method
    def __request_token(self, payload) -> dict | str:
        
        httpRequest = self.request._request
        httpRequest.POST = httpRequest.POST.copy() # mutabel copy
        httpRequest.POST.clear()
        httpRequest.POST.update(**payload)
        print(httpRequest.POST)
        
        try:
            url, headers, body, status = self.create_token_response(httpRequest)
            print(status)
        except InvalidClientError:
            return 'Missing client type.'
        except MissingClientIdError as ex:
            return ex.description
        except InvalidRequestError as ex:
            return ex.description
        except UnsupportedGrantTypeError:
            return 'Missing grant type.'
        except AccessDeniedError:
            return 'The token you provided is invalid or expired.'
        except IntegrityError as e:
            if 'email' in str(e) and 'already exists' in str(e):
                return 'A user with this email already exists.'
            else:
                return 'Database error.'
        except Exception as e:
            return "Internal Server Error"
        
        
        
        tokenDict = json.loads(body)
        print(tokenDict)
        return tokenDict

        
    def get_token(self, email, password):
        
        payload = {
                   'username': email,
                   'password': password,
                   'client_id': DEFAULT_AUTH_CLIENT_KEY,
                   'client_secret': DEFAULT_AUTH_CLIENT_SECRET,
                   'grant_type':'password'
               }
        
        return self.__request_token(payload)
    
    
    def get_user(self, access_token: str):
        token = AccessToken.objects.filter(token=access_token).first()
        return token.user if token else None
    
    @transaction.atomic
    def get_convert_token(self, access_token):
        
        payload = {
                   'grant_type':'convert_token',
                   'backend': self.backend,
                   'client_id': DEFAULT_AUTH_CLIENT_KEY,
                   'token': access_token,
                   'client_secret': DEFAULT_AUTH_CLIENT_SECRET,
               }
        # print(payload)
        
        
        tokenResponse = self.__request_token(payload)
        
        raise KeyError(tokenResponse)
        return self.get_user(access_token), tokenResponse
        
    @staticmethod
    def check_reset_token_uid(uid, token):
        try:
            user_id = smart_str(urlsafe_base64_decode(uid))
            user = UserModel.objects.get(id = user_id)

            if not PasswordResetTokenGenerator().check_token(user, token):
                return None
        
        except DjangoUnicodeDecodeError as ex:
            return None
            
        return user
    
    @staticmethod
    def create_reset_token_uid(user: UserModel):
        uid = urlsafe_base64_encode(force_bytes(user.id))
        print("Encoded UID: ", uid)
        token = PasswordResetTokenGenerator().make_token(user)
        print("Token Generated: ", token)
        
        return uid, token
        
class FileManager:
    @staticmethod
    def exists(filepath):
        return default_storage.exists(filepath)
    
    @staticmethod
    def save(filepath, file):
        return default_storage.save(filepath, file)
    
    @staticmethod
    def delete(filepath):
        return default_storage.delete(filepath)
    
    @staticmethod
    def open(filepath, mode = "rb"):
        return default_storage.open(filepath, mode)
    
    @staticmethod
    def url(filepath):
        return default_storage.url(filepath)
    
class DataDumper:
    @staticmethod
    def dump_to_file(filename, data):
        with FileManager.open(f"debug/{filename}", "tw+") as fp:
            json.dump(data, fp, indent=4)
            
        
            
class ModelExistenceChecker:
    @staticmethod
    def chapter_verifier(request, episode_id, chapter_id):
        current_user = request.user
        
        episode_model = EpisodeModel.objects.filter(
            id=episode_id, 
            # user=current_user
        ).first()
        if episode_model is None:
            return {"data": "Episode Not Found!", "status": 404}

        chapter_model = ChapterModel.objects.filter(id = chapter_id, episode=episode_model).first()
        if chapter_model is None:
            return {"data": "Chapter Not Found!", "status": 404}
        
        return [episode_model, chapter_model]
    
    @staticmethod
    def reel_verifier(request, episode_id, chapter_id, reel_id):
        current_user = request.user

        episode_model = EpisodeModel.objects.filter(
            id=episode_id, 
            # user=current_user
        ).first()
        if episode_model is None:
            return {"data": "Episode Not Found!", "status": 404}

        chapter_model = ChapterModel.objects.filter(id = chapter_id, episode=episode_model).first()
        if chapter_model is None:
            return {"data": "Chapter Not Found!", "status": 404}
        
        reel_model = ReelModel.objects.filter(id = reel_id).first()
        if reel_model is None:
            return {"data": "Reel Not Found!", "status": 404}
        
        return [episode_model, chapter_model, reel_model]
    
    
class UTIL:
    @staticmethod
    def send_email(data):
        email = EmailMessage(
            subject=data['subject'],
            body=data['body'],
            from_email=EMAIL_HOST_USER,
            to=[data["to_email"]],
        )
        email.send()
        