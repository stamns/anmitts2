"""
anmitts2 TTS Web Application

This is a Flask-based web server that serves the Vue 3 frontend UI
for the anmitts2 TTS (Text-to-Speech) application.

Usage:
    python app.py

The application will be available at http://localhost:5000
"""

from flask import Flask, render_template_string
from worker import get_html_content

app = Flask(__name__)


@app.route('/')
def index():
    """Serve the Vue 3 frontend application"""
    html_content = get_html_content()
    return html_content


@app.route('/api/health')
def health():
    """Health check endpoint"""
    return {'status': 'ok', 'message': 'anmitts2 TTS UI is running'}


if __name__ == '__main__':
    # Run the Flask development server
    # For production, use gunicorn or similar
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=False,
        threaded=True
    )
