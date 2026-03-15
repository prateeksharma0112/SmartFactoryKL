# Factory Production Planning Dashboard

A web-based **production planning and visualization dashboard** designed to display machine schedules and manufacturing operations using an **interactive Gantt chart interface**.

This system provides a clear overview of **production orders, machine assignments, and operation timelines**, helping users understand how jobs are scheduled across machines in a factory environment.

The application fetches production plan data from a backend service (aas server) and visualizes it through a **dynamic and responsive user interface built with React**.

---

# 🚀 Project Overview

Modern manufacturing environments require clear visibility into **machine utilization and job scheduling**.  
This project provides an intuitive interface to visualize production schedules using a **timeline-based Gantt chart**.

The system allows users to:

- View machine schedules
- Track operation execution over time
- Identify finished and upcoming operations
- Observe the current time within the production timeline
- Inspect operation details through interactive tooltips

The visualization demonstrates how scheduling systems used in **industrial manufacturing dashboards** operate.

---

# ✨ Features

### 📊 Interactive Gantt Chart
- Machine-based scheduling visualization
- Timeline displayed in **5-minute intervals**
- Operations rendered as colored bars

### 📅 Dynamic Clock & Calendar: 
Integrated header displaying the current date and high-precision system time (HH:MM:SS).

### 🕒 Live Timeline Indicator
- A **"NOW" line** shows the current time relative to the schedule
- Helps identify ongoing operations

### 🔍 Operation Tooltips
Hovering over operations displays detailed information:

- Operation ID
- Start time
- End time
- Operation duration
- Machine Allocated
- Status
- IsFrozen

### 🎨 Job Color Mapping
Operations belonging to the same job are assigned the same color to make them easy to identify across machines.

### ✅ Machine-Based Layout
Each row represents a machine and displays all operations scheduled on that machine.

### ↔️ Scrollable Timeline
The timeline can be scrolled horizontally to inspect longer schedules.

### 📌 Sticky Machine Column
The machine column remains visible while scrolling the timeline.

### 🟢 Finished Operation Highlighting
Completed operations appear visually faded to distinguish them from active or upcoming tasks.

### 🔄 Real-time Polling 
The system automatically fetches and updates production data every 2 seconds via WebSockets/API to ensure the UI reflects the live factory state.

### 📍 Follow Mode 
A toggleable feature that automatically scrolls the viewport to keep the "NOW" line centered as time progresses.

---

# ⚙️ System Architecture

The system follows a simple **client-server architecture**.
```
Frontend (React UI)  
        │  
     REST API  
        │  
Backend Service (Production Plan Provider)
```
### Backend
Provides production plan data in JSON format.

### Frontend
Fetches the production plan and visualizes it using an interactive Gantt chart.

---

# 🛠 Technologies Used

## Frontend
- React
- JavaScript (ES6)
- HTML
- CSS

## Concepts Used
- React Hooks (`useState`, `useEffect`, `useMemo`)
- Modular component architecture
- Dynamic UI rendering
- Responsive layout design

## Backend
- Python
- FastAPI
- AAS Server (BaSyx)
- Web Sockets
- REST API providing production scheduling data
---

# 📦 Installation & Setup

This project is fully containerized using **Docker**.  
The easiest way to run the entire system (Frontend, Backend) is via **Docker Compose**.

## Prerequisites
Ensure you have the following installed:

- **Docker** (v20 or higher) – https://www.docker.com/
- **Docker Compose** (included with Docker Desktop)
- **Git** – https://git-scm.com/


---
## Clone the Repository

```bash
git clone https://github.com/your-username/SmartFactoryKL.git
cd SmartFactoryKL
```

## Configure Environment Files

Before running the application, configure the environment variables.

Edit the following files and adjust the values if necessary:
```bash
frontend/.env.docker
backend/.env.docker
```
These files contain configuration such as:

- Backend API URL

- AAS Server connection

- CORS settings

Make sure the URLs and ports match your environment.


## Run the Application with Docker

Start all services using Docker Compose:

```bash
docker compose up --build
```

This command will start the following services:
```bash
| Service    | Description           | Default URL                                          |
| ---------- | --------------------- | ---------------------------------------------- |
| Frontend   | React dashboard       | [http://localhost:5173](http://localhost:5173) |
| Backend    | FastAPI API service   | [http://localhost:8000](http://localhost:8000) |
```
Once the containers are running, access the Services from the above links.

**Ports can be changed in `docker-compose.yml` if needed.**


## Stopping the Application

To stop all containers:
```bash
docker compose down
```

## Rebuilding Containers
If you make changes to the backend or frontend:
```bash
docker compose up --build
```

## Project Structure
```bash
GUI-AAS
│
├── frontend
│   └── React application
│     └── .env.docker # configure it
│
├── backend
│   └── FastAPI service
│     └── .env.docker # configure it
│
├── docker-compose.yml
```

## Running Without Docker (Optional)

If you prefer to run the services locally without Docker, refer to:

- backend setup → backend/README.md

- frontend setup → frontend/README.md
