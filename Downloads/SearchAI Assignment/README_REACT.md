# React Kore.ai Smart Assist API Tester

A React-based interface for testing Kore.ai Smart Assist API integration.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The app will run on `http://localhost:3000`

## Features

- **JWT Token Generation**: Automatic token creation from Smart Assist credentials
- **Live API Testing**: Real-time calls to Kore.ai Smart Assist API
- **Sample Queries**: Pre-loaded recipe and nutrition test queries
- **Response Visualization**: JSON formatted API responses
- **Error Handling**: Comprehensive troubleshooting guidance
- **Bootstrap UI**: Professional responsive interface

## Configuration

The app comes pre-configured with working Smart Assist credentials:
- **App ID**: `st-b20b30fd-b75c-51cf-b95a-df9477562144`
- **Client ID**: `cs-7828199c-cef7-5c0d-a8f2-b476d99f6d7e`
- **Client Secret**: Pre-filled for testing

## Usage

1. Open `http://localhost:3000`
2. Click "Generate JWT Token" to create authentication token
3. Select a sample query or enter your own
4. Click "Execute Search" to test the API
5. View real-time responses from Smart Assist

## Project Structure

```
src/
├── components/
│   └── ApiTester.js          # Main API testing component
├── utils/
│   └── jwtGenerator.js       # JWT token generation utility
├── App.js                    # Root component
└── index.js                  # Entry point
```

## Dependencies

- **React 18**: Core framework
- **Bootstrap 5**: UI styling
- **Axios**: HTTP client for API calls
- **jsonwebtoken**: JWT token generation
- **Font Awesome**: Icons

This React version provides the same functionality as the Flask version but runs entirely in the browser.