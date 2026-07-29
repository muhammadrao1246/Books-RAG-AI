from django.core.management.base import BaseCommand

from api.models import *
from oauth2_provider.models import Application
from core.settings import DEFAULT_AUTH_CLIENT_KEY, DEFAULT_AUTH_CLIENT_SECRET

class Command(BaseCommand):
    help = 'Populating DB with default Data'

    def handle(self, *args, **options):
        Application.objects.create(
            client_id=DEFAULT_AUTH_CLIENT_KEY,
            client_secret=DEFAULT_AUTH_CLIENT_SECRET,
            name="Default Application",
            user=UserModel.objects.filter(is_superuser=True).first(),
            authorization_grant_type="password",
            client_type="confidential",
            hash_client_secret=False
        )
        
        self.stdout.write('Default Application Created Successfully!')