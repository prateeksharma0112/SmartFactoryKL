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
- REST API providing production scheduling data

---
