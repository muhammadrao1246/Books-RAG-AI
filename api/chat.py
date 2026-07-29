from api.models import ChatAgentModel, LangchainPgEmbedding, LangchainPgCollection, ChatModel, UserModel
from .embeddings import VectorStoreManager, OPENAI_API_KEY, POSTGRES_CONNECTION_STRING, EMBEDDING_MODEL

from pgvector.django import L2Distance


from langchain.chains.history_aware_retriever import create_history_aware_retriever
from langchain.chains.retrieval import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.retrievers.merger_retriever import MergerRetriever

from langchain_core.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate, MessagesPlaceholder

from langchain_community.vectorstores.pgvector import PGVector

from langchain_openai.embeddings import OpenAIEmbeddings

from langchain_openai import ChatOpenAI

from django.db import transaction

class ChatManager:
    @staticmethod
    def get_retrievers():
        embeddings = OpenAIEmbeddings(model=EMBEDDING_MODEL, api_key=OPENAI_API_KEY)
        retrievers_list = []
        for collection in LangchainPgCollection.objects.all():
            retrievers_list.append(
                PGVector(
                    connection_string=POSTGRES_CONNECTION_STRING,
                    embedding_function=embeddings,
                    collection_name=collection.name
                ).as_retriever(search_type="similarity", search_kwargs={"k": 7})
            )
        
        if not retrievers_list:
            raise FileNotFoundError("No Books Uploaded Yet!")
        
        return MergerRetriever(retrievers=retrievers_list)
    
    @staticmethod
    def get_relevant_documents(query_embedding, top_k=5):
        similars = LangchainPgEmbedding.objects.order_by(
            L2Distance("embedding", query_embedding)
        )[:top_k]
        return [similar.document for similar in similars]

    @staticmethod
    @transaction.atomic
    def chat_with_ai(user_query, agent: ChatAgentModel, user: UserModel):
        
        retriever = ChatManager.get_retrievers()
        
        # Set up the LLM and prompt templates
        llm = ChatOpenAI(model="gpt-4o-mini", api_key=OPENAI_API_KEY)
        
        # Step 1: Contextualize question for standalone understanding
        contextualize_q_system_prompt = (
            "Given the chat history and the user's latest question, "
            "formulate a standalone question understandable without chat history. "
            "Return it as is if it does not need reformulation."
        )
        contextualize_q_prompt = ChatPromptTemplate.from_messages(
            [
                ("system", contextualize_q_system_prompt),
                MessagesPlaceholder("chat_history"),
                ("human", "{input}")
            ]
        )
        
        # Step 2: Set up history-aware retriever
        primary_retriever = retriever  # Example usage of the first retriever
        history_aware_retriever = create_history_aware_retriever(
            llm, primary_retriever, contextualize_q_prompt
        )

        # Step 3: Set up QA system prompt
        # qa_system_prompt = (
        #     # "You are an assistant for question-answering tasks. Use "
        #     # "the retrieved context to answer the question. "
        #     # "If unsure, say 'I don't know'. Keep the answer concise and informative."
            
        #     "Use the context provided to answer the question accurately in the detected language.",
        #     "Detect language carefully and answer in a conversational manner.",
        #     "PDF content is provided for question similarity matching; ensure accuracy.",
        #     "Quote specific references, laws, equations, or religious texts accurately when applicable.",
        #     "If context lacks answer, respond with 'I don't know'.",
        #     "{context}"
        # )
        # qa_system_prompt = """Use the context provided to answer the question accurately in the detected language.
        # Detect language carefully and answer in a conversational manner.
        # PDF content is provided for question similarity matching; ensure accuracy.
        # Quote specific references, laws, equations, or religious texts accurately when applicable.
        # If context lacks answer, respond with 'I don't know'.
        # {context}"""
        qa_system_prompt = """You are an assistant who only provides answers based on the provided context and chat history.
        Answer basic conversational questions.
Do not rely on outside knowledge, and respond with don't know response by also providing some context paragraphs given or only return 'I don't know' if the context is insufficient.
Answer in the detected language and conversational tone.
{context}"""
        qa_prompt = ChatPromptTemplate.from_messages(
            [
                ("system", qa_system_prompt),
                MessagesPlaceholder("chat_history"),
                ("human", "{input}")
            ] 
        )
        
        # Step 4: Combine retrieved context and run the conversational retrieval chain
        question_answer_chain = create_stuff_documents_chain(llm, qa_prompt)
        rag_chain = create_retrieval_chain(history_aware_retriever, question_answer_chain)
        
        # Maintain chat history
        chat_history = []
        previous_chats = ChatModel.objects.filter(agent=agent, user=user).order_by('created_at')[:20]
        for chat in previous_chats:
                if chat.exchange_type == "HUMAN":
                    chat_history.append({"role": "user", "content": chat.content})
                else:
                    chat_history.append({"role": "assistant", "content": chat.content})
        
        # Generate response with the RAG chain
        response = rag_chain.invoke({"input": user_query, "chat_history": chat_history})

        # Save each interaction
        
        ch = ChatModel.objects.create(agent=agent, user=user, exchange_type='HUMAN', content=user_query)
        ChatModel.objects.create(agent=agent, user=user, exchange_type='AI', content=response['answer'])

        print(response)
        
        return {
            "query": user_query,
            "result" : response['answer'],
            "sources": [
                {
                    "link": doc.metadata["source"],
                    "page": doc.metadata["page"]
                }
            for doc in response['context']]
        }