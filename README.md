# Auro Social Media Platform

## Proprietary Notice

**This project is proprietary.**

You are NOT allowed to modify, copy, distribute, or use this code for commercial purposes without the author's explicit permission.

## Overview

Auro is a modern social media platform built with the MERN stack (MongoDB, Express, React, Node.js). It features real-time interactions, a responsive design, and a clean user interface for sharing posts, images, and connecting with others.

## Features

- **User Authentication**: Secure signup and login with JWT token authentication
- **Profile Management**: Customizable user profiles with avatars and status messages
- **Post Creation**: Share text content and images
- **Social Interactions**: Like, comment, retweet, and quote posts
- **Real-time Notifications**: Get notified when someone interacts with your content
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop devices
- **Media Uploads**: Support for image uploads with AWS S3 integration
- **Email Verification**: Secure account verification via email

## Tech Stack

### Frontend
- React.js with hooks for state management
- React Router for navigation
- Tailwind CSS for styling
- Axios for API communication
- Lucide React for icons

### Backend
- Node.js with Express
- MongoDB with Mongoose for data storage
- JWT for authentication
- AWS S3 for media storage
- Nodemailer for email services
- Multer for file uploads

## Installation and Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- AWS S3 bucket
- npm or yarn

### Local Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/SOCIAL-APP.git
   cd SOCIAL-APP
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   
   Copy the provided `.env.example` file in the project root and create appropriate `.env` files:
   
   For backend (in `/backend` directory):
   ```
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=your_aws_region
   AWS_BUCKET_NAME=your_bucket_name
   JWT_SECRET=your_jwt_secret
   PORT=8000
   MONGO_URI=your_mongodb_connection_string
   EMAIL_USER=your_email
   EMAIL_PASSWORD=your_email_app_password
   ```

   For frontend (in `/frontend` directory), `.env.development` for local development:
   ```
   VITE_API_URL=http://localhost:8000/api
   ```
   
   And `.env.production` for production builds (this is used automatically when building for deployment):
   ```
   VITE_API_URL=https://your-production-url.render.com/api
   ```

4. Start the development servers:
   ```bash
   npm run dev
   ```

   This will start both the backend server on port 8000 and the frontend on port 5173.

## Deployment

### Deploying on Render

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure the service:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run prod`
   - Environment Variables: Add all environment variables from your backend `.env` file
   - Set PORT to 10000 (Render's recommended port)
4. Make sure your frontend `.env.production` file has the correct Render deployment URL
5. After deployment, URLs will automatically use your Render domain instead of localhost

## Project Structure

```
SOCIAL APP/
├── backend/              # Node.js backend
│   ├── config/           # Configuration files
│   ├── route/            # API routes
│   │   ├── db/           # Database models and schemas
│   │   └── helpers/      # Helper functions
│   └── server.js         # Entry point
├── frontend/             # React frontend
│   ├── node_modules/     # Frontend dependencies
│   ├── public/           # Static files
│   ├── src/              # Source code
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API service functions
│   │   ├── App.jsx       # Main application component
│   │   ├── index.css     # Global styles
│   │   └── main.jsx      # Entry point
│   ├── .env.development  # Development environment variables
│   ├── .env.production   # Production environment variables
│   ├── index.html        # HTML template
│   ├── package.json      # Frontend dependencies and scripts
│   ├── postcss.config.js # PostCSS configuration
│   ├── tailwind.config.js # Tailwind CSS configuration
│   └── vite.config.js    # Vite configuration
├── node_modules/         # Root dependencies
├── .env.example          # Example environment variables
├── .gitignore            # Git ignore file
├── package-lock.json     # Dependency lock file
├── package.json          # Root dependencies and scripts
└── README.md             # Project documentation
```

## API Endpoints

### Authentication
- `POST /api/users/signup` - Register a new user
- `POST /api/users/login` - Log in a user
- `POST /api/users/logout` - Log out a user

### Posts
- `GET /api/posts` - Get all posts
- `GET /api/posts/:postId/detail` - Get a specific post
- `GET /api/posts/user/:username` - Get posts by a specific user
- `POST /api/posts` - Create a new post
- `PUT /api/posts/:postId` - Update a post
- `DELETE /api/posts/:postId` - Delete a post

### Interactions
- `POST /api/posts/:postId/like` - Like/unlike a post
- `POST /api/posts/:postId/retweet` - Retweet/unretweet a post
- `POST /api/posts/:postId/quote` - Quote a post
- `POST /api/posts/:postId/comments` - Comment on a post

### Users
- `GET /api/users/:username` - Get user profile
- `PUT /api/users/status` - Update user status
- `POST /api/users/avatar` - Update user avatar

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread-count` - Get unread notification count
- `PUT /api/notifications/read-all` - Mark all notifications as read

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary. All rights reserved.

You are NOT allowed to modify, copy, distribute, or use this code for commercial purposes without the author's explicit permission.

## Contact

Your Name

Project Link: [https://github.com/yourusername/SOCIAL-APP](https://github.com/yourusername/SOCIAL-APP)

## Acknowledgements

- [React.js](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [AWS S3](https://aws.amazon.com/s3/)