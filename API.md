# School Management System API Documentation

Base URL: `http://localhost:5000/api`

All endpoints return responses in the uniform format:
```json
{
  "success": true,
  "message": "Human-readable status message",
  "data": { ... }
}
```

Authentication is done via HTTP `Authorization: Bearer <jwt_token>` header.

---

## 1. Authentication (`/api/auth`)

### 1.1 Login
- **Endpoint**: `POST /api/auth/login`
- **Access**: Public (Rate-limited: 5 requests / 15 minutes)
- **Request Body**:
  ```json
  {
    "email": "admin@school.com",
    "password": "admin123"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGciOi...",
      "user": {
        "id": "67...",
        "name": "School Administrator",
        "email": "admin@school.com",
        "role": "admin"
      }
    }
  }
  ```

### 1.2 Get Current User Profile
- **Endpoint**: `GET /api/auth/me`
- **Access**: Authenticated (`admin`, `teacher`, `student`, `parent`)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "User profile fetched",
    "data": {
      "user": {
        "id": "67...",
        "name": "Sarah Johnson",
        "email": "sarah.johnson@school.com",
        "role": "teacher"
      }
    }
  }
  ```

### 1.3 Change Password
- **Endpoint**: `PUT /api/auth/change-password`
- **Access**: Authenticated
- **Request Body**:
  ```json
  {
    "currentPassword": "admin123",
    "newPassword": "newPassword456"
  }
  ```
- **Response**: `200 OK`

---

## 2. Dashboard (`/api/dashboard`)

### 2.1 Get Statistics & Metrics
- **Endpoint**: `GET /api/dashboard/stats`
- **Access**: Authenticated (Role-aware: admin sees school totals; teacher sees class stats; student sees personal KPIs)
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "Dashboard stats retrieved",
    "data": {
      "counts": {
        "totalStudents": 20,
        "totalTeachers": 3,
        "totalClasses": 4,
        "feeCollected": 21500,
        "feePending": 6500
      },
      "attendanceWeekly": [
        { "day": "Mon", "rate": 95 },
        { "day": "Tue", "rate": 90 }
      ],
      "recentAdmissions": [ ... ],
      "upcomingExams": [ ... ],
      "recentNotices": [ ... ]
    }
  }
  ```

---

## 3. Students (`/api/students`)

### 3.1 Get All Students
- **Endpoint**: `GET /api/students`
- **Query Params**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `search`: Filter by name, email, or student ID
  - `classId`: Filter by assigned Class ID
  - `status`: Filter by status (`active` / `inactive`)
- **Access**: `admin`, `teacher`
- **Response**: `200 OK`

### 3.2 Get Student by ID / Profile
- **Endpoint**: `GET /api/students/:id`
- **Access**: `admin`, `teacher`, `student` (own record only)
- **Response**: `200 OK` (includes student details, attendance summary, exam results, and fee transactions)

### 3.3 Create New Student
- **Endpoint**: `POST /api/students`
- **Access**: `admin`
- **Content-Type**: `multipart/form-data` or `application/json`
- **Request Body**:
  ```json
  {
    "firstName": "Alex",
    "lastName": "Mercer",
    "email": "alex.mercer@school.com",
    "dateOfBirth": "2008-05-14",
    "gender": "male",
    "bloodGroup": "O+",
    "classId": "67...",
    "parentName": "Robert Mercer",
    "parentPhone": "+1 555-0199",
    "address": "742 Evergreen Terrace",
    "city": "Springfield",
    "admissionDate": "2024-09-01"
  }
  ```
- **Auto-generated**: `studentId` (e.g. `STU-2026-0021`) and default login account (`student123`).

### 3.4 Update Student
- **Endpoint**: `PUT /api/students/:id`
- **Access**: `admin`

### 3.5 Soft Delete Student
- **Endpoint**: `DELETE /api/students/:id`
- **Access**: `admin`
- **Response**: Sets `isActive: false`

---

## 4. Teachers (`/api/teachers`)

### 4.1 Get All Teachers
- **Endpoint**: `GET /api/teachers`
- **Query Params**: `page`, `limit`, `search`, `department`
- **Access**: `admin`, `teacher`

### 4.2 Get Teacher by ID
- **Endpoint**: `GET /api/teachers/:id`
- **Access**: `admin`, `teacher`

### 4.3 Create Teacher
- **Endpoint**: `POST /api/teachers`
- **Access**: `admin`
- **Auto-generated**: `teacherId` (e.g. `TCH-2026-0004`) and login credentials (`teacher123`).

### 4.4 Update Teacher
- **Endpoint**: `PUT /api/teachers/:id`
- **Access**: `admin`

### 4.5 Soft Delete Teacher
- **Endpoint**: `DELETE /api/teachers/:id`
- **Access**: `admin`

---

## 5. Classes & Subjects (`/api/classes`, `/api/subjects`)

