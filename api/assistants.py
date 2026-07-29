import time
from openai import OpenAI
from api.models import *
from core.settings import OPENAI_API_KEY, OPENAI_ASSISTANT_ID, OPENAI_VECTOR_STORE_ID
from django.core.exceptions import ValidationError
from typing import List
from api.utils import FileManager

ASSISTANT_NAME = "Law Assistant"
ASSISTANT_INSTRUCTIONS = "You are my personal law assistant for my docs. Use your knowledge base to answer questions about my documents."
VECTOR_STORE_NAME = "Law Assistant Vector Store"

class OpenAIAssistantManager:
        
    @staticmethod
    def upload_files_vector_store(book_model: BookModel):
        file_stream = None    
        with FileManager.open(book_model.file.name, "rb") as file:
            file_content = file.read()
            actual_name = book_model.file.name.split("/")[-1]
            print(f"Uploading file: {actual_name}")
            file_stream = (book_model.name, file_content)
        
        client = OpenAIAssistantManager.get_openai_client()
        vector_store = OpenAIAssistantManager.get_vector_stores(client)

        # Upload the file to the vector store
        file = client.beta.vector_stores.files.upload_and_poll(
            vector_store_id=vector_store.id, 
            file=file_stream
        )
        
        if file.status == 'completed':
            print("File upload complete.")
            book_model.file_id = file.id 
            book_model.save()
        else:
            raise ValidationError("File upload failed.")

        return "Books Uploaded Successfully!"
    
    @staticmethod
    def chat_by_thread(client: OpenAI, user: UserModel, agent: ChatAgentModel, query: str):
        thread_id = user.thread_id
        
        # Create a message in the thread
        message = client.beta.threads.messages.create(
            thread_id=thread_id,
            role="user",
            content=query,
        )
        
        # Run the query against the AI model
        run = client.beta.threads.runs.create_and_poll(
            assistant_id=OPENAI_ASSISTANT_ID,
            thread_id=thread_id,
            # additional_instructions=ASSISTANT_INSTRUCTIONS,
            tool_choice={"type": "file_search"}  # Using file search tool
        )
        
        print(f"Run completed with status: {run.status}")
        
        if run.status == "completed":
            messages = client.beta.threads.messages.list(thread_id=thread_id)
            for message in messages:
                assert message.content[0].type == "text"
                
                ai_result = message.content[0].text.value
                
                # Prepare formatted references
                ref_list = []
                file_ids = []
                for idx, annotation in enumerate(message.content[0].text.annotations, start=1):
                    file_id = annotation.file_citation.file_id
                    # file_ids.append(file_id)
                    original_ref_text = annotation.text
                    
                    # Create a new reference marker
                    # new_marker = f" [{idx}] "
                    # ai_result = ai_result.replace(original_ref_text, new_marker)
                    ai_result = ai_result.replace(original_ref_text,"")
                    
                    # file_name = book_model.file.name.split("/")[-1]
                        
                    # # Append the formatted reference to ref_list
                    # ref_list.append(f"【{idx}】: {file_name} ({original_ref_text})")
                    
                # Combine references into a single formatted string and append to the response
                # if ref_list:
                #     formatted_references = "\n".join(ref_list)
                #     ai_result += f"\n\nReferences:\n{formatted_references}"
                    
                print(f"Role: {message.role.capitalize()}")
                print("Message:")
                print(ai_result + "\n") 

                # Save the chat exchange
                ChatModel.objects.create(agent=agent, user=user, exchange_type='HUMAN', content=query)
                ChatModel.objects.create(agent=agent, user=user, exchange_type='AI', content=ai_result)

                return {
                    "query": query,
                    "result": ai_result,
                }

        else:
            raise ValidationError("Some Error Occurred!")
        
    @staticmethod
    def get_openai_client():
        return OpenAI(api_key=OPENAI_API_KEY)
    
    @staticmethod
    def delete_vector_store_items(client: OpenAI, file_id: str):
        return client.beta.vector_stores.files.delete(vector_store_id=OPENAI_VECTOR_STORE_ID, file_id=file_id)
        
    @staticmethod
    def get_assistant(client: OpenAI):
        return client.beta.assistants.retrieve(assistant_id=OPENAI_ASSISTANT_ID)
    
    @staticmethod
    def get_vector_stores(client: OpenAI):
        return client.beta.vector_stores.retrieve(vector_store_id=OPENAI_VECTOR_STORE_ID)
    
    # @staticmethod
    # def create_assistant(client: OpenAI, admin: UserModel, vector: VectorStoreModel):
        
    #     assistant = client.beta.assistants.create(
    #         name=ASSISTANT_NAME,
    #         instructions=ASSISTANT_INSTRUCTIONS,
    #         model="gpt-4o",
    #         tools=[{
    #             "type": "file_search"
    #         }],
    #         tool_resources={
    #             "file_search": {
    #                 "vector_store_ids": [vector.vector_id]
    #             }
    #         }
    #     )
        
    #     as_model = AssistantModel.objects.create(
    #         assistant_id = assistant.id,
    #         admin = admin,
    #         name = ASSISTANT_NAME,
    #         instructions=ASSISTANT_INSTRUCTIONS,
    #         vector=vector
    #     )
        
    #     return as_model
        
        
    # @staticmethod
    # def create_vector_store(client: OpenAI, admin: UserModel):
    #     vs = client.beta.vector_stores.create(name=VECTOR_STORE_NAME)
        
    #     vector_model = VectorStoreModel.objects.create(
    #         vector_id = vs.id,
    #         name= VECTOR_STORE_NAME,
    #     )
        
    #     return vector_model
        