#!/usr/bin/env python3
"""
Assignment Application - API Testing Interface
Flask app for testing Kore.ai Smart Assist API integration
"""

from flask import Flask, render_template, request, jsonify
import requests
import json
import jwt
import time
import logging

app = Flask(__name__)
app.secret_key = 'assignment_api_test'

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AssignmentAPITester:
    def __init__(self):
        self.assignment_requirements = {
            'smart_assist_app_id': 'st-b20b30fd-b75c-51cf-b95a-df9477562144',
            'smart_assist_client_id': 'cs-7828199c-cef7-5c0d-a8f2-b476d99f6d7e',
            'smart_assist_client_secret': 'IaSIDMyZoOo91k9EyXwY1+coAJzoBz7Aa0lPoPy/QCQ=',
            'api_endpoint': 'https://platform.kore.ai/api/public/bot/{app_id}/search/v2/advanced-search'
        }

    def generate_jwt_token(self, client_id, client_secret):
        """Generate JWT token as required by Kore.ai"""
        try:
            payload = {
                "iat": int(time.time()),
                "exp": int(time.time()) + 3600,
                "jti": f"{client_id}-{int(time.time())}",
                "aud": "https://idproxy.kore.ai/authorize",
                "iss": client_id,
                "sub": "test@example.com",
                "appId": client_id,
                "isAnonymous": False
            }
            token = jwt.encode(payload, client_secret, algorithm="HS256")
            return token
        except Exception as e:
            logger.error(f"JWT generation failed: {e}")
            return None

    def get_sample_queries(self):
        """Return sample queries for testing"""
        return [
            "How to prepare dark chocolate almond bars?",
            "What are almonds rich in?",
            "I have maple syrup with me. What can I do?",
            "How long can I store chocolate mousse pie?",
            "What are the healthy food tips?",
            "What should be the amount of water consumed per day?",
            "What are the food items rich in vitamin C?",
            "What are the vegan recipes that I can prepare?",
            "Which recipes require coconut whipped cream?",
            "What are the ingredients required to prepare banana bread?"
        ]

api_tester = AssignmentAPITester()

@app.route('/')
def clean_test():
    """Clean API testing interface with CURL generation - MAIN PAGE"""
    return render_template('clean.html')

@app.route('/original')
def api_test():
    """Original API testing interface"""
    sample_queries = api_tester.get_sample_queries()
    api_endpoint = api_tester.assignment_requirements['api_endpoint']
    return render_template('api_test.html',
                         queries=sample_queries,
                         api_endpoint=api_endpoint)

@app.route('/simple')
def simple_test():
    """Simple API testing interface"""
    return render_template('simple.html')

