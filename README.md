# Cloud-Based Placement Management System

## Advanced Cloud Computing – DevOps using Docker and Kubernetes

---

## 1. Project Overview

The **Cloud-Based Placement Management System** is a web-based placement management platform designed for a college environment.

The system connects **students** and the **Training and Placement Officer (TPO/Admin)** through a centralized portal.

Students can maintain their profiles, upload resumes, view available placement opportunities, check their eligibility, apply for jobs, and track their applications.

TPO/Admin users can manage companies, create job postings, define eligibility criteria, view applicants, shortlist candidates, update application statuses, and view basic placement statistics.

The application itself is intentionally kept relatively simple. The primary focus of this project is not to build a highly complex placement application, but to demonstrate how a practical web application can be:

* Containerized using Docker
* Deployed using Kubernetes
* Scaled using Kubernetes
* Connected using Kubernetes Services
* Exposed using Ingress
* Persisted using Kubernetes Persistent Volumes
* Designed with fault tolerance and self-healing in mind

The project therefore follows the philosophy:

> **Simple application + strong Docker and Kubernetes demonstration.**

---

# 2. Problem Statement

Traditional college placement processes often involve multiple disconnected systems, spreadsheets, documents, and manual communication between students and placement administrators.

This can create problems such as:

* Difficulty maintaining student placement records
* Manual verification of eligibility
* Difficulty tracking applications
* Scattered job information
* Manual management of applicant lists
* Difficulty maintaining resumes and documents
* Lack of a centralized placement dashboard

The proposed system addresses these issues by providing a centralized web-based platform for managing the placement workflow.

---

# 3. Objectives

The major objectives of the project are:

1. Develop a centralized placement management platform.
2. Allow students to maintain their academic and professional profiles.
3. Allow students to view and apply for placement opportunities.
4. Automatically check student eligibility against job requirements.
5. Allow TPO/Admin users to manage companies and job postings.
6. Allow TPOs to manage and update application statuses.
7. Containerize application components using Docker.
8. Deploy and manage containers using Kubernetes.
9. Demonstrate Kubernetes service discovery and networking.
10. Demonstrate persistent storage using Kubernetes PV and PVC.
11. Demonstrate scalability and self-healing capabilities of Kubernetes.

---

# 4. Target Users

The MVP contains two primary user roles.

## 4.1 Student

Students use the platform to:

* Create/login to their account
* Maintain their profile
* Enter academic information
* Enter skills
* Upload their resume
* View available jobs
* Check eligibility
* Apply for jobs
* Track application status

---

## 4.2 TPO / Admin

TPO/Admin users use the platform to:

* Login securely
* Manage companies
* Create and manage job postings
* Define eligibility criteria
* View applicants
* Filter eligible candidates
* Shortlist or reject candidates
* Update application status
* View basic placement statistics

---

# 5. MVP Feature Set

The project should remain within the following scope.

## 5.1 Student Features

### Authentication

* Student login
* Student registration if required
* Secure authentication
* Role-based access

### Student Profile

Students can maintain:

* Name
* Email
* Branch
* Semester
* CGPA
* Active backlogs
* Skills
* Contact information

### Resume Management

* Upload resume
* Store resume using MinIO
* Associate resume with the student profile

### Job Dashboard

Students can:

* View active job postings
* View company information
* View job role
* View job description
* View eligibility requirements
* View application deadline

### Eligibility

The system checks whether a student satisfies the requirements of a job.

Example criteria:

* Minimum CGPA
* Branch
* Maximum allowed backlogs
* Required skills

Only eligible students should be allowed or encouraged to apply.

### Job Application

Students can:

* Apply for eligible jobs
* Prevent duplicate applications
* View their submitted applications

### Application Tracking

Students can see the current status of each application.

Possible statuses:

```text
Applied
   ↓
Shortlisted
   ↓
Interview
   ↓
Offered
```

A student may also receive:

```text
Rejected
```

---

# 5.2 TPO/Admin Features

## Company Management

TPO/Admin can:

* Add companies
* View companies
* Edit company information
* Remove companies if required

Example information:

* Company name
* Description
* Website
* Industry

---

## Job Management

TPO/Admin can:

* Create job postings
* Edit job postings
* Delete/close job postings
* Define eligibility criteria
* Set application deadlines

Example:

```text
Company: ABC Technologies
Role: Software Engineer

Minimum CGPA: 7.5
Maximum Backlogs: 0
Eligible Branches:
- Computer Engineering
- Information Technology

Required Skills:
- Java
- SQL
- Git
```

