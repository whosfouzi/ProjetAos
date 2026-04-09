# E-Learning Platform - Microservices Architecture

Welcome to the E-Learning Platform project! This platform was built using an advanced Microservices architecture to separate core functionalities cleanly and scale efficiently.

## 🏛️ Ecosystem Overview
The system is composed of the following services Orchestrated by **Traefik** and **Consul**:
- **Auth Service**: Manages User JWTs and roles (Admin, Instructor, Student).
- **Course Service**: Manages catalogs, domains, specializations, and embedded PDF chapters.
- **Quiz Service**: Handles curriculum verification tests, MCQ, and logic.
- **Enrollment Service**: Orchestrates enrollment validation and strict mastery-gated chapter progress.
- **RabbitMQ**: The underlying message broker running event-driven cross-communication and state synchronization (e.g., cascades on user deletions).
- **Frontend (React)**: The unified Single Page Application interface.

---

## 🚀 Getting Started (Run it Locally)

You do **NOT** need Python, Node, or Django installed on your local machine. Everything is containerized.

### Prerequisites
1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop).
2. Ensure Docker daemon is running in the background.

### Booting Up
1. Open a terminal and navigate to this project folder.
2. Run the following command:
   ```bash
   docker-compose up --build
   ```
   *(Wait ~1-2 minutes for the initial build sequence to install dependencies internally).*

3. Once the logs stabilize and services are running, open your browser and navigate to:
   - **Main Frontend Interface**: http://localhost:3000
   - **Traefik Infrastructure Dashboard**: http://localhost:8080 

---

## 🔑 Using the Platform

The databases (`db.sqlite3` files) are pre-populated with a massive seeded dataset, including 100+ courses and dozens of varied dummy accounts to test the pagination and architecture.

You can instantly log in. Open the `accounts.txt` file located in the root directory to find the credentials for Administrators, Instructors, and Students. 

*Try logging in as a student (`student_1@example.com`) to check out the progressive curriculum UI, or an instructor (`instructor_1@example.com`) to manage the course catalog.*
