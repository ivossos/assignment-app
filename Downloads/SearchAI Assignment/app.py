#!/usr/bin/env python3
"""
Kore.ai Search AI Deployment Helper
Flask application to assist with Kore.ai Search AI configuration and deployment
"""

from flask import Flask, render_template, request, jsonify, redirect, url_for, flash
import csv
import requests
import json
import re
import os
from datetime import datetime
import logging
import jwt
import time

app = Flask(__name__)
app.secret_key = 'kore_ai_search_deployment_2024'

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class KoreAISearchHelper:
    def __init__(self):
        self.recipes_file = 'Recipes.csv'
        self.foods_file = 'Foods and importance.pdf'
        self.token_file = '.kore_token'
        self.assignment_requirements = {
            'app_name': 'Assignment App',
            'platform_url': 'https://platform.kore.ai/',
            'evaluator_email': 'sowmya.doddi@kore.com',
            'web_chunk_size': 550,
            'api_endpoint': 'https://platform.kore.ai/api/public/bot/<AppId>/search/v2/advanced-search',
            'auth_token': self.load_token(),
            'smart_assist_app_id': 'st-b20b30fd-b75c-51cf-b95a-df9477562144',
            'smart_assist_client_id': 'cs-7828199c-cef7-5c0d-a8f2-b476d99f6d7e',
            'smart_assist_client_secret': 'IaSIDMyZoOo91k9EyXwY1+coAJzoBz7Aa0lPoPy/QCQ='
        }

    def load_token(self):
        """Load token from file if exists"""
        try:
            if os.path.exists(self.token_file):
                with open(self.token_file, 'r') as f:
                    return f.read().strip()
        except Exception:
            pass
        return None

    def save_token(self, token):
        """Save token to file"""
        try:
            with open(self.token_file, 'w') as f:
                f.write(token)
            self.assignment_requirements['auth_token'] = token
            return True
        except Exception:
            return False

    def generate_jwt_token(self, client_id, client_secret):
        """Generate JWT token as required by Kore.ai"""
        try:
            # Kore.ai JWT payload format - exact format required
            payload = {
                "iat": int(time.time()),
                "exp": int(time.time()) + 3600,  # 1 hour expiry
                "jti": f"{client_id}-{int(time.time())}",  # JWT ID
                "aud": "https://idproxy.kore.ai/authorize",  # Exact audience
                "iss": client_id,      # Client ID as issuer
                "sub": "test@example.com",  # User email
                "appId": client_id,    # CRITICAL: exact format "appId"
                "isAnonymous": False
            }

            token = jwt.encode(payload, client_secret, algorithm="HS256")
            return token
        except Exception as e:
            logger.error(f"JWT generation failed: {e}")
            return None

    def load_recipes(self):
        """Load and filter recipes for vegan and chocolate content"""
        try:
            urls = []
            with open(self.recipes_file, 'r', encoding='utf-8-sig') as file:
                reader = csv.DictReader(file)
                for row in reader:
                    # Handle both 'url' and BOM-prefixed column names
                    url_key = None
                    for key in row.keys():
                        if 'url' in key.lower():
                            url_key = key
                            break

                    if url_key and row[url_key].strip():
                        urls.append(row[url_key].strip())

            # Filter for vegan and chocolate recipes
            vegan_chocolate_urls = []
            for url in urls:
                if any(keyword in url.lower() for keyword in ['vegan', 'chocolate']):
                    vegan_chocolate_urls.append(url)

            return {
                'total_urls': len(urls),
                'filtered_urls': len(vegan_chocolate_urls),
                'urls': vegan_chocolate_urls,
                'all_urls': urls
            }
        except Exception as e:
            logger.error(f"Error loading recipes: {e}")
            return {
                'total_urls': 0,
                'filtered_urls': 0,
                'urls': [],
                'all_urls': []
            }

    def generate_chunking_strategy(self):
        """Generate chunking strategies for web and file sources"""
        return {
            'web_sources': {
                'chunk_size': 550,
                'overlap': 50,
                'method': 'sentence_based',
                'metadata_extraction': ['title', 'url', 'timestamp'],
                'preprocessing': [
                    'remove_navigation',
                    'extract_main_content',
                    'clean_html_tags'
                ]
            },
            'file_sources': {
                'pdf_strategy': {
                    'chunk_method': 'structure_aware',
                    'preserve_headings': True,
                    'chunk_size': 'adaptive',
                    'extract_tables': True,
                    'extract_images': False
                },
                'text_strategy': {
                    'chunk_size': 400,
                    'overlap': 40,
                    'respect_paragraphs': True
                }
            }
        }

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

helper = KoreAISearchHelper()

@app.route('/')
def index():
    """Main dashboard"""
    recipes_data = helper.load_recipes()
    return render_template('index.html',
                         recipes_data=recipes_data,
                         requirements=helper.assignment_requirements)

