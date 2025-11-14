# Smart Learning App

A comprehensive learning management system with role-based access control for Admin, School Representatives, Teachers, and Students.

## Features

- **Multi-role Authentication**: Admin, School Rep, Teacher, and Student roles with code-based registration
- **School Management**: Admin generates school codes, School Reps create schools and generate teacher/student codes
- **Course Management**: Teachers create and manage courses, enroll students
- **Assignment System**: Teachers create assignments, students submit, teachers grade
- **Dashboard Views**: Role-specific dashboards with relevant information

## Tech Stack

- **Frontend**: React 18 with Vite, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens
- **Deployment**: Docker & Docker Compose

## Project Structure

```
smart-learning-app/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   └── utils/
│   └── package.json
└── docker-compose.yml
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (or use Docker)
- Docker & Docker Compose (for containerized deployment)

### Local Development

#### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-learning-app
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

4. Start the server:
```bash
npm start
# or for development with nodemon
npm run dev
```

#### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:5000`.

### Docker Deployment

1. Build and start all services:
```bash
docker-compose up -d
```

2. Access the application:
- Frontend: `http://localhost`
- Backend API: `http://localhost:5000`

3. Stop services:
```bash
docker-compose down
```

4. View logs:
```bash
docker-compose logs -f
```

## Usage Flow

1. **Admin Registration**: Admin signs up and generates school codes
2. **School Rep Registration**: School Rep uses school code to register and create school
3. **Teacher/Student Registration**: Teachers and students use respective codes provided by School Rep
4. **Course Creation**: Teachers create courses and enroll students
5. **Assignments**: Teachers create assignments, students submit, teachers grade

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Admin
- `POST /api/admin/generate-school-code` - Generate school code
- `GET /api/admin/schools` - Get all schools

### School Rep
- `GET /api/school` - Get school details
- `POST /api/school/regenerate-teacher-code` - Regenerate teacher code
- `POST /api/school/regenerate-student-code` - Regenerate student code
- `GET /api/school/stats` - Get school statistics

### Courses
- `GET /api/courses` - Get courses (role-based)
- `POST /api/courses` - Create course (teacher)
- `GET /api/courses/:id` - Get course details
- `PUT /api/courses/:id` - Update course (teacher)
- `DELETE /api/courses/:id` - Delete course (teacher)
- `POST /api/courses/:id/enroll` - Enroll student (teacher)
- `POST /api/courses/:id/remove-student` - Remove student (teacher)

### Assignments
- `GET /api/assignments` - Get assignments (role-based)
- `POST /api/assignments` - Create assignment (teacher)
- `GET /api/assignments/:id` - Get assignment details
- `PUT /api/assignments/:id` - Update assignment (teacher)
- `DELETE /api/assignments/:id` - Delete assignment (teacher)
- `GET /api/assignments/course/:courseId` - Get assignments by course

### Submissions
- `POST /api/submissions` - Submit assignment (student)
- `GET /api/submissions` - Get submissions (teacher, requires assignmentId)
- `GET /api/submissions/my-submissions` - Get student's submissions
- `GET /api/submissions/assignment/:assignmentId` - Get student's submission for assignment
- `PUT /api/submissions/:id/grade` - Grade submission (teacher)

## Environment Variables

### Backend
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development/production)

### Frontend
- `VITE_API_URL` - Backend API URL (default: http://localhost:5000/api)

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Role-based access control
- Input validation
- CORS configuration

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

