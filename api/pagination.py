from rest_framework import pagination


    
class EpisodePagination(pagination.CursorPagination):
    page_size_query_param = 'page_size'
    page_size = 30
    max_page_size=1000
    
    ordering = ['-created_at']

    
class ChapterPagination(pagination.CursorPagination):
    page_size_query_param = 'page_size'
    page_size = 30
    max_page_size=1000
    
    ordering = ["chapter_number"]
    
class ReelPagination(pagination.CursorPagination):
    page_size_query_param = 'page_size'
    page_size = 30
    max_page_size=1000
    
    ordering = ["reel_number"]