@app.route('/recipes')
def recipes():
    """Recipe filtering and management"""
    recipes_data = helper.load_recipes()
    return render_template('recipes.html', recipes_data=recipes_data)

@app.route('/chunking')
def chunking():
    """Chunking strategy configuration"""
    strategy = helper.generate_chunking_strategy()
    return render_template('chunking.html', strategy=strategy)

@app.route('/api-test')
def api_test():
    """API testing interface"""
    sample_queries = helper.get_sample_queries()
    return render_template('api_test.html',
                         queries=sample_queries,
                         api_endpoint=helper.assignment_requirements['api_endpoint'])

@app.route('/deployment-guide')
def deployment_guide():
    """Step-by-step deployment guide"""
    steps = [
        {
            'number': 1,
            'title': 'Create Assignment App',
            'description': 'Create a new app in https://platform.kore.ai/ named "Assignment App"',
            'status': 'pending'
        },
        {
            'number': 2,
            'title': 'Configure URL Crawling',
            'description': 'Crawl vegan and chocolate recipes from the URL list',
            'status': 'pending'
        },
        {
            'number': 3,
            'title': 'Add Food Data Source',
            'description': 'Source data from "Foods and importance" file',
            'status': 'pending'
        },
        {
            'number': 4,
            'title': 'Configure Chunking',
            'description': 'Set up extraction models with proper chunking strategies',
            'status': 'pending'
        },
        {
            'number': 5,
            'title': 'Create Knowledge Index',
            'description': 'Configure knowledge index creation',
            'status': 'pending'
        },
        {
            'number': 6,
            'title': 'Choose LLM Model',
            'description': 'Select appropriate answer generation model',
            'status': 'pending'
        },
        {
            'number': 7,
            'title': 'Deploy Application',
            'description': 'Deploy the configured Search AI app',
            'status': 'pending'
        },
        {
            'number': 8,
            'title': 'Test API',
            'description': 'Test using advanced search public API',
            'status': 'pending'
        }
    ]
    return render_template('deployment.html', steps=steps)

@app.route('/troubleshooting')
def troubleshooting():
    """Troubleshooting guide for common issues"""
    issues = [
        {
            'question': 'How much time should I bake for perfect chocolate chip cookies?',
            'problem': 'Chunks qualified but no answer generated',
            'solutions': [
                'Check LLM model configuration and temperature settings',
                'Verify prompt engineering for answer generation',
                'Ensure chunk relevance scoring is properly tuned',
                'Review context window size for the LLM',
                'Check if chunks contain sufficient information for answering'
            ]
        },
        {
            'question': 'What are the calories of oats?',
            'problem': 'No chunks qualified despite having relevant data',
            'solutions': [
                'Adjust similarity threshold for chunk qualification',
                'Review embedding model configuration',
                'Check indexing strategy for numerical data',
                'Verify query preprocessing and normalization',
                'Ensure proper synonym handling for food items'
            ]
        }
    ]
    return render_template('troubleshooting.html', issues=issues)

@app.route('/api/filter-urls', methods=['POST'])
def filter_urls():
    """API endpoint to filter URLs based on criteria"""
    try:
        data = request.get_json()
        filter_type = data.get('filter', 'vegan_chocolate')

        recipes_data = helper.load_recipes()
        if not recipes_data:
            return jsonify({'error': 'Failed to load recipes'}), 500

        if filter_type == 'vegan_chocolate':
            return jsonify({
                'filtered_urls': recipes_data['urls'],
                'count': len(recipes_data['urls'])
            })
        else:
            return jsonify({
                'filtered_urls': recipes_data['all_urls'],
                'count': len(recipes_data['all_urls'])
            })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/test-search', methods=['POST'])
