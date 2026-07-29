from django.core.management.base import BaseCommand
from api.embeddings import POSTGRES_CONNECTION_STRING, EMBEDDING_MODEL

from api.models import *


# for embeddings
from langchain_openai.embeddings import OpenAIEmbeddings

# vector store
from langchain_community.vectorstores.pgvector import PGVector

class Command(BaseCommand):
    help = 'Populating DB with default Data'

    def handle(self, *args, **options):
        embeddings = OpenAIEmbeddings(model=EMBEDDING_MODEL, api_key=OPENAI_API_KEY)
        db = PGVector.from_documents(
            connection_string=POSTGRES_CONNECTION_STRING,
            embedding=embeddings,
            documents=[],
            use_jsonb=True
        )
        self.stdout.write('Langchain tables created successfully!')