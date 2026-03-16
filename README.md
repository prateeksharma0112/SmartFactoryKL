<<<<<<< HEAD
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
Frontend (React)
      │
      │ REST / WebSocket
      ▼
Backend (FastAPI) (Production Plan Provider)
      │
      │ HTTP API
      ▼
BaSyx AAS Server (Data Provider)
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
- Web Sockets

### Infrastructure
- Docker
- Docker Compose

### Data Source
- Eclipse BaSyx AAS Server

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

| Service    | Description           | Default URL                                    |
| ---------- | --------------------- | ---------------------------------------------- |
| Frontend   | React dashboard       | [http://localhost:5173](http://localhost:5173) |
| Backend    | FastAPI API service   | [http://localhost:8000](http://localhost:8000) |

Once the containers are running, you can access the Services via the links above.

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

---
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

---

## 🔍 Troubleshooting

#### Port already in use
If port `8000` or `5173` is already in use, stop other services or change the port in `docker-compose.yml`.

#### Containers not updating
Rebuild the containers:
```bash
docker compose up --build
```

#### Cannot connect to AAS server
Ensure the BaSyx AAS server is running and accessible.

---

## 👥  Authors

**Prateek  Kumar Sharma**  
🎓 MSc Computer Science — RPTU Kaiserslautern-Landau  
🔗 GitHub Profile: https://github.com/prateeksharma0112/

**📍 Developed at**  
SmartFactory-KL, DFKI (German Research Center for Artificial Intelligence)

🎓 **Coursework (Master's Project)**  
*Development of a GUI for an AAS-Based Production Planning System*

---

## 🤝 Acknowledgments
I would like to express my gratitude to the following organizations and individuals:

- **SmartFactory-KL / DFKI**: For organizing the project framework and providing the academic and research context of industrial production systems.

- **Eclipse BaSyx**: For the open-source Asset Administration Shell (AAS) framework used in this project.

- **RPTU Kaiserslautern-Landau**: For academic guidance and support during the Master's program.

- **Supervisor**: Ali Karnoub at SmartFactory-KL for technical guidance and support.

---

## 📄 License

This project is developed for **academic and research purposes** as part of the SmartFactory-KL student research project.

Unless otherwise specified, the code in this repository is provided for **educational use only** and **cannot be used for commercial purposes** without explicit permission.

For reuse or contributions, please **contact the author** [Prateeksharma0112@gmail.com](Prateeksharma0112@gmail.com).

---
=======
# 2026-10-Development of a GUI for an AAS-Based Production Planning System



## Getting started

To make it easy for you to get started with GitLab, here's a list of recommended next steps.

Already a pro? Just edit this README.md and make it your own. Want to make it easy? [Use the template at the bottom](#editing-this-readme)!

## Add your files

* [Create](https://docs.gitlab.com/user/project/repository/web_editor/#create-a-file) or [upload](https://docs.gitlab.com/user/project/repository/web_editor/#upload-a-file) files
* [Add files using the command line](https://docs.gitlab.com/topics/git/add_files/#add-files-to-a-git-repository) or push an existing Git repository with the following command:

```
cd existing_repo
git remote add origin https://ifs.dfki.de/student-works/smartfactory-design-projekt/2026-10-development-of-a-gui-for-monitoring-a-production-planning-system-using-aas.git
git branch -M main
git push -uf origin main
```

## Integrate with your tools

* [Set up project integrations](https://ifs.dfki.de/student-works/smartfactory-design-projekt/2026-10-development-of-a-gui-for-monitoring-a-production-planning-system-using-aas/-/settings/integrations)

## Collaborate with your team

* [Invite team members and collaborators](https://docs.gitlab.com/user/project/members/)
* [Create a new merge request](https://docs.gitlab.com/user/project/merge_requests/creating_merge_requests/)
* [Automatically close issues from merge requests](https://docs.gitlab.com/user/project/issues/managing_issues/#closing-issues-automatically)
* [Enable merge request approvals](https://docs.gitlab.com/user/project/merge_requests/approvals/)
* [Set auto-merge](https://docs.gitlab.com/user/project/merge_requests/auto_merge/)

## Test and Deploy

Use the built-in continuous integration in GitLab.

* [Get started with GitLab CI/CD](https://docs.gitlab.com/ci/quick_start/)
* [Analyze your code for known vulnerabilities with Static Application Security Testing (SAST)](https://docs.gitlab.com/user/application_security/sast/)
* [Deploy to Kubernetes, Amazon EC2, or Amazon ECS using Auto Deploy](https://docs.gitlab.com/topics/autodevops/requirements/)
* [Use pull-based deployments for improved Kubernetes management](https://docs.gitlab.com/user/clusters/agent/)
* [Set up protected environments](https://docs.gitlab.com/ci/environments/protected_environments/)

***

# Editing this README

When you're ready to make this README your own, just edit this file and use the handy template below (or feel free to structure it however you want - this is just a starting point!). Thanks to [makeareadme.com](https://www.makeareadme.com/) for this template.

## Suggestions for a good README

Every project is different, so consider which of these sections apply to yours. The sections used in the template are suggestions for most open source projects. Also keep in mind that while a README can be too long and detailed, too long is better than too short. If you think your README is too long, consider utilizing another form of documentation rather than cutting out information.

## Name
Choose a self-explaining name for your project.

## Description
Let people know what your project can do specifically. Provide context and add a link to any reference visitors might be unfamiliar with. A list of Features or a Background subsection can also be added here. If there are alternatives to your project, this is a good place to list differentiating factors.

## Badges
On some READMEs, you may see small images that convey metadata, such as whether or not all the tests are passing for the project. You can use Shields to add some to your README. Many services also have instructions for adding a badge.

## Visuals
Depending on what you are making, it can be a good idea to include screenshots or even a video (you'll frequently see GIFs rather than actual videos). Tools like ttygif can help, but check out Asciinema for a more sophisticated method.

## Installation
Within a particular ecosystem, there may be a common way of installing things, such as using Yarn, NuGet, or Homebrew. However, consider the possibility that whoever is reading your README is a novice and would like more guidance. Listing specific steps helps remove ambiguity and gets people to using your project as quickly as possible. If it only runs in a specific context like a particular programming language version or operating system or has dependencies that have to be installed manually, also add a Requirements subsection.

## Usage
Use examples liberally, and show the expected output if you can. It's helpful to have inline the smallest example of usage that you can demonstrate, while providing links to more sophisticated examples if they are too long to reasonably include in the README.

## Support
Tell people where they can go to for help. It can be any combination of an issue tracker, a chat room, an email address, etc.

## Roadmap
If you have ideas for releases in the future, it is a good idea to list them in the README.

## Contributing
State if you are open to contributions and what your requirements are for accepting them.

For people who want to make changes to your project, it's helpful to have some documentation on how to get started. Perhaps there is a script that they should run or some environment variables that they need to set. Make these steps explicit. These instructions could also be useful to your future self.

You can also document commands to lint the code or run tests. These steps help to ensure high code quality and reduce the likelihood that the changes inadvertently break something. Having instructions for running tests is especially helpful if it requires external setup, such as starting a Selenium server for testing in a browser.

## Authors and acknowledgment
Show your appreciation to those who have contributed to the project.

## License
For open source projects, say how it is licensed.

## Project status
If you have run out of energy or time for your project, put a note at the top of the README saying that development has slowed down or stopped completely. Someone may choose to fork your project or volunteer to step in as a maintainer or owner, allowing your project to keep going. You can also make an explicit request for maintainers.
>>>>>>> 7e212a4730def0aad17619adad5af3fc91be22bf