### 5.1 Get Classes
- **Endpoint**: `GET /api/classes`
- **Access**: Authenticated

### 5.2 Create Class
- **Endpoint**: `POST /api/classes`
- **Access**: `admin`
- **Request Body**:
  ```json
  {
    "name": "Grade 11",
    "section": "A",
    "academicYear": "2026-2027",
    "roomNumber": "301",
    "capacity": 35,
    "classTeacher": "67..."
  }
  ```

### 5.3 Update / Delete Class
- **Endpoints**: `PUT /api/classes/:id`, `DELETE /api/classes/:id`
- **Access**: `admin`

### 5.4 Subjects Endpoints
- `GET /api/subjects` (filter by `classId`)
- `POST /api/subjects` (`admin`)
- `PUT /api/subjects/:id` (`admin`)
- `DELETE /api/subjects/:id` (`admin`)

---

## 6. Attendance (`/api/attendance`)

### 6.1 Get Daily Attendance for a Class
- **Endpoint**: `GET /api/attendance?classId=:classId&date=YYYY-MM-DD`
- **Access**: `admin`, `teacher`

### 6.2 Bulk Record Daily Attendance
- **Endpoint**: `POST /api/attendance`
- **Access**: `admin`, `teacher`
- **Request Body**:
  ```json
  {
    "classId": "67...",
    "date": "2026-10-16",
    "records": [
      {
        "studentId": "67...",
        "status": "present",
        "remark": ""
      },
      {
        "studentId": "67...",
        "status": "absent",
        "remark": "Medical leave"
      }
    ]
  }
  ```
- **Rule**: Unique per student + date. Updates existing records if already marked.

### 6.3 Student Attendance Summary & Monthly Report
- **Endpoint**: `GET /api/attendance/student/:studentId?month=10&year=2026`
- **Access**: `admin`, `teacher`, `student` (own)

---

## 7. Exams & Results (`/api/exams`)

### 7.1 Get Exams List
- **Endpoint**: `GET /api/exams`
- **Access**: Authenticated

### 7.2 Create Exam Term
- **Endpoint**: `POST /api/exams`
- **Access**: `admin`
- **Request Body**:
  ```json
  {
    "title": "Final Term Examination",
    "academicYear": "2026-2027",
    "term": "Term 2",
    "startDate": "2026-12-01",
    "endDate": "2026-12-15",
    "classes": ["67..."]
  }
  ```

### 7.3 Get Class Marksheet Matrix
- **Endpoint**: `GET /api/exams/:examId/marks?classId=:classId`
- **Access**: `admin`, `teacher`

### 7.4 Save / Update Marks
- **Endpoint**: `POST /api/exams/:examId/marks`
- **Access**: `admin`, `teacher`
- **Auto-grading**: Standard grade brackets:
  - $\ge 90\%$: `A+`
  - $\ge 80\%$: `A`
  - $\ge 70\%$: `B`
  - $\ge 60\%$: `C`
  - $\ge 50\%$: `D`
  - $< 50\%$: `F`

### 7.5 Get Student Report Card
- **Endpoint**: `GET /api/exams/:examId/report-card/:studentId`
- **Access**: `admin`, `teacher`, `student` (own)

---

## 8. Fee Management (`/api/fees`)

### 8.1 Get Fee Invoices & Records
- **Endpoint**: `GET /api/fees`
- **Query Params**: `studentId`, `classId`, `status` (`paid`, `partial`, `pending`, `cancelled`), `page`, `limit`
- **Access**: `admin`, `teacher`

### 8.2 Record Fee Payment
- **Endpoint**: `POST /api/fees`
- **Access**: `admin`
- **Auto-generated**: `receiptNumber` (`REC-YYYY-XXXX`).

### 8.3 Cancel Fee Payment (Audit Trail)
- **Endpoint**: `POST /api/fees/:id/cancel`
- **Access**: `admin`
- **Request Body**:
  ```json
  {
    "cancellationReason": "Bounced check / Entered by error"
  }
  ```
- **Rule**: Soft-cancellation; fee payments cannot be deleted from the database.

---

## 9. Notices (`/api/notices`)

### 9.1 Get Notices
- **Endpoint**: `GET /api/notices`
- **Access**: Filtered automatically by current user's role (`all`, `teacher`, `student`, `parent`).

### 9.2 Post Notice
- **Endpoint**: `POST /api/notices`
- **Access**: `admin`

### 9.3 Delete Notice
- **Endpoint**: `DELETE /api/notices/:id`
- **Access**: `admin`

---

## 10. School Settings (`/api/settings`)

### 10.1 Get Settings
- **Endpoint**: `GET /api/settings`
- **Access**: Public / Authenticated

### 10.2 Update Settings
- **Endpoint**: `PUT /api/settings`
- **Access**: `admin`
