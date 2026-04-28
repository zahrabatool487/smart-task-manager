# Taskwise — Smart Task Manager

A sleek, dark-themed task management dashboard built with React. Organize your work by priority, category, and due date with an intuitive sidebar navigation and real-time stats overview.


---

## Features

- **Smart Views** — Filter tasks by All, Today, Pending, Completed, or Overdue
- **Category Organization** — Group tasks into Work, Personal, Health, Learning, and Finance
- **Priority Levels** — Assign High, Medium, or Low priority with color-coded badges
- **Due Date Tracking** — Visual overdue warnings and friendly date formatting
- **Real-time Stats** — Dashboard counters for total, completed, in-progress, and overdue tasks
- **Search & Sort** — Instantly find tasks and sort by date, priority, or name
- **Full CRUD** — Create, read, update, and delete tasks with a polished modal form
- **Dark UI** — Elegant dark theme with warm accent colors and smooth animations
- **Responsive** — Adapts to smaller screens with adjusted layouts
- **Seed Data** — Pre-loaded demo tasks so you can explore immediately

---

## Preview

The app features a two-column layout:

- **Left Sidebar** — Navigation between views and category filters with live task counts
- **Main Panel** — Top search bar, stats strip, and scrollable task list with quick actions

Clicking a task's checkbox marks it complete. Use the ✎ icon to edit and ✕ to delete.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 | UI library with Hooks (useState, useMemo, useEffect) |
| CSS3 | Custom design system with CSS variables, Grid, Flexbox, and keyframe animations |
| Google Fonts | DM Sans & DM Serif Display typography |
| Create React App | Build tooling and development server |

No external UI frameworks — everything is hand-crafted CSS for full control.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- npm (comes with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/smart-task-manager.git
   cd smart-task-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

   The app will open at [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Runs the app in development mode with hot reload |
| `npm test` | Launches the test runner in interactive watch mode |
| `npm run build` | Builds the app for production to the `build` folder |
| `npm run eject` | Ejects from Create React App (one-way operation) |

---

## Project Structure

```
smart-task-manager/
├── public/
│   ├── index.html
│   └── ...                 # Static assets
├── src/
│   ├── App.js              # Main application component (all logic + styles)
│   ├── App.css             # (unused — styles are injected via JS)
│   ├── index.js            # React root entry
│   └── ...                 # Setup and utility files
├── package.json
└── README.md
```

> **Note:** All component logic, state management, and styles live in `src/App.js` for simplicity in this demo project.

---

## Usage Guide

### Managing Tasks

| Action | How |
|--------|-----|
| **Add Task** | Click "+ New Task" in the top bar, fill the form, and save |
| **Edit Task** | Click the ✎ icon on any task card |
| **Complete** | Click the circle checkbox on a task card |
| **Delete** | Click the ✕ icon on a task card |

### Filtering & Sorting

- **Sidebar Views** — Switch between All, Today, Pending, Completed, and Overdue
- **Categories** — Click a category in the sidebar to filter by Work, Personal, Health, Learning, or Finance
- **Search** — Type in the top search bar to find tasks by title or notes
- **Sort** — Use the "Sort" dropdown to order by Date, Priority, or Name

---

## Customization

### Changing Categories

Edit the `CATEGORIES` array in `src/App.js`:

```javascript
const CATEGORIES = ["Work", "Personal", "Health", "Learning", "Finance"];
```

### Changing Category Colors

Edit the `CAT_COLORS` object in `src/App.js`:

```javascript
const CAT_COLORS = {
  Work: "#7ab4e0",
  Personal: "#c47ae0",
  Health: "#7ec9a0",
  Learning: "#e0b47a",
  Finance: "#e07a7a",
};
```

### Modifying Seed Data

Replace or extend the `SEED_TASKS` array in `src/App.js` with your own initial tasks.

### Theme Adjustments

All design tokens are CSS custom properties defined in the `css` template string at the top of `src/App.js`. Modify `--bg`, `--accent`, `--surface`, etc., to change the look and feel.

---



