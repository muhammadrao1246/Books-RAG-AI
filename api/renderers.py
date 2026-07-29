# from rest_framework import generics, status
# from rest_framework.utils import humanize_datetime
import datetime

from rest_framework.renderers import JSONRenderer

class ApiJsonRenderer(JSONRenderer):
    
    def render(self, data, accepted_media_type=None, renderer_context=None):
        
        RESPONSE_STRUCTURE = {
            "status": 200,
            "message": "OK",
            "data": {},
            "errors": {},
            "serverTime": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        }
        
        
        if renderer_context:
            response = renderer_context.get("response")
            if response is not None:
                RESPONSE_STRUCTURE["status"] = response.status_code
                RESPONSE_STRUCTURE["message"] = response.status_text
                # If response status is in the 200 range, populate the "data" field
                if 200 <= response.status_code < 300:
                    RESPONSE_STRUCTURE["data"] = response.data
                else:
                    # If there are errors, populate the "errors" field
                    RESPONSE_STRUCTURE["errors"] = response.data
                    
        
        return super().render(RESPONSE_STRUCTURE, accepted_media_type, renderer_context)
    
# Creating a Response Structure for all API responses
# class ApiResponseRenderer:
    
#     RESPONSE_STRUCTURE = {
#             "status": None,
#             "message": None,
#             "data": {},
#             "errors": {},
#             # "fields": self.queryset.model._meta.get_fields().__str__(),
#             # "next": [k for k in response.data.keys()],
#             "serverTime": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
#     }
    
#     def structure(request, response, errors, *args, **kwargs):
#         # response = super().li(self, request, response, *args, **kwargs) 
        
#         # checking for errors while going from API Views
        
#         # result_data = self.RESPONSE_STRUCTURE.copy()
#         self.RESPONSE_STRUCTURE["status"] = response.status_code
#         self.RESPONSE_STRUCTURE["message"] = response.status_text
#         self.RESPONSE_STRUCTURE["data"] = (response.data if len(errors) == 0 else [])
#         self.RESPONSE_STRUCTURE["errors"] = (errors if len(errors) > 0 else [])
        
#         response.data = self.RESPONSE_STRUCTURE

#         return response