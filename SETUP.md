# Roshnaii Setup Guide

## Prerequisites

1. **Node.js** (v16 or higher)
2. **MongoDB** (running locally on port 27017)

## Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. The `.env` file is already configured with:
   - Local MongoDB connection
   - Gmail SMTP for sending OTP emails
   - JWT secret for authentication

4. Start the backend server:
```bash
npm run dev
```

You should see:
```
✅ FLAG: MONGODB CONNECTED | Host: localhost
🚀 Server running on port 5000
```

## Frontend Setup

1. Navigate to frontend folder (in a new terminal):
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. The `.env` file is already configured to connect to `http://localhost:5000/api`

4. Start the frontend dev server:
```bash
npm run dev
```

The app will open at `http://localhost:5173`

## Testing the Connection

1. Open `http://localhost:5173` in your browser
2. Click "Sign Up" 
3. Fill in the form with your details
4. You'll receive an OTP via email
5. Enter the OTP to verify your account
6. Login with your credentials

## Features Connected

✅ User Signup with email verification
✅ OTP generation and email sending
✅ OTP verification
✅ User Login with JWT authentication
✅ Protected routes
✅ Toast notifications for all actions
✅ Cookie-based authentication

## Troubleshooting

### Backend won't start
- Make sure MongoDB is running: `mongod` or start MongoDB service
- Check if port 5000 is available

### Frontend can't connect to backend
- Verify backend is running on port 5000
- Check browser console for CORS errors
- Ensure `.env` file exists in frontend folder

### Email not sending
- Gmail SMTP credentials are already configured
- Check if the email address is correct
- Gmail may block "less secure apps" - you may need to use an App Password

## Environment Variables

### Backend (.env)
- `PORT` - Server port (5000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens
- `SMTP_HOST` - Gmail SMTP host
- `SMTP_PORT` - SMTP port (587)
- `SMTP_USER` - Gmail address for sending emails
- `SMTP_PASS` - Gmail app password
- `CLIENT_URL` - Frontend URL for CORS
- `NODE_ENV` - Environment (development/production)

### Frontend (.env)
- `VITE_API_URL` - Backend API URL
