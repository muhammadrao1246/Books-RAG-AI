from django.urls import path, re_path, include
from . import views

from rest_framework.urlpatterns import format_suffix_patterns

urlpatterns = [
    
    
    path("", views.Tester.as_view()),
    path("auth/register", views.UserRegistrationApi.as_view()),
    path("auth/login", views.UserLoginApi.as_view()),
    path("auth/login/social/<str:backend>", views.UserSocialLoginApi.as_view()),
    
    path("auth/verify", views.UserVerifyApi.as_view()),
    path("auth/change/password", views.UserPasswordChangeApi.as_view()),
    path("auth/forgot", views.UserPasswordForgotApi.as_view()),
    path("auth/reset/<str:uid>/<str:token>", views.UserPasswordResetApi.as_view()),
    path("auth/profile", views.UserProfileUpdateApi.as_view()),
    
    
    path("books/add", views.BooksUploadApi.as_view()),
    path("books", views.BooksListApi.as_view()),
    
    
    path("chats", views.ChatHistoryAPI.as_view()),
    path("chats/send", views.AIChatApi.as_view()),
    
    
    # path("chats/test", views.ChatDocumentsAPI.as_view()),
    
    
    # path("episodes/add", views.EpisodeSheetApi.as_view()),
    # path("episodes", views.EpisodeListApi.as_view()),
    # path("episodes/<str:uid>", views.EpisodeDetailApi.as_view()),
    
    # path("episodes/<str:episode_id>/chapters", views.ChapterListApi.as_view()),
    # path("episodes/<str:episode_id>/chapters/<str:uid>", views.ChapterDetailApi.as_view()),
        
    
    # path("episodes/<str:episode_id>/chapters/<str:chapter_id>/reels/add", views.ReelAddApi.as_view()),
    # path("episodes/<str:episode_id>/chapters/<str:chapter_id>/reels", views.ReelListApi.as_view()),
    # path("episodes/<str:episode_id>/chapters/<str:chapter_id>/reels/<str:uid>", views.ReelDetailApi.as_view()),
]

urlpatterns = format_suffix_patterns(urlpatterns)
