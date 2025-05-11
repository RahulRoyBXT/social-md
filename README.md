# Social Backend API 🚀

<div align="center">
  
  <h3>Production-ready backend for modern social media platforms</h3>
  
  [![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
  [![Express](https://img.shields.io/badge/Express-v5.1.0-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-v8.13.2-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
  [![License](https://img.shields.io/badge/license-MIT-yellow?style=for-the-badge)](LICENSE)
</div>

<p align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-key-features">Key Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#%EF%B8%8F-api-endpoints">API Endpoints</a> •
  <a href="#-deployment">Deployment</a>
</p>

## 📋 Overview

A high-performance backend for social media applications built with Node.js, Express, and MongoDB. This API provides robust authentication, content management, and social interaction features designed for production environments.

## 💻 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/social-backend.git

# Move to project directory
cd social-backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Start development server
npm run dev

# Access API at http://localhost:5000
```

## 🔑 Key Features

- **🔒 Secure Authentication** - JWT tokens with refresh token mechanism
- **📹 Media Platform** - Video uploads, streaming & thumbnail generation
- **🔄 Social Interactions** - Comments, likes, tweets & subscription systems
- **📑 Content Management** - Playlist creation and organization
- **🛡️ Enterprise Security** - Request validation, sanitization & error handling
- **📊 Performance Optimized** - Database indexing & efficient query processing

## 🛠️ Tech Stack

### Core Technologies
- **Node.js** - Server-side JavaScript runtime
- **Express** - Fast, unopinionated web framework
- **MongoDB** - Flexible NoSQL database

### Critical Libraries & Why We Use Them

| Library | Purpose & Benefits |
|---------|---------|
| **Mongoose v8.13** | Provides schema-based MongoDB interactions with robust validation, middleware hooks, and query building - reducing database interaction code by ~60% while enforcing data integrity |
| **Zod v3.24** | Runtime schema validation that prevents server crashes from malformed data. Catches input errors before they reach business logic and provides detailed error messages that improve debugging efficiency |
| **Cloudinary v2.6** | Handles media transformations and CDN delivery with 99.9% uptime SLA, reducing bandwidth costs by ~30% compared to self-hosted storage while simplifying media optimization workflows |
| **JWT v9.0** | Implements stateless authentication that eliminates session store queries, allowing horizontal scaling with zero shared state requirements between server instances |
| **Bcrypt v5.1** | Secures passwords with adaptive hashing algorithms that automatically increase computational complexity to match hardware advances, maintaining brute-force resistance over time |
| **Multer v1.4** | Manages file uploads with configurable storage engines, efficiently handling large media files with streaming capabilities to minimize memory consumption |

## 📐 Architecture

```
src/
├── controllers/  # Business logic handlers organized by domain
├── models/       # Database schema definitions
├── routes/       # API endpoint routing
├── middlewares/  # Request processing pipeline components
├── utils/        # Utility functions and helpers
└── validations/  # Request schema validators
```

## ⚙️ API Endpoints

### Authentication & Users
```
POST /api/v1/users/register    # Create new account
POST /api/v1/users/login       # Authenticate & get tokens
GET  /api/v1/users/logout      # Invalidate tokens
GET  /api/v1/users/profile     # Get user data
```

### Content Management
```
POST   /api/v1/videos          # Upload new video
GET    /api/v1/videos          # List videos (paginated)
GET    /api/v1/videos/:id      # Get video details
PATCH  /api/v1/videos/:id      # Update video metadata
DELETE /api/v1/videos/:id      # Remove video
```

### Social Features
```
POST /api/v1/comments          # Add comment
POST /api/v1/likes             # Like content
POST /api/v1/tweets            # Create tweet
POST /api/v1/subscriptions     # Subscribe to channel
```

## 🚀 Deployment

This project implements CI/CD pipelines that:
- Run automated test suites
- Perform security scans
- Deploy to staging/production environments

## 🔍 Performance Optimizations

- **Custom Error Handling** - Centralized error processing with the ApiError class
- **Asynchronous Request Pipeline** - Non-blocking I/O with asyncHandler utility
- **Database Optimization** - Strategic indexing for frequent query patterns

## 🧪 Testing

```bash
# Run test suite
npm test

# Run with coverage report
npm run test:coverage
```

## 📜 License

[MIT License](LICENSE) - Feel free to use for your own projects.
