# User Access Management System

A comprehensive system for managing user access to software applications, including registration, authentication, access requests, and managerial approvals.

## Live Demo

[Access the live application](https://leucine-tech-internship.vercel.app/login)

## Repository

[GitHub Repository](https://github.com/sivamani2003/Leucine-Tech-Internship.git)

## System Overview

### Purpose
This system allows:
- User registration
- Login & authentication
- Software access requests
- Managerial approvals

### User Roles
- **Employee**: Can sign up, login, and request software access
- **Manager**: Can view and approve/reject access requests
- **Admin**: Can create software and has full access to the system

### Core Features
- User Registration
- JWT-based Authentication
- Software Listing & Creation
- Access Request Submission
- Access Request Approval or Rejection

## Tech Stack

### Backend
- Node.js
- Express.js
- SQLite (for development)
- TypeORM for database ORM
- JWT for authentication
- bcrypt for password hashing

### Frontend
- React
- React Router for navigation
- Axios for API requests
- CSS for styling

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup
1. Clone the repository:
   ```
   git clone https://github.com/sivamani2003/Leucine-Tech-Internship.git
   cd Leucine-Tech-Internship/backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file with the following variables:
   ```
   PORT=5000
   JWT_SECRET=your_jwt_secret
   DATABASE_URL=your_database_url
   ```

4. Start the backend server:
   ```
   npm start
   ```
   For development with auto-reload:
   ```
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd ../frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## API Documentation

### Authentication Endpoints

#### Sign Up
- **URL**: `/api/auth/signup`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string",
    "role": "Employee" | "Manager" | "Admin"
  }
  ```
- **Response**: User object with JWT token

#### Login
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response**: User object with JWT token and role

### Software Management Endpoints

#### Create Software (Admin only)
- **URL**: `/api/software`
- **Method**: `POST`
- **Authorization**: Bearer Token (Admin)
- **Request Body**:
  ```json
  {
    "name": "string",
    "description": "string",
    "accessLevels": ["Read", "Write", "Admin"]
  }
  ```
- **Response**: Created software object

#### Get All Software
- **URL**: `/api/software`
- **Method**: `GET`
- **Authorization**: Bearer Token
- **Response**: Array of software objects

### Access Request Endpoints

#### Submit Access Request (Employee)
- **URL**: `/api/requests`
- **Method**: `POST`
- **Authorization**: Bearer Token (Employee)
- **Request Body**:
  ```json
  {
    "softwareId": "number",
    "accessType": "Read" | "Write" | "Admin",
    "reason": "string"
  }
  ```
- **Response**: Created request object

#### Approve or Reject Request (Manager)
- **URL**: `/api/requests/:id`
- **Method**: `PATCH`
- **Authorization**: Bearer Token (Manager)
- **Request Body**:
  ```json
  {
    "status": "Approved" | "Rejected"
  }
  ```
- **Response**: Updated request object

#### Get All Requests (Manager)
- **URL**: `/api/requests`
- **Method**: `GET`
- **Authorization**: Bearer Token (Manager)
- **Response**: Array of request objects


