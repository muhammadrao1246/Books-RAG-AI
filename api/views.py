import time

from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status, generics, filters
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser


from django_filters.rest_framework import DjangoFilterBackend

from django.contrib.auth import authenticate
from django.http.response import *
from django.http.request import *
from django.conf import settings
from django.utils import timezone
from django.template.defaultfilters import slugify
from django.db.models import Q
from django.core.cache import cache
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page

from .utils import *
from .models import *
from .serializers import *
from .renderers import *
from .filters import *
from .pagination import *
# from .embeddings import VectorStoreManager
# from .chat import ChatManager

from drf_social_oauth2.views import CsrfExemptMixin, get_application
from drf_social_oauth2.serializers import ConvertTokenSerializer
from oauth2_provider.settings import oauth2_settings

# from operator import or_, not_, and_
# import pandas as pd
# from dateutil.relativedelta import relativedelta   

# from rest_framework_simplejwt.tokens import RefreshToken
def temp_books_remover():
    temporary = BookModel.objects.filter(is_temporary=True)
    slugs = []
    for book in temporary:
        if (timezone.now() - book.created_at).days >= 1:
            slugs.append(book.slug)
    
    if len(slugs) > 0:
        for book in BookModel.objects.filter(slugs__in = slugs):
            OpenAIAssistantManager.delete_vector_store_items(OpenAIAssistantManager.get_openai_client(), book.file_id)            
        BookModel.objects.filter(slugs__in = slugs).delete()
        
        LangchainPgCollection.objects.filter(name__in = slugs).delete()
            
            

# tester
class Tester(APIView):
    
    def get(self, request):
        
        
        return Response({
            "response": "Level 1 Working"
        })
      

# class ChatDocumentsAPI(APIView):
#     permission_classes=[IsAuthenticated,]
    
#     # adding books to database for AI consumption
#     def post(self, request: Request):
#         data = request.data
        
#         embedding = VectorStoreManager.get_embedding(data['query'])
#         documents = ChatManager.get_relevant_documents(embedding)
#         return Response({
#             'query': data['query'],
#             'embedding': embedding,
#             'result': documents
#         })

class ChatHistoryAPI(generics.ListAPIView):
    permission_classes=[IsAuthenticated,]
    queryset = ChatModel.objects.all()
    serializer_class = ChatHistorySerializer
    
    filter_backends = [DjangoFilterBackend]
    
    def get_queryset(self):
        temp_books_remover()
        
        user = self.request.user
        default_chat_agent = ChatAgentModel.objects.all().order_by("created_at").first()
        
        queryset = super().get_queryset().filter(agent= default_chat_agent, user = user)
        
        return queryset
    
    @method_decorator(cache_page(10)) # 10 seconds
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
    
        
class AIChatApi(APIView):
    permission_classes=[IsAuthenticated,]
    
    
    def post(self, request: Request):
        temp_books_remover()
        data = request.data
        
        default_chat_agent = ChatAgentModel.objects.all().order_by("created_at").first()
        user = self.request.user
        
        serializer = AIChatSerializer(data=data)
        if serializer.is_valid():
            query = serializer.validated_data.get("query")
            response = None
            try:
                # response = ChatManager.chat_with_ai(query, default_chat_agent, self.request.user)
                client = OpenAIAssistantManager.get_openai_client()
                response = OpenAIAssistantManager.chat_by_thread(client, user, default_chat_agent, query)
            except Exception as ex:
                return Response({
                    "non_field_errors": [
                            ex.__str__()
                        ]
                    }, status=status.HTTP_400_BAD_REQUEST)
            return Response(response)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                

class BooksListApi(generics.ListAPIView):
    permission_classes=[IsAuthenticated, IsAdminUser,]
    serializer_class = BooksListSerializer
    queryset = BookModel.objects.all()
    
    
    @method_decorator(cache_page(10)) # 10 seconds
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
    
    

class BooksUploadApi(APIView):
    permission_classes=[IsAuthenticated, IsAdminUser,]
    
    # adding books to database for AI consumption
    def post(self, request: Request):
        data = request.data
        files = request.FILES
        
            
        serializer = BooksUploadSerializer(data=data, context={
            "admin": self.request.user
        })
        if serializer.is_valid():
            return Response("Books Uploaded Successfully!")
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        


