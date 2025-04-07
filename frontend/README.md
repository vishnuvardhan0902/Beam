# Frontend Application

## Features

1. **Basic Authentication**
   - Users can register with their email and password
   - Users can login with their email and password
   - Passwords are hashed and securely stored in the database

2. **Google Authentication**
   - Users can sign in with their Google account
   - Users can register with their Google account
   - Google authentication requires Firebase configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_BACKEND_URL=http://localhost:5001/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

## Running the Application

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
