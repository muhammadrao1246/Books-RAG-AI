from django import db
from django.forms import ValidationError
from rest_framework import serializers

from django.utils.text import slugify

from django.utils import timezone

from django.db import DatabaseError, transaction
from django.db.models import QuerySet

from django.utils.encoding import smart_str, DjangoUnicodeDecodeError, force_bytes
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.contrib.auth.tokens import PasswordResetTokenGenerator


from .utils import UTIL, FileManager, TokenManager

from .models import *
# from .embeddings import VectorStoreManager
from .assistants import OpenAIAssistantManager
from core.settings import *

get_file_field_url = lambda url: "http://127.0.0.1:8000"+FileManager.url(url) if DEBUG and USE_CLOUD_STORAGE == "local" else FileManager.url(url)
                
            

# Chat Serializers
class ChatHistorySerializer(serializers.ModelSerializer):

    class Meta:
        model = ChatModel
        fields = ["content", "exchange_type"]
        
    
        
class AIChatSerializer(serializers.Serializer):
    
    query = serializers.CharField(max_length=1000, required=True, error_messages={
                    'required': 'Prompt is required.',
                    'max_length': 'Content should not exceed length of 1000 characters.'
                })
    
    
    class Meta:
        fields = "__all__"
        
        
    
# Books Serializer
class BooksListSerializer(serializers.ModelSerializer):
    
    file = serializers.SerializerMethodField()
    
    class Meta:
        model = BookModel
        fields = "__all__"
        
    
    def get_file(self, book: BookModel):
        relative_url = book.file.name
        if relative_url != "":
            return get_file_field_url(relative_url)
        return None
        

# Books Upload
class BooksUploadSerializer(serializers.Serializer):
    
    doc_files = serializers.FileField(required=True,  error_messages={
                    'required': 'PDF files are required.',
                })
    is_temporary = serializers.BooleanField(required=True)
    
    class Meta:
        fields = ["doc_files", "is_temporary"]
    
    def validate(self, attrs):
        
        admin = self.context.get("admin")
        file = attrs.get("doc_files", None)
        is_temporary = attrs.get("is_temporary", False)
        
        # for file in files:  
            # print(file.size)
            # print(file.name)
            # print(file._name)
            # print(file.temporary_file_path())      
        if not file.name.endswith(".pdf"):
                raise ValidationError("Only PDF files are allowed.")
            
        # print(files)
        try:        
            
            with transaction.atomic() as atomic:
                
                    # adding books to ChatAgents
                    agent = ChatAgentModel.objects.filter(admin=admin).first()
                    
                # for file in files:
                    name = file.name
                    slug = slugify(name)
                    extension = file._name.split(".")[len(file._name.split("."))-1]
                    
                    book_model = BookModel.objects.filter(slug=slug).first()
                    if book_model is not None:
                        raise ValidationError(f"{name} File is already uploaded!")
                    else:
                        book_model = BookModel.objects.create(
                                slug=slug,
                                name = file.name,
                                size = file.size,
                                file_type = extension,
                                is_temporary = is_temporary,
                                file = file
                                )
                            
                        print(book_model) 
                    
                        # store these books into vector storage
                        # store = VectorStoreManager(book_model)
                    
                    agent.documents.add(book_model)
                    OpenAIAssistantManager.upload_files_vector_store(book_model=book_model)
                
                
        except DatabaseError:
            raise ValidationError("Unable to Upload File!")
        except Exception as ex:
            print(ex)
            raise ValidationError(ex)
        
        # store = VectorStoreManager(file, admin)
        
        return super().validate(attrs)



# AUTH SERIALIZERS
class UserPasswordResetSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True, min_length=8, required=True, error_messages = {
                    'required': 'Password is required.',
                    'min_length': 'Password must be greater than 8 in length.'
                })
    password2 = serializers.CharField(write_only=True, min_length=8, required=True, error_messages = {
                    'required': 'Confirm password is required.'
                })
    
    class Meta:
        model = UserModel
        fields = ['password', 'password2']
    
    def validate(self, data):
            uid = self.context.get("uid")
            token = self.context.get("token")
            
            if data['password'] != data['password2']:
                raise serializers.ValidationError("Passwords do not match.")
            
            user = TokenManager.check_reset_token_uid(uid, token)
            if user is None:
                raise ValidationError("Invalid or Outdated Password Reset Link.")
            
            user.set_password(data['password'])
            user.save()
            
            return data

class UserPasswordForgotSerializer(serializers.Serializer):
    
    email = serializers.EmailField(required=True, error_messages={
                    'required': 'Email is required.',
                    'invalid': 'Enter a valid email address.'
                })
    
    frontend_password_reset_route = serializers.URLField(required=True, error_messages={
                    'required': 'Password Reset Route URL is required.',
                    })
    class Meta:
        fields = ['email', 'frontend_password_reset_route']
        
    def validate_frontend_password_reset_route(self, frontend_password_reset_route):
        if frontend_password_reset_route[-1] == "/":
            raise ValidationError("URL should not have Forward Slash at the end")
        return frontend_password_reset_route
    
    def validate(self, data):
        email = data.get("email")
        password_reset_route = data.get("frontend_password_reset_route")
        user = UserModel.objects.filter(email=email)
        if user.exists():
            if user.filter(is_third_party = False).exists():
                fetched = user.first()
                print(email)
                
                uid, token = TokenManager.create_reset_token_uid(fetched)
                
                link = f'{password_reset_route}/{uid}/{token}'
                print("Password Reset Link: ", link)
                
                email_data = {
                    "subject": "Podcast: Reset Your Password",
                    "body": f"One Time password reset link. Valid for 15 minutes.\nClick on this link below to reset your password.\n{link}",
                    "to_email": fetched.email
                }
                UTIL.send_email(email_data)
            else:
                raise serializers.ValidationError("Social Account cannot forgot the password.")
        else:
            raise serializers.ValidationError("Account associated with this email does not exists.")
            
        # user.set_password(data['password'])
        # user.save()
        return data


class UserChangePasswordSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, required=True, error_messages = {
                    'required': 'Password is required.',
                    'min_length': 'Password must be greater than 8 in length.'
                })
    password2 = serializers.CharField(write_only=True, min_length=8, required=True, error_messages = {
                    'required': 'Confirm password is required.'
                })
    
    class Meta:
        model = UserModel
        fields = ['password', 'password2']
    
    def validate(self, data):
        # user = self.context.get("user")
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords do not match.")
        # user.set_password(data['password'])
        # user.save()
        return data

    
    def update(self, instance, validated_data):
        validated_data.pop('password2')
        return super().update(instance, validated_data)
    
    # def create(self, validated_data):
    #     validated_data.pop('password2')
    #     user = UserModel.objects.create_user(**validated_data)
    #     return user

class UserProfileSerializer(serializers.ModelSerializer):
    
    email = serializers.EmailField(read_only=True, error_messages={
                    'required': 'Email is required.',
                    'invalid': 'Enter a valid email address.'
                })
    profile_image = serializers.ImageField(required=False)
    fullname = serializers.CharField(max_length=255, required=True, error_messages={
                    'required': 'Full name is required.',
                    'max_length': 'Full name cannot be longer than 255 characters.'
                })
    
    class Meta:
        model = UserModel
        fields = ['email', 'fullname', 'profile_image']
        read_only_fields = ['email']
    
    
    def validate_profile_image(self, image):
        # image = self.cleaned_data.get('profile_image', False)
        user_model = self.context.get("user_model")
        
        # print(image.__dict__)
        if hasattr(image, "_file"):
            return image
        if image:
            # print(image)
            if image.size > 1*1024*1024:
                raise ValidationError("Image file too large ( > 1mb )")
            # setting unique image name
            id = str(uuid.uuid4())
            extension = image._name.split(".")[len(image._name.split("."))-1]
            image._name = id+"."+extension
            image.field_name = id
            # print(image.__dict__)
            
            # delete previous image
            print('Previous Image: ', user_model.profile_image)
            if user_model.profile_image.name != '':
                FileManager.delete(user_model.profile_image.name)
            
        return image


class UserSocialLoginSerializer(serializers.Serializer):
    
    access_token = serializers.CharField(required=True, error_messages={
                    'required': 'Access Token is required.',
                })
    
    
    class Meta:
        fields = ['access_token',]
    

    
class UserLoginSerializer(serializers.ModelSerializer):
    
    email = serializers.EmailField(required=True, error_messages={
                    'required': 'Email is required.',
                    'unique': 'An account with this email already exists.',
                    'invalid': 'Enter a valid email address.'
                })
    password = serializers.CharField(write_only=True, min_length=8, required=True, error_messages = {
                    'required': 'Password is required.',
                    'min_length': 'Password must be greater than 8 in length.'
                })
     
    class Meta:
        model = UserModel
        fields = ['email', 'password',]

    

class UserDetailSerializer(serializers.ModelSerializer):
    
    email = serializers.EmailField(required=True, label="Email", error_messages={
                    'required': 'Email is required.',
                    'unique': 'An account with this email already exists.',
                    'invalid': 'Enter a valid email address.'
                })
    fullname = serializers.CharField(max_length=255, label="Name", error_messages={
                    'required': 'Full name is required.',
                    'max_length': 'Full name cannot be longer than 255 characters.'
                })
    password = serializers.CharField(write_only=True, min_length=8, required=True, error_messages = {
                    'required': 'Password is required.',
                    'min_length': 'Password must be greater than 8 in length.'
                })
    password2 = serializers.CharField(write_only=True, min_length=8, required=True, error_messages = {
                    'required': 'Confirm password is required.'
                })
    profile_image = serializers.SerializerMethodField()
    
    role = serializers.SerializerMethodField()
    class Meta:
        model = UserModel
        fields = ['email', 'fullname', 'password', 'password2', 'profile_image', 'role', 'is_third_party']
    
    
    def get_role(self, user: UserModel):
        return "admin" if user.is_superuser else "user"
    
    def get_profile_image(self, user: UserModel):
        relative_url = user.profile_image.name
        if relative_url != "":
            url = FileManager.url(relative_url)
            
            if DEBUG and USE_CLOUD_STORAGE == "local":
                url = "http://127.0.0.1:8000"+url
            
            return url
        return None
    
    def validate_email(self, email):
        if UserModel.objects.filter(email=email).exists():
            raise ValidationError([
                'An account with this email already exists.'
            ])
        return email
        
    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords do not match.")
        return data

    def update(self, instance, validated_data):
        validated_data.pop('password2')
        return super().update(instance, validated_data)
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = UserModel.objects.create_user(**validated_data)
        return user
    
    # def validate(self, 
