# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains a minimal Kore.ai Smart Assist API testing application. It provides a focused interface for testing Smart Assist API integration with live API calls.

## Architecture

### Simplified Structure
- **Main Application**: `api_test_app.py` - Minimal Flask app focused only on API testing
- **Original Full App**: `app.py` - Complete deployment helper (if full functionality needed)
- **Web Interface**: `templates/api_test.html` and `templates/base.html`
- **Configuration**: Smart Assist credentials embedded in the code

### Key Components

#### SmartAssistAPITester Class (`api_test_app.py:16-62`)
- Handles JWT token generation for Kore.ai authentication
- Manages Smart Assist app configuration and credentials
- Provides sample queries for testing

#### API Testing Endpoints (`api_test_app.py:64-162`)
- `/` - Single API testing interface
- `/api/test-search` - Endpoint for live Smart Assist API calls
- `/api/generate-jwt` - JWT token generation endpoint

## Common Development Commands

### Running the Minimal API Test App
```bash
python3 api_test_app.py
```
Serves the API testing interface on `http://127.0.0.1:8080`

### Running the Full Application (if needed)
```bash
python3 app.py
```

### Installing Dependencies
```bash
pip install -r requirements.txt
```

### Testing API Integration
Access the web interface at `http://127.0.0.1:8080` for live API testing with the Smart Assist app.

## Configuration

### Smart Assist Credentials (Pre-configured)
- **App ID**: `st-b20b30fd-b75c-51cf-b95a-df9477562144`
- **Client ID**: `cs-7828199c-cef7-5c0d-a8f2-b476d99f6d7e`
- **Client Secret**: `IaSIDMyZoOo91k9EyXwY1+coAJzoBz7Aa0lPoPy/QCQ=`
- **API Endpoint**: `https://platform.kore.ai/api/public/bot/{app_id}/search/v2/advanced-search`

### JWT Token Management
- Automatic token generation using client credentials
- HS256 algorithm with Kore.ai specific payload format
- Includes required fields: `appId`, `iss`, `sub`, `aud`, `iat`, `exp`, `jti`

## API Testing Features

### Web Interface (`templates/api_test.html`)
- **Configuration Panel**: Enter Smart Assist credentials
- **JWT Token Generation**: Automatic token creation from credentials
- **Query Testing**: Interface for testing search queries
- **Sample Queries**: Pre-loaded recipe and nutrition queries
- **Response Display**: Real-time API response visualization
- **Troubleshooting**: Built-in error handling and suggestions

### Sample Test Queries
1. "How to prepare dark chocolate almond bars?"
2. "What are almonds rich in?"
3. "I have maple syrup with me. What can I do?"
4. "What are the vegan recipes that I can prepare?"
5. And 6 more nutrition/recipe related queries

## Authentication Flow

1. **Token Generation**: Create JWT using client credentials with specific Kore.ai format
2. **API Request**: Send POST request to Smart Assist endpoint with proper headers
3. **Multiple Methods**: Try different authentication approaches (auth header, Bearer token, API key)
4. **Response Handling**: Process and display Smart Assist responses

## Key Implementation Details

### JWT Token Format
```python
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
```

### API Request Structure
- **Method**: POST
- **Headers**: `Content-Type: application/json`, `auth: {jwt_token}`
- **Payload**: Query with metadata filters and response configuration
- **URL**: Endpoint with AppID query parameter

This minimal application focuses solely on API testing functionality for Kore.ai Smart Assist integration.