---

## Applicant Management

For every job, TPO/Admin can:

* View applicants
* View student details
* Check eligibility
* Shortlist candidates
* Reject candidates
* Update application status

---

## Placement Statistics

The TPO dashboard can display basic statistics such as:

```text
Total Students
Active Jobs
Total Applications
Shortlisted Students
Students Placed
```

The statistics should remain simple.

Complex analytics are NOT part of the MVP.

---

# 6. Features Explicitly Out of Scope

To prevent unnecessary scope expansion, the following features are NOT required for the MVP.

### Recruiter Portal

A separate recruiter-facing portal will not be implemented.

Recruiter/company information can be managed by the TPO/Admin.

### AI Resume Screening

No AI-based resume analysis or candidate ranking is required.

### Chat System

No student-recruiter messaging system is required.

### Notifications

Email, SMS, WhatsApp, and push notifications are not required.

### Advanced Analytics

No complex placement prediction, data science dashboards, or forecasting is required.

### Payment System

No payment functionality is required.

### External Cloud Dependency

The initial implementation should preferably run locally using Docker/Kubernetes.

AWS S3 is not required.

MinIO can be used for object/file storage.

---

# 7. Proposed Technology Stack

## Frontend

**React + Vite**

Responsibilities:

* User interface
* Student dashboard
* TPO dashboard
* Job listings
* Application tracking
* API communication

---

## Backend

**FastAPI (Python)**

Responsibilities:

* Authentication
* Business logic
* REST APIs
* Eligibility checking
* Job management
* Application management
* Database communication
* Resume upload handling

---

## Database

**PostgreSQL**

Used for structured relational data.

Expected data includes:

* Users
* Students
* Companies
* Jobs
* Applications
* Skills
* Eligibility requirements

PostgreSQL is preferred because the application contains strongly related entities.

---

## Object Storage

**MinIO**

Used for storing uploaded resume files.

Instead of storing PDF files directly inside PostgreSQL, the system stores the file in MinIO and keeps the relevant file reference in the database.

---

## Containerization

**Docker**

Each major application component is containerized.

Expected containers include:

```text
Frontend
Backend
PostgreSQL
MinIO
```

---

## Container Orchestration

**Kubernetes**

Kubernetes manages the containerized application.

Expected Kubernetes resources include:

* Pods
* Deployments
* Services
* Ingress
* ConfigMaps
* Secrets
* Persistent Volumes
* Persistent Volume Claims

---

# 8. High-Level Architecture

The initial architecture is:

```text
                   ┌─────────────────┐
                   │     Students    │
                   └────────┬────────┘
                            │
                            │
                   ┌────────▼────────┐
                   │                 │
                   │ React Frontend  │
                   │                 │
                   └────────┬────────┘
                            │
                         REST API
                            │
                   ┌────────▼────────┐
                   │                 │
                   │ FastAPI Backend │
                   │                 │
                   └───────┬─┬───────┘
                           │ │
              ┌────────────┘ └─────────────┐
              │                            │
              ▼                            ▼
      ┌──────────────┐             ┌──────────────┐
      │  PostgreSQL  │             │    MinIO     │
      │   Database   │             │ File Storage │
      └──────┬───────┘             └──────────────┘
             │
             ▼
      ┌──────────────┐
      │ Persistent   │
      │ Storage      │
      └──────────────┘
```

TPO/Admin users access the same React frontend but receive different interfaces and permissions based on their role.

---

# 9. Kubernetes Architecture

The application will eventually be deployed inside a Kubernetes cluster.

A simplified architecture is:

```text
                         Internet / User
                               │
                               ▼
                    ┌────────────────────┐
                    │ Kubernetes Ingress │
                    └─────────┬──────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │ Frontend Service   │
                    └─────────┬──────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │ Frontend Pods      │
                    │ React + NGINX      │
                    └─────────┬──────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │ Backend Service    │
                    └─────────┬──────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │ Backend Pods       │
                    │ FastAPI            │
                    └──────┬───────┬─────┘
                           │       │
                           ▼       ▼
                    ┌──────────┐ ┌──────────┐
                    │PostgreSQL│ │  MinIO   │
                    │ Service  │ │ Service  │
                    └────┬─────┘ └──────────┘
                         │
                         ▼
                    ┌──────────┐
                    │ PV / PVC │
                    └──────────┘
```

---

# 10. Docker Architecture

The application will first be containerized using Docker.

