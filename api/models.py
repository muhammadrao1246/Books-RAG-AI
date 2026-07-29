from typing import Any
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
import uuid
from django.contrib.auth import get_user_model
from core.settings import *

from pgvector.django import VectorField


from openai import OpenAI
client = OpenAI(api_key=OPENAI_API_KEY)

from django.core.files.storage import default_storage

class CustomUserManager(BaseUserManager):
    def create_user(self, email, fullname, password=None, **extra_fields):
        print(email, fullname, password)
        
        if not email:  
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        extra_fields["is_third_party"] = not bool(password) 
        user = self.model(email=email, fullname=fullname, thread_id=client.beta.threads.create(tool_resources={
            "file_search": {
                "vector_store_ids": [OPENAI_VECTOR_STORE_ID]
            }
            }).id, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        
        if user.is_superuser:
            ChatAgentModel.objects.create(admin = user)   
             
        return user

    def create_superuser(self, email, fullname, password=None, **extra_fields):
        # extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, fullname, password, **extra_fields)


class UserModel(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, unique=True, default=uuid.uuid4, editable=False)
    
    email = models.EmailField(unique=True)
    fullname = models.CharField(max_length=255)
    profile_image = models.ImageField(upload_to="user", null=True, default=None)
    is_active = models.BooleanField(default=True)
    is_third_party = models.BooleanField(default=False)
    
    thread_id = models.CharField(max_length=255, null=False, blank=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['fullname']

    def __str__(self):
        return self.email
    
    def has_perm(self, perm, obj=None):
        "Does the user have a specific permission?"
        # Simplest possible answer: Yes, always
        return True

    def has_module_perms(self, app_label):
        "Does the user have permissions to view the app `app_label`?"
        # Simplest possible answer: Yes, always
        return True

    @property
    def is_staff(self):
        "Is the user a member of staff?"
        # Simplest possible answer: All admins are staff
        return self.is_superuser



class LangchainPgCollection(models.Model):
    name = models.CharField(blank=True, null=True)
    cmetadata = models.TextField(blank=True, null=True)  # This field type is a guess.
    uuid = models.UUIDField(primary_key=True)

    class Meta:
        managed = False
        db_table = 'langchain_pg_collection'


class LangchainPgEmbedding(models.Model):
    collection = models.ForeignKey(LangchainPgCollection, models.DO_NOTHING, blank=True, null=True)
    embedding = VectorField(dimensions=3072) # This field type is a guess.
    document = models.CharField(blank=True, null=True)
    cmetadata = models.TextField(blank=True, null=True)  # This field type is a guess.
    custom_id = models.CharField(blank=True, null=True)
    uuid = models.UUIDField(primary_key=True)

    class Meta:
        managed = False
        db_table = 'langchain_pg_embedding'


class BookModel(models.Model):
    id = models.UUIDField(primary_key=True, unique=True, default=uuid.uuid4, editable=False)
    slug = models.SlugField(unique=True, null=False, blank=False, max_length=200)
    name = models.CharField(max_length=255)
    size = models.PositiveBigIntegerField()
    file_type = models.CharField(max_length=20)
    
    is_temporary = models.BooleanField(default=False, null=False, blank=False)
    
    file = models.FileField(upload_to="books", null=False)
    
    
    file_id = models.CharField(max_length=255, null=True, blank=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def __str__(self):
        return self.file.url
    
    # def delete(self, using: Any = ..., keep_parents: bool = ...) -> tuple[int, dict[str, int]]:
    #     result = super().delete(using, keep_parents)
    #     print(self.file.name)
    #     default_storage.delete(self.file.name)
    #     return result


# class VectorStoreModel(models.Model):
#     id = models.UUIDField(primary_key=True, unique=True, default=uuid.uuid4, editable=False)
    
#     vector_id = models.CharField(max_length=255, unique=True, null=False, blank=False)
    
#     name = models.CharField(max_length=255)
    
#     documents = models.ManyToManyField(BookModel, related_name="books")
    
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return self.title


# class AssistantModel(models.Model):
#     id = models.UUIDField(primary_key=True, unique=True, default=uuid.uuid4, editable=False)
    
#     assistant_id = models.CharField(max_length=255, unique=True, null=False, blank=False)
    
#     name = models.CharField(max_length=255)
#     instructions = models.TextField(blank=False, null=False)
    
#     vector = models.ForeignKey(VectorStoreModel, on_delete=models.CASCADE)
    
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return self.title



class ChatAgentModel(models.Model):
    id = models.UUIDField(primary_key=True, unique=True, default=uuid.uuid4, editable=False)
    
    admin = models.ForeignKey(UserModel, on_delete=models.CASCADE)
    
    title = models.CharField(max_length=255, default="Assistant")
    content = models.TextField(default="Ai Assistant At Your Service", blank=True, null=True)
    
    documents = models.ManyToManyField(BookModel, related_name="books")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
    
class ChatModel(models.Model):
    
    id = models.UUIDField(primary_key=True, unique=True, default=uuid.uuid4, editable=False)
    
    content = models.TextField()
    exchange_type = models.CharField(max_length=255, choices={
        "AI": "AI",
        "HUMAN": "Human"
    })
    
    agent = models.ForeignKey(ChatAgentModel, on_delete=models.CASCADE)
    user = models.ForeignKey(UserModel, on_delete=models.CASCADE)
  
  
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
    
    # class Meta:
        # ordering = ['-created_at']
    
    

    

# class EpisodeModel(models.Model):
#     id = models.UUIDField(primary_key=True, unique=True, default=uuid.uuid4, editable=False)
    
#     # user = models.ForeignKey(UserModel, on_delete=models.CASCADE)
#     title = models.CharField(max_length=255)
#     content = models.TextField(blank=True, null=True)
    
#     start_time = models.CharField(max_length=12, null=True)
#     end_time = models.CharField(max_length=12, null=True)
    
#     sheet_link = models.URLField()
#     video_link = models.URLField()
    
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return self.title
    
#     class Meta:
#         ordering = ['-created_at']

# class SequenceModel(models.Model):
#     id = models.UUIDField(primary_key=True, unique=True, default=uuid.uuid4, editable=False)
#     episode = models.ForeignKey(EpisodeModel, related_name='sequences', on_delete=models.CASCADE)
#     # user = models.ForeignKey(UserModel, on_delete=models.CASCADE)
    
#     words = models.CharField(max_length=255)
    
#     sequence_number = models.PositiveBigIntegerField()
#     start_time = models.CharField(max_length=12, null=False)
#     end_time = models.CharField(max_length=12, null=False)
    
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         ordering = ['sequence_number']
        
#     def __str__(self):
#         return self.words

# class ChapterModel(models.Model):
#     id = models.UUIDField(primary_key=True, unique=True, default=uuid.uuid4, editable=False)
#     episode = models.ForeignKey(EpisodeModel, related_name='chapters', on_delete=models.CASCADE)
#     # user = models.ForeignKey(UserModel, on_delete=models.CASCADE)
    
#     title = models.CharField(max_length=255)
#     chapter_number = models.PositiveBigIntegerField()  # To maintain the order of chapters
    
#     sequences = models.ManyToManyField(SequenceModel, related_name='chapters')
    
#     content = models.TextField(blank=True, null=True)
#     start_time = models.CharField(max_length=12, null=True)
#     end_time = models.CharField(max_length=12, null=True)
    
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         unique_together = ('episode', 'chapter_number')
#         ordering = ['chapter_number']

#     def __str__(self):
#         return f"{self.title} (Chapter {self.chapter_number})"

# class ReelModel(models.Model):
#     id = models.UUIDField(primary_key=True, unique=True, default=uuid.uuid4, editable=False)
#     episode = models.ForeignKey(EpisodeModel, related_name='reels', on_delete=models.CASCADE)
#     chapter = models.ForeignKey(ChapterModel, related_name='reels', on_delete=models.CASCADE)
#     # user = models.ForeignKey(UserModel, on_delete=models.CASCADE)
    
#     title = models.CharField(max_length=255)
#     reel_number = models.PositiveBigIntegerField()
    
#     sequences = models.ManyToManyField(SequenceModel, related_name='reels')
    
#     content = models.TextField(blank=True, null=True)
    
#     start_time = models.CharField(max_length=12, null=True)
#     end_time = models.CharField(max_length=12, null=True)
    
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         unique_together = ('chapter', 'reel_number')
#         ordering = ['reel_number']
    
#     def __str__(self):
#         return f"Reel {self.reel_number}: {self.content[:30]}..."