@app.route('/api/test-search', methods=['POST'])
def test_search():
    """Test API endpoint - makes real API calls to Smart Assist"""
    try:
        data = request.get_json()
        query = data.get('query', '')
        app_id = data.get('app_id', api_tester.assignment_requirements['smart_assist_app_id'])
        provided_token = data.get('auth_token', '').strip()

        if not query:
            return jsonify({'error': 'Query is required'}), 400

        # Use provided token or generate JWT token
        auth_token = provided_token
        if not auth_token:
            client_id = api_tester.assignment_requirements['smart_assist_client_id']
            client_secret = api_tester.assignment_requirements['smart_assist_client_secret']
            auth_token = api_tester.generate_jwt_token(client_id, client_secret)

            if not auth_token:
                return jsonify({
                    'error': 'Failed to generate authentication token',
                    'message': 'Please provide a valid JWT token or check your credentials'
                }), 401

        # Clean token
        clean_token = auth_token.replace('Bearer ', '').strip()

        # Try multiple authentication approaches (reordered - working method first!)
        auth_methods = [
            {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'auth': clean_token
            },
            {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-API-Key': clean_token
            },
            {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': f'Bearer {clean_token}'
            }
        ]

        payload = {
            "query": query,
            "answerSearch": True,
            "searchResults": True,
            "metaFilters": [],
            "isFacetsEnable": True,
            "customData": {
                "location": "API_Test",
                "userIdentity": "test@example.com"
            },
            "includeChunksInResponse": True
        }

        # Build API URL
        api_url = api_tester.assignment_requirements['api_endpoint'].format(app_id=app_id)
        api_url_with_params = f"{api_url}?AppID={app_id}"

        # Try each authentication method
        for i, headers in enumerate(auth_methods):
            try:
                response = requests.post(api_url_with_params, headers=headers, json=payload, timeout=30)

                if response.status_code == 200:
                    api_response = response.json()

                    # Log full response to debug what we're getting (commented out - too verbose)
                    # logger.info(f"FULL API RESPONSE: {json.dumps(api_response, indent=2)}")

                    # Extract the actual answer from the nested structure
                    actual_answer = api_response.get('template', {}).get('answer_details', {}).get('response', {}).get('answer')

                    # Enhanced response analysis - handle both response formats
                    analysis = {
                        'has_answer': bool(actual_answer),
                        'answer_text': actual_answer[:200] + "..." if actual_answer and len(actual_answer) > 200 else actual_answer,
                        'has_search_results': bool(api_response.get('searchResults') or api_response.get('template', {}).get('results', {}).get('web', {}).get('data')),
                        'search_results_count': len(api_response.get('searchResults', []) or api_response.get('template', {}).get('results', {}).get('web', {}).get('data', [])),
                        'has_chunks': bool(api_response.get('chunks') or api_response.get('template', {}).get('chunk_result')),
                        'chunks_count': len(api_response.get('chunks', []) or api_response.get('template', {}).get('chunk_result', [])),
                        'response_keys': list(api_response.keys()) if api_response else [],
                        'is_empty_response': not any([
                            actual_answer,
                            api_response.get('searchResults'),
                            api_response.get('template', {}).get('results', {}).get('web', {}).get('data'),
                            api_response.get('chunks'),
                            api_response.get('template', {}).get('chunk_result')
                        ])
                    }

                    logger.info(f"API Response Analysis: {analysis}")

                    return jsonify({
                        'success': True,
                        'message': f'Smart Assist API call successful (Method {i+1})',
                        'auth_method': f'Method {i+1}',
                        'query': query,
                        'app_id': app_id,
                        'response': api_response,
                        'analysis': analysis,
                        'debug_info': {
                            'api_url': api_url_with_params,
                            'request_payload': payload,
                            'response_status': response.status_code,
                            'response_headers': dict(response.headers),
                            'client_id': client_id,
                            'auth_header_used': list(headers.keys())[2] if len(headers.keys()) > 2 else 'auth'
                        }
                    })
                elif response.status_code == 401:
                    continue
                elif response.status_code == 404:
                    return jsonify({
                        'error': 'API endpoint not found',
                        'details': 'Please verify your App ID is correct and the Smart Assist app is published',
                        'api_endpoint': api_url_with_params,
                        'status_code': response.status_code
                    }), 404
                else:
                    continue

            except requests.exceptions.RequestException:
                continue

        # If all methods failed
        return jsonify({
            'error': 'All authentication methods failed',
            'suggestion': 'Check your Smart Assist credentials and ensure the app is published',
            'api_endpoint': api_url_with_params,
            'tried_methods': len(auth_methods)
        }), 401

    except Exception as e:
        return jsonify({'error': f"Server error: {str(e)}"}), 500

@app.route('/api/generate-jwt', methods=['POST'])
def generate_jwt():
    """Generate JWT token from client credentials"""
    try:
        data = request.get_json()
        client_id = data.get('client_id', '').strip()
        client_secret = data.get('client_secret', '').strip()

        if not client_id or not client_secret:
            return jsonify({'error': 'Client ID and Client Secret are required'}), 400

        jwt_token = api_tester.generate_jwt_token(client_id, client_secret)

        if jwt_token:
            return jsonify({
                'success': True,
                'message': 'JWT token generated successfully',
                'token_preview': f"{jwt_token[:10]}...{jwt_token[-4:]}" if len(jwt_token) > 14 else "****",
                'token': jwt_token
            })
        else:
            return jsonify({'error': 'Failed to generate JWT token'}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    import sys
    import os

    # For Replit deployment
    port = int(os.environ.get('PORT', 8080))
    host = '0.0.0.0'  # Replit requires 0.0.0.0

    # Override with command line args if provided
    if len(sys.argv) > 1 and sys.argv[1].startswith('--port'):
        if '=' in sys.argv[1]:
            port = int(sys.argv[1].split('=')[1])
        elif len(sys.argv) > 2:
            port = int(sys.argv[2])
        host = '127.0.0.1'  # Local development

    app.run(debug=True, host=host, port=port)