Conceptually:

```text
Docker
│
├── Frontend Container
│   └── React + Vite + NGINX
│
├── Backend Container
│   └── FastAPI
│
├── Database Container
│   └── PostgreSQL
│
└── Storage Container
    └── MinIO
```

Each container should have a clearly defined responsibility.

---

# 11. Kubernetes Resources

## 11.1 Pods

Pods run the containers required by the application.

For example:

```text
Frontend Pod
Backend Pod
PostgreSQL Pod
MinIO Pod
```

The exact number of Pods may change depending on scaling requirements.

---

## 11.2 Deployments

Deployments manage the desired number of replicas.

For example:

```text
Backend Deployment

Desired replicas = 3

Backend Pod 1
Backend Pod 2
Backend Pod 3
```

If one backend Pod fails, Kubernetes can create another Pod to maintain the desired state.

---

## 11.3 Services

Kubernetes Services provide stable networking between components.

Example:

```text
Frontend Service
Backend Service
PostgreSQL Service
MinIO Service
```

The database does not need to be directly exposed to the public internet.

---

## 11.4 Ingress

Ingress acts as the external entry point into the application.

Conceptually:

```text
User
 ↓
Ingress
 ├── /          → Frontend
 └── /api/...   → Backend
```

This provides a clean way to route traffic to the appropriate service.

---

# 12. Persistent Storage

Persistent storage is particularly important for PostgreSQL.

A Pod can be recreated, but application data should not disappear when this happens.

Therefore:

```text
PostgreSQL Pod
      │
      ▼
PostgreSQL
      │
      ▼
Persistent Volume Claim
      │
      ▼
Persistent Volume
```

This allows database data to persist independently of the lifecycle of a particular PostgreSQL Pod.

MinIO storage should also use persistent storage where appropriate.

---

# 13. Configuration and Secrets

Sensitive or environment-specific information should not be hardcoded into application code.

Examples include:

* Database username
* Database password
* JWT secret
* MinIO credentials
* Database connection URL

Kubernetes resources can be used:

### ConfigMap

For non-sensitive configuration.

### Secret

For sensitive values.

Example:

```text
ConfigMap
├── Backend URL
├── Database host
└── MinIO endpoint

Secret
├── Database password
├── JWT secret
└── MinIO credentials
```

---

# 14. Application Data Model

A simplified relational model can contain the following entities.

## User

```text
User
- id
- name
- email
- password_hash
- role
```

Possible roles:

```text
STUDENT
ADMIN
```

---

## Student Profile

```text
Student
- id
- user_id
- branch
- semester
- cgpa
- backlogs
- skills
- resume_reference
```

---

## Company

```text
Company
- id
- name
- description
- website
- industry
```

---

## Job

```text
Job
- id
- company_id
- title
- description
- minimum_cgpa
- maximum_backlogs
- eligible_branches
- required_skills
- deadline
- status
```

---

## Application

```text
Application
- id
- student_id
- job_id
- application_date
- status
```

Possible statuses:

```text
APPLIED
SHORTLISTED
INTERVIEW
OFFERED
REJECTED
```

---

# 15. Basic Application Flow

## Student Flow

```text
Student Login
      ↓
Student Dashboard
      ↓
View Profile
      ↓
View Jobs
      ↓
Eligibility Check
      ↓
Apply
      ↓
Application Created
      ↓
Track Status
```

---

## TPO Flow

```text
TPO Login
      ↓
TPO Dashboard
      ↓
Add Company
      ↓
Create Job
      ↓
Define Eligibility
      ↓
Publish Job
      ↓
View Applicants
      ↓
Shortlist / Reject
      ↓
Update Status
```

---

# 16. Eligibility Logic

Eligibility checking should remain simple and deterministic.

For example:

```text
Student:
CGPA = 8.2
Backlogs = 0
Branch = Computer Engineering
Skills = Java, Python, SQL

Job:
Minimum CGPA = 7.5
Maximum Backlogs = 0
Eligible Branch = Computer Engineering
Required Skills = Java, SQL
```

The student satisfies the criteria and can apply.

The backend performs this validation rather than relying only on the frontend.

---

# 17. API Structure

The backend can logically organize its REST API into modules.

Possible endpoints:

```text
/api/auth
/api/students
/api/companies
/api/jobs
/api/applications
```

Example endpoints:

### Authentication

```text
POST /api/auth/login
POST /api/auth/register
```

### Students

```text
GET  /api/students/profile
PUT  /api/students/profile
POST /api/students/resume
```

