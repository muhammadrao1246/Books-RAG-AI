from django.core.management.base import BaseCommand

from api.models import *

class Command(BaseCommand):
    help = 'Reset Chats'

    def handle(self, *args, **options):
        ChatModel.objects.all().delete()
        
        self.stdout.write('Reset Chats Successfully!')