# Attendance System Frontend

A React web application for managing student attendance using face recognition.

## Features

- Teacher authentication with JWT
- Student registration with photo upload
- Live attendance capture using webcam
- Group attendance processing from uploaded photos
- Download attendance reports in Excel format

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Backend Integration

Make sure the Flask backend is running on `http://localhost:5050`.

### API Endpoints Used

- `POST /api/teacher/login` - Teacher login
- `POST /api/student/register` - Register student with photo
- `POST /api/attendance/live` - Live attendance capture
- `POST /api/attendance/group` - Group attendance processing
- `GET /api/attendance/download/{filename}` - Download reports

## Usage

1. **Login**: Use teacher credentials to log in
2. **Dashboard**: Navigate to different features
3. **Student Registration**: Upload student photos for face recognition
4. **Live Attendance**: Use webcam to capture attendance in real-time
5. **Group Attendance**: Upload multiple photos for batch processing
6. **Reports**: Download generated Excel attendance sheets

## Technologies Used

- React 18
- React Router for navigation
- Axios for API calls
- Bootstrap for styling
- React Webcam for camera integration
- JWT for authentication