### Companies

```text
GET    /api/companies
POST   /api/companies
PUT    /api/companies/{id}
DELETE /api/companies/{id}
```

### Jobs

```text
GET    /api/jobs
GET    /api/jobs/{id}
POST   /api/jobs
PUT    /api/jobs/{id}
DELETE /api/jobs/{id}
```

### Applications

```text
POST /api/jobs/{id}/apply
GET  /api/applications
GET  /api/jobs/{id}/applications
PUT  /api/applications/{id}/status
```

These are an initial API structure. Exact endpoints can be adjusted during implementation.

---

# 18. Authentication

The application can use JWT-based authentication.

Basic flow:

```text
User Login
    ↓
Backend validates credentials
    ↓
JWT Token generated
    ↓
Frontend stores authentication state
    ↓
Token sent with protected API requests
    ↓
Backend validates token
    ↓
Request authorized
```

Role-based authorization determines whether a user can access student or TPO functionality.

---

# 19. Docker Demonstration Goals

Docker should demonstrate:

### Isolation

Each component runs independently.

### Consistency

The application runs in the same containerized environment across machines.

### Reproducibility

The environment can be recreated using Docker configuration.

### Independent Deployment

Frontend and backend can be rebuilt and deployed independently.

---

# 20. Kubernetes Demonstration Goals

The Kubernetes portion is one of the most important parts of the project.

The final project should demonstrate at least:

### 1. Container orchestration

Kubernetes manages application containers.

### 2. Service discovery

Services allow components to communicate using stable internal addresses.

### 3. Scaling

Backend replicas can be increased.

Example:

```text
Before:

Backend
└── Pod 1


After scaling:

Backend
├── Pod 1
├── Pod 2
└── Pod 3
```

### 4. Self-healing

If a managed Pod fails:

```text
Backend Pod
     X
     │
     ▼
Kubernetes detects failure
     │
     ▼
Replacement Pod created
```

### 5. Persistent storage

Database data survives Pod recreation through PV/PVC.

### 6. External access

Ingress provides controlled external access to the application.

---

# 21. Expected Project Demonstration

The final demonstration should ideally show the following sequence.

## Application Demonstration

1. Open the web application.
2. Login as a student.
3. Show the student profile.
4. Show resume management.
5. View available jobs.
6. Show eligibility.
7. Apply for a job.
8. Show application tracking.
9. Logout.
10. Login as TPO.
11. Create/view a company.
12. Create a job posting.
13. Define eligibility criteria.
14. View applicants.
15. Shortlist/reject an applicant.
16. Update application status.

---

## Docker Demonstration

Show:

```text
docker images
docker ps
```

Explain that the application components run as separate containers.

---

## Kubernetes Demonstration

Show commands/results such as:

```text
kubectl get pods
kubectl get services
kubectl get deployments
kubectl get pvc
kubectl get ingress
```

Then demonstrate scaling:

```text
Backend replicas:
1 → 3
```

And, if practical, demonstrate self-healing by deleting a backend Pod and showing Kubernetes recreate it.

---

# 22. Suggested Project Structure

A possible repository structure:

```text
placement-management-system/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── auth/
│   │   ├── students/
│   │   ├── companies/
│   │   ├── jobs/
│   │   ├── applications/
│   │   ├── database/
│   │   └── main.py
│   │
│   ├── Dockerfile
│   └── requirements.txt
│
├── database/
│   └── initialization/
│
├── kubernetes/
│   ├── namespace.yaml
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── postgres-deployment.yaml
│   ├── postgres-service.yaml
│   ├── postgres-pvc.yaml
│   ├── minio-deployment.yaml
│   ├── minio-service.yaml
│   ├── minio-pvc.yaml
│   ├── configmap.yaml
│   ├── secrets.yaml
│   └── ingress.yaml
│
├── docker-compose.yml
│
├── README.md
└── .gitignore
```

This structure is a proposal and can change during implementation.

---

# 23. Development Strategy

The project should NOT be developed by attempting to build everything simultaneously.

Recommended sequence:

## Phase 1 — Application Planning

Finalize:

* Features
* User roles
* Data model
* Basic UI flow
* API structure

## Phase 2 — Backend

Build:

* Authentication
* Student profile
* Companies
* Jobs
* Eligibility
* Applications

## Phase 3 — Frontend

Build:

* Login
* Student dashboard
* TPO dashboard
* Job listings
* Application tracker
* Forms

## Phase 4 — Database