# AUTHENTICATION API
class UserRegistrationApi(APIView):
    def post(self, request: HttpRequest):
        data = request.data
        
        serializer = UserDetailSerializer(data=data)
        if serializer.is_valid():
            user = serializer.validated_data
            email = serializer.validated_data.get("email")
            password = serializer.validated_data.get("password")
            
            serializer.save()
            
            user_model = authenticate(email=email, password=password)
            print(user_model)
            
            
            manager = TokenManager(request)
            token = manager.get_token(email, password)
                
            if token is None:
                return Response(data={
                        "non_field_errors": [
                            "Unable to Generate Token"
                        ]
                    },status=status.HTTP_400_BAD_REQUEST)
                
            return Response(data={
                    "token": token,
                    "user": UserDetailSerializer(instance=user_model).data
                    }, status=status.HTTP_201_CREATED)
        
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserLoginApi(APIView):
    def post(self, request: HttpRequest):
        data = request.data
        print(timezone.now())
        start = time.time()
        
        serializer = UserLoginSerializer(data=data)
        if serializer.is_valid():
            email = serializer.validated_data.get("email")
            password = serializer.validated_data.get("password")
            print(email, password)
            
            duration = (time.time() - start) * 1000
            print("Validation: ", duration, " ms")
            start = time.time()
            user = authenticate(email=email, password=password)
            duration = (time.time() - start) * 1000
            print("Authentication: ", duration, " ms")
            
            
            if user is not None:
                start = time.time()
                # token = get_user_token(user)
                manager = TokenManager(request)
                token = manager.get_token(email, password)
                
                if token is str:
                    return Response({
                        "non_field_errors": [
                            token
                        ]
                    },status=status.HTTP_400_BAD_REQUEST)

                duration = (time.time() - start) * 1000
                print("Token generation: ", duration, " ms")
                
                print(timezone.now())
                return Response(data={
                    "token": token,
                    "user": UserDetailSerializer(instance=user).data
                    }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "non_field_errors": [
                        "Email or Password is incorrect."
                    ]
                },status=status.HTTP_400_BAD_REQUEST)
                
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserSocialLoginApi(CsrfExemptMixin, OAuthLibMixin, APIView):
    """
    Implements an endpoint to convert a provider token to an access token

    The endpoint is used in the following flows:

    * Authorization code
    * Client credentials
    """

    server_class = SocialTokenServer
    validator_class = oauth2_settings.OAUTH2_VALIDATOR_CLASS
    oauthlib_backend_class = KeepRequestCore
    permission_classes = (AllowAny,)

    def get_user(self, access_token: str):
        token = AccessToken.objects.filter(token=access_token).first()
        return token.user if token else None


    @transaction.atomic
    def post(self, request: Request, backend, *args, **kwargs):
        
        
        
        serializer = UserSocialLoginSerializer(data=request.data)
        if serializer.is_valid():
            payload = {
                   'grant_type':'convert_token',
                   'backend': backend,
                   'client_id': DEFAULT_AUTH_CLIENT_KEY,
                   'token': serializer.validated_data.get("access_token"),
                   "email": "email@email.com"
               }
            print(payload)
            
            serializer = ConvertTokenSerializer(data=payload)
            serializer.is_valid(raise_exception=True)

            application = get_application(serializer.validated_data)
            print(application)
            if not application:
                return Response("The application for this client_id does not exist.",status=status.HTTP_400_BAD_REQUEST)
            
            # Use the rest framework `.data` to fake the post body of the django request.
            request._request.POST = request._request.POST.copy()
            request._request.POST['client_secret'] = application.client_secret
            for key, value in serializer.validated_data.items():
                request._request.POST[key] = value

            
            try:
                url, headers, body, statusResponse = self.create_token_response(request._request)
                
            except InvalidClientError:
                return Response('Missing client type.',
                    status=status.HTTP_400_BAD_REQUEST,
                )
            except MissingClientIdError as ex:
                return Response(ex.description,
                    status=status.HTTP_400_BAD_REQUEST,
                )
            except InvalidRequestError as ex:
                return Response(ex.description,
                    status=status.HTTP_400_BAD_REQUEST,
                )
            except UnsupportedGrantTypeError:
                return Response('Missing grant type.',
                    status=status.HTTP_400_BAD_REQUEST,
                )
            except AccessDeniedError:
                return Response(f'The token you provided is invalid or expired.',
                    status=status.HTTP_400_BAD_REQUEST,
                )
            except IntegrityError as e:
                if 'email' in str(e) and 'already exists' in str(e):
                    return Response('A user with this email already exists.',
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                else:
                    return Response('Database error.',
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            except Exception as e:
                return Response(str(e),
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
                
                
            tokens = json.loads(body)
            user = self.get_user(tokens.get('access_token'))
            
            return Response(data={
                "token": tokens,
                "user": UserDetailSerializer(instance=user).data
            }, status=status.HTTP_200_OK)
        
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserVerifyApi(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request: HttpRequest):
        user = self.request.user
        
        return Response(data={
                "user": UserDetailSerializer(instance=user).data
            }, status=status.HTTP_200_OK)
        
class UserProfileUpdateApi(APIView):
    
    permission_classes = [IsAuthenticated]

    def put(self, request: HttpRequest):
        data = request.data
        
        serializer = UserProfileSerializer(instance=request.user, data=data, partial=True, context={
            "user_model": request.user
        })
        if serializer.is_valid():
            user = serializer.validated_data
            
            user_model = serializer.save()
            print(user_model)
            
            return Response(data="User updated successfully!", status=status.HTTP_200_OK)
        
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserPasswordChangeApi(APIView):
    
    permission_classes = [IsAuthenticated]

    def put(self, request: HttpRequest):
        data = request.data
        
        serializer = UserChangePasswordSerializer(instance=request.user, data=data)
        if serializer.is_valid():
            current_user = request.user
            password = serializer.validated_data.get("password")
            current_user.set_password(password)
            current_user.save()
            
            # user_model = serializer.save()
            print("Changed Password: ", current_user)
            
            return Response(data="User password changed successfully!", status=status.HTTP_200_OK)
        
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserPasswordForgotApi(APIView):
    
    def post(self, request: HttpRequest):
        data = request.data
        
        serializer = UserPasswordForgotSerializer(data=data)
        if serializer.is_valid():
            return Response(data="Email sent successfully!", status=status.HTTP_200_OK)
        
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserPasswordResetApi(APIView):
    def get(self, request: HttpRequest, uid, token):
        data = request.data
        
        user = TokenManager.check_reset_token_uid(uid, token)
        if user is not None:
            return Response(data="Password Reset Token is Valid!", status=status.HTTP_200_OK)
        
        return Response(data="Invalid Data!", status=status.HTTP_400_BAD_REQUEST)

    def post(self, request: HttpRequest, uid, token):
        data = request.data
        
        serializer = UserPasswordResetSerializer(data=data, context={
            'uid': uid,
            'token': token
        })
        if serializer.is_valid():
            
            # user_model = serializer.save()
            # print("Changed Password: ", current_user)
            
            return Response(data="Password has been reset successfully!", status=status.HTTP_200_OK)
        
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)
