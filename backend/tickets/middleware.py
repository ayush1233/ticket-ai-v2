import time
import logging
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
from rest_framework.renderers import JSONRenderer

logger = logging.getLogger(__name__)

class V2RequestLoggingMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if hasattr(settings, 'DEBUG') and settings.DEBUG:
            request.start_time = time.time()
            # We don't log the body here because reading request.body can cause issues later in the stack if not careful
            logger.info(f"V2 Request: {request.method} {request.get_full_path()}")

    def process_response(self, request, response):
        if hasattr(settings, 'DEBUG') and settings.DEBUG and hasattr(request, 'start_time'):
            processing_time = int((time.time() - request.start_time) * 1000)
            logger.info(f"V2 Response: {response.status_code} in {processing_time}ms")
            
            # For V2 API endpoints, wrap the response
            if request.path.startswith('/api/v2/'):
                if hasattr(response, 'data'):
                    original_data = response.data
                    # Prevent double wrapping
                    if isinstance(original_data, dict) and 'version' in original_data and original_data['version'] == 'v2':
                        return response

                    # Wrap response
                    wrapped_data = {
                        "data": original_data,
                        "version": "v2",
                        "timestamp": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
                        "processing_time_ms": processing_time
                    }
                    response.data = wrapped_data
                    
                    # Need to re-render the content
                    response.content = JSONRenderer().render(wrapped_data)
        
        return response