Integrate PostgreSQL and test all relationships.

## Phase 5 — Resume Storage

Integrate MinIO for resume uploads.

## Phase 6 — Docker

Containerize:

* Frontend
* Backend
* PostgreSQL
* MinIO

Use Docker Compose for local multi-container testing if useful.

## Phase 7 — Kubernetes

Create:

* Deployments
* Services
* ConfigMaps
* Secrets
* PV/PVC
* Ingress

## Phase 8 — Cloud/DevOps Demonstration

Demonstrate:

* Pod management
* Scaling
* Service discovery
* Persistent storage
* Self-healing
* External access

---

# 24. Important Scope Rule

The project should prioritize **completion and demonstrability over feature count**.

Do NOT unnecessarily add features simply because they sound impressive.

If a feature does not contribute significantly to either:

1. The placement management workflow, or
2. The Docker/Kubernetes learning objectives,

it should probably not be added to the MVP.

---

# 25. Project Philosophy

The project follows this principle:

> **Keep the application simple and demonstrate cloud technologies strongly.**

The purpose is not to compete with commercial placement platforms.

The purpose is to demonstrate how a practical web application can be transformed into a containerized and orchestrated cloud-native application.

---

# 26. Expected Learning Outcomes

By completing the project, the team should understand:

### Application Development

* REST APIs
* Authentication
* Role-based authorization
* CRUD operations
* Database relationships
* File uploads

### Docker

* Dockerfiles
* Images
* Containers
* Container networking
* Volumes
* Multi-container applications

### Kubernetes

* Pods
* Deployments
* Services
* Ingress
* ConfigMaps
* Secrets
* Persistent Volumes
* Persistent Volume Claims
* Replica scaling
* Self-healing

### Cloud-Native Concepts

* Containerization
* Service discovery
* Decoupled components
* Horizontal scaling
* Persistent storage
* Fault tolerance
* Infrastructure-based deployment

---

# 27. Final Project Scope

The final MVP consists of:

```text
                    CLOUD-BASED
               PLACEMENT MANAGEMENT
                    SYSTEM
                         │
        ┌────────────────┴────────────────┐
        │                                 │
    APPLICATION                         DEVOPS
        │                                 │
        ├── Student Portal                ├── Docker
        ├── TPO Portal                    ├── Kubernetes
        ├── Job Management                ├── Deployments
        ├── Eligibility Checking          ├── Services
        ├── Applications                  ├── Ingress
        ├── Resume Upload                 ├── PV / PVC
        └── Status Tracking               ├── ConfigMaps
                                          ├── Secrets
                                          ├── Scaling
                                          └── Self-Healing
```

---

# 28. Final Technology Stack

| Layer                   | Technology         |
| ----------------------- | ------------------ |
| Frontend                | React + Vite       |
| Backend                 | FastAPI            |
| Database                | PostgreSQL         |
| File Storage            | MinIO              |
| Web Server              | NGINX              |
| Containerization        | Docker             |
| Container Orchestration | Kubernetes         |
| API Communication       | REST               |
| Authentication          | JWT                |
| Persistent Storage      | Kubernetes PV/PVC  |
| Configuration           | ConfigMap          |
| Sensitive Configuration | Kubernetes Secret  |
| External Routing        | Kubernetes Ingress |

---

# 29. Current Status

At the beginning of development:

* Project topic: **Finalized**
* Application scope: **Finalized**
* Student features: **Finalized**
* TPO/Admin features: **Finalized**
* PostgreSQL: **Selected**
* MinIO: **Selected**
* React + Vite: **Selected**
* FastAPI: **Selected**
* Docker: **Core requirement**
* Kubernetes: **Core requirement**
* Block diagram: **To be prepared**
* Detailed Kubernetes architecture diagram: **To be prepared**
* Implementation: **Not started**

The immediate next step is to prepare the project diagrams and presentation.

---

# 30. Important Instruction for Future AI Assistance

When assisting with this project, treat this README as the current source of truth.

Do not unnecessarily expand the project scope.

Prioritize:

1. Simplicity of implementation
2. Correctness
3. Docker understanding
4. Kubernetes understanding
5. Ability to demonstrate the system
6. Ability of the team to explain every component during a viva/presentation

If a proposed feature significantly increases development complexity without improving the core placement workflow or the Docker/Kubernetes demonstration, recommend keeping it out of the MVP.

The goal is:

> **A simple, working placement application deployed and demonstrated effectively using Docker and Kubernetes.**
