"""
anmitts2 TTS Web UI Worker

This module provides a Worker class that integrates the Vue 3 frontend UI
with the TTS API backend. It handles HTTP requests and serves the HTML content.
"""

import json
from pathlib import Path


class TTSWorker:
    """Worker for serving TTS web UI and handling API requests"""
    
    def __init__(self):
        """Initialize the TTS Worker"""
        self.html_content = None
    
    def get_html_content(self):
        """
        Get the Vue 3 frontend HTML content for the TTS web UI.
        
        Returns:
            str: The complete HTML content with Vue 3 application
        """
        if self.html_content is None:
            html_path = Path(__file__).parent / 'index.html'
            with open(html_path, 'r', encoding='utf-8') as f:
                self.html_content = f.read()
        
        return self.html_content
    
    def handle_request(self, request_method, request_path, request_body=None, headers=None):
        """
        Handle incoming HTTP requests.
        
        Args:
            request_method (str): HTTP method (GET, POST, etc.)
            request_path (str): Request path
            request_body (str, optional): Request body for POST requests
            headers (dict, optional): Request headers
        
        Returns:
            tuple: (status_code, response_headers, response_body)
        """
        headers = headers or {}
        
        # Serve HTML for root path or any GET request to /
        if request_method == 'GET' and (request_path == '/' or request_path == ''):
            html = self.get_html_content()
            return (
                200,
                {'Content-Type': 'text/html; charset=utf-8'},
                html
            )
        
        # Return 404 for unknown paths
        return (
            404,
            {'Content-Type': 'application/json'},
            json.dumps({'error': 'Not Found'})
        )


# Function to export for use in web servers
def get_html_content():
    """
    Standalone function to get HTML content.
    Can be used by Flask, FastAPI, or other web frameworks.
    
    Returns:
        str: The complete HTML content with Vue 3 application
    """
    worker = TTSWorker()
    return worker.get_html_content()