def test_search():
    """Test API endpoint - can make real API calls if token is configured"""
    try:
        data = request.get_json()
        query = data.get('query', '')
        app_id = data.get('app_id', 'st-b20b30fd-b75c-51cf-b95a-df9477562144')
        provided_token = data.get('auth_token', '').strip()

        # Use provided token from form, otherwise use stored token
        auth_token = provided_token or helper.assignment_requirements['auth_token']

        if not auth_token:
            # Generate JWT token using correct Smart Assist credentials
            client_id = helper.assignment_requirements['smart_assist_client_id']
            client_secret = helper.assignment_requirements['smart_assist_client_secret']

            jwt_token = helper.generate_jwt_token(client_id, client_secret)
            if jwt_token:
                auth_token = jwt_token
                helper.save_token(jwt_token)
            else:
                return jsonify({
                    'error': 'No authorization token available',
                    'message': 'Please generate JWT token using your Smart Assist credentials',
                    'help': 'Use the Generate JWT Token button with your Smart Assist Client ID and Secret'
                }), 401

        # Clean token (remove Bearer if present)
        clean_token = auth_token.replace('Bearer ', '').strip()

        # Try multiple authentication approaches for Search AI
        auth_methods = [
            # Method 1: JWT in auth header (as per docs)
            {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'auth': clean_token
            },
            # Method 2: Bearer token (alternative)
            {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': f'Bearer {clean_token}'
            },
            # Method 3: API Key approach
            {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-API-Key': clean_token
            },
            # Method 4: Bot-specific auth
            {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'bot-id': app_id,
                'Authorization': f'Bearer {clean_token}'
            }
        ]

        payload = {
            "query": query,
            "answerSearch": True,
            "searchResults": True,
            "metaFilters": [
                {
                    "condition": "AND",
                    "rules": [
                        {
                            "fieldName": "sourceType",
                            "fieldValue": ["web"],
                            "operator": "contains"
                        }
                    ]
                }
            ],
            "isFacetsEnable": True,
            "customData": {
                "location": "Assignment",
                "userIdentity": "test@example.com"
            },
            "includeChunksInResponse": True
        }

        # Build API URL with AppID as query parameter
        api_url = helper.assignment_requirements['api_endpoint'].replace('<AppId>', app_id)
        api_url_with_params = f"{api_url}?AppID={app_id}"

        # Try each authentication method
        for i, headers in enumerate(auth_methods):
            try:
                response = requests.post(api_url_with_params, headers=headers, json=payload, timeout=30)

                if response.status_code == 200:
                    return jsonify({
                        'success': True,
                        'message': f'Search AI API call successful (Method {i+1})',
                        'auth_method': f'Method {i+1}',
                        'query': query,
                        'app_id': app_id,
                        'response': response.json()
                    })
                elif response.status_code == 401:
                    # Try next method
                    continue
                elif response.status_code == 404:
                    return jsonify({
                        'error': 'API endpoint not found',
                        'details': 'Please verify your App ID is correct and the Search AI app is published',
                        'api_endpoint': api_url_with_params,
                        'status_code': response.status_code
                    }), 404
                else:
                    # Try next method for other errors
                    continue

            except requests.exceptions.RequestException as e:
                # Try next method
                continue

        # If all methods failed, show detailed error
        try:
            response = requests.post(api_url_with_params, headers=auth_methods[0], json=payload, timeout=30)
            return jsonify({
                'error': 'All authentication methods failed',
                'details': response.text,
                'suggestion': 'Your Search AI app may need different credentials. Check if you need an API Key instead of JWT token, or verify API scopes are configured.',
                'api_endpoint': api_url_with_params,
                'status_code': response.status_code,
                'tried_methods': len(auth_methods),
                'debug_info': {
                    'app_id': app_id,
                    'token_format': 'JWT' if 'Bearer' not in clean_token else 'Bearer'
                }
            }), 401
        except requests.exceptions.RequestException as e:
            return jsonify({
                'error': f"Network error: {str(e)}",
                'api_endpoint': api_url_with_params,
                'suggestion': 'Check your internet connection and API endpoint'
            }), 500

    except Exception as e:
        return jsonify({'error': f"Server error: {str(e)}"}), 500

@app.route('/api/deployment-status', methods=['GET'])
def deployment_status():
    """Get deployment status"""
    return jsonify({
        'status': 'ready',
        'requirements_met': True,
        'evaluator_added': False,
        'app_deployed': False,
        'auth_token_configured': helper.assignment_requirements['auth_token'] is not None,
        'next_steps': [
            'Add sowmya.doddi@kore.com as App Developer',
            'Configure Authorization Token',
            'Deploy the configured app',
            'Send confirmation email'
        ]
    })

@app.route('/api/configure-token', methods=['POST'])
def configure_token():
    """Configure the authorization token"""
    try:
        data = request.get_json()
        token = data.get('token', '').strip()

        if not token:
            return jsonify({'error': 'Token is required'}), 400

        # Save token persistently
        if helper.save_token(token):
            return jsonify({
                'success': True,
                'message': 'Authorization token configured and saved successfully',
                'token_preview': f"{token[:10]}...{token[-4:]}" if len(token) > 14 else "****"
            })
        else:
            return jsonify({'error': 'Failed to save token'}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-jwt', methods=['POST'])
def generate_jwt():
    """Generate JWT token from client credentials as per Kore.ai docs"""
    try:
        data = request.get_json()
        client_id = data.get('client_id', '').strip()
        client_secret = data.get('client_secret', '').strip()

        if not client_id or not client_secret:
            return jsonify({'error': 'Client ID and Client Secret are required'}), 400

        # Generate JWT token
        jwt_token = helper.generate_jwt_token(client_id, client_secret)

        if jwt_token:
            # Save the generated token
            if helper.save_token(jwt_token):
                return jsonify({
                    'success': True,
                    'message': 'JWT token generated and configured successfully',
                    'token_preview': f"{jwt_token[:10]}...{jwt_token[-4:]}" if len(jwt_token) > 14 else "****",
                    'token': jwt_token  # Return full token for testing
                })
            else:
                return jsonify({'error': 'Failed to save generated token'}), 500
        else:
            return jsonify({'error': 'Failed to generate JWT token'}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=8080)