from langchain_community.document_loaders import PyPDFLoader
# , PyMuPDFLoader, DedocPDFLoader, UnstructuredPDFLoader

# text splitting
from langchain_text_splitters import RecursiveCharacterTextSplitter
# from langchain_experimental.text_splitter import SemanticChunker

# for embeddings
from langchain_openai.embeddings import OpenAIEmbeddings

# vector store
from langchain_community.vectorstores.pgvector import PGVector

from .models import *
from .decorators import timer_func

from core.settings import *


# EMBEDDING_MODEL="text-embedding-ada-002"
EMBEDDING_MODEL = "text-embedding-3-large"
CHUNK_SIZE=1500 # 300 - 500 tokens
CHUNK_OVERLAP=500 # 100 - 150 tokens (20-30%)
POSTGRES_DRIVER="psycopg2"
POSTGRES_CONNECTION_STRING = PGVector.connection_string_from_db_params(
    driver= POSTGRES_DRIVER,
    host=env('DB_HOST'),
    port=env('DB_PORT'),
    database=env('DB_DATABASE'),
    user=env('DB_USERNAME'),
    password=env('DB_PASSWORD'),
)

        
class VectorStoreManager:

    def __init__(self, book_model: BookModel) -> None:
        self.book_model = book_model
        # self.admin = admin
        
        # self.splitter = SemanticChunker(embeddings=embeddings)
        self.splitter = RecursiveCharacterTextSplitter(chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP)

        file_path = get_complete_url(book_model.file.url)
        self.load_document(file_path)
        self.get_splitted_document_texts_chunks()
        self.create_and_save_embeddings()

    @timer_func
    def load_document(self, file_path):
        # print("Loading Document through Loader")
        loader = PyPDFLoader(file_path=file_path)
        self.documents = loader.load()
        print("Total Documents Loaded per Page: ", len(self.documents))
        print(self.documents[0], "\n\n")

    @timer_func
    def get_splitted_document_texts_chunks(self):
        # print("Splitting Documents into Text Chunks")
        splitter = self.splitter
        self.documents_texts_subarray = splitter.split_documents(self.documents)
        
        print("Total Text Chunks Created: ", len(self.documents_texts_subarray))
        print(self.documents_texts_subarray[0])

    @timer_func
    def create_and_save_embeddings(self):
        # print("Creating Embeddings and Saving Them To Database")
        COLLECTION_NAME = self.book_model.slug
        embeddings = OpenAIEmbeddings(model=EMBEDDING_MODEL, api_key=OPENAI_API_KEY)
        db = PGVector.from_documents(
            connection_string=POSTGRES_CONNECTION_STRING,
            embedding=embeddings,
            documents=self.documents_texts_subarray,
            collection_name=COLLECTION_NAME,
        )
        
        print(f"Pages: {len(self.documents)}")
        
    @staticmethod
    def get_embedding(query: str):
        embeddings = OpenAIEmbeddings(model=EMBEDDING_MODEL, api_key=OPENAI_API_KEY)
        response = embeddings.embed_query(query)

        return response