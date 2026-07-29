from django.core.management.base import BaseCommand

from api.models import *
from api.assistants import OpenAIAssistantManager
from django.db import transaction

class Command(BaseCommand):
    help = 'Delete Books'

    @transaction.atomic
    def handle(self, *args, **options):
        
        client = OpenAIAssistantManager.get_openai_client()
        for books in BookModel.objects.all():
            OpenAIAssistantManager.delete_vector_store_items(client, books.file_id)
        
        BookModel.objects.all().delete()
        LangchainPgCollection.objects.all().delete()
        LangchainPgEmbedding.objects.all().delete()
        
        self.stdout.write('Deleted Books Successfully!')