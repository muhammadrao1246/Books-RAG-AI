
from django.contrib import admin
from django.urls import path, include, re_path
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.conf import settings
from django.conf.urls.static import static
# from drf_social_oauth2.urls import urlpatterns as drf_patterns

urlpatterns = [
    path('api/', include("api.urls")),
    # path('', include("players.urls")),
    
    re_path(r'^api/oauth/', include('drf_social_oauth2.urls', namespace='drf')),
    # path('admin/', admin.site.urls),
     
]+static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    
urlpatterns += staticfiles_urlpatterns()
