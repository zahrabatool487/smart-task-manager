import { useState, useMemo, useEffect } from "react";

// ── helpers ────────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().split("T")[0];
const fmtDate = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
};
const friendlyDate = (iso) =>
  iso
    ? new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "";
const isOverdue = (t) => !t.done && t.due && t.due < today();
const PRIORITY_ORDER = { high: 0, med: 1, low: 2 };

// ── seed data ──────────────────────────────────────────────────────────────────
const SEED_TASKS = [
  { id: 1, title: "Review Q2 project proposal", notes: "Check all KPIs", priority: "high", cat: "Work", due: fmtDate(0), done: false },
  { id: 2, title: "Morning run — 5km", notes: "Track on Strava", priority: "med", cat: "Health", due: fmtDate(0), done: false },
  { id: 3, title: "Read 'Atomic Habits' ch. 5–7", notes: "", priority: "low", cat: "Learning", due: fmtDate(2), done: false },
  { id: 4, title: "Pay credit card bill", notes: "", priority: "high", cat: "Finance", due: fmtDate(-1), done: false },
  { id: 5, title: "Call dentist for appointment", notes: "", priority: "med", cat: "Personal", due: fmtDate(3), done: false },
  { id: 6, title: "Update LinkedIn profile", notes: "Add recent project", priority: "low", cat: "Work", due: fmtDate(5), done: true },
  { id: 7, title: "Meal prep for the week", notes: "Chicken, rice, veggies", priority: "med", cat: "Health", due: fmtDate(1), done: false },
  { id: 8, title: "Finish React course module 4", notes: "", priority: "high", cat: "Learning", due: fmtDate(-2), done: false },
];

const CATEGORIES = ["Work", "Personal", "Health", "Learning", "Finance"];
const PRIORITIES = [
  { value: "high", label: "High" },
  { value: "med", label: "Medium" },
  { value: "low", label: "Low" },
];
const FILTERS = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "pending", label: "Pending" },
  { key: "done", label: "Completed" },
  { key: "overdue", label: "Overdue" },
];

// ── styles ─────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0f0e0c;
    --surface: #1a1916;
    --surface2: #232220;
    --surface3: #2d2c29;
    --border: rgba(255,255,255,0.07);
    --border2: rgba(255,255,255,0.12);
    --text: #f0ede6;
    --text2: #a09d96;
    --text3: #6b6864;
    --accent: #e8c97a;
    --accent-dim: rgba(232,201,122,0.12);
    --accent-dim2: rgba(232,201,122,0.22);
    --red: #e07070;
    --red-dim: rgba(224,112,112,0.12);
    --green: #7ec9a0;
    --green-dim: rgba(126,201,160,0.12);
    --blue: #7ab4e0;
    --blue-dim: rgba(122,180,224,0.12);
    --radius: 12px;
    --radius-sm: 8px;
    --radius-pill: 999px;
    --shadow: 0 2px 16px rgba(0,0,0,0.4);
  }

  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
  }

  /* Layout */
  .app-shell {
    display: flex;
    min-height: 100vh;
  }

  /* Sidebar */
  .sidebar {
    width: 240px;
    flex-shrink: 0;
    background: var(--surface);
    border-right: 1px solid var(--border);
    padding: 2rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
  }

  .brand {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .brand-name {
    font-family: 'DM Serif Display', serif;
    font-size: 22px;
    color: var(--accent);
    letter-spacing: -0.3px;
    line-height: 1.1;
  }
  .brand-sub {
    font-size: 11px;
    color: var(--text3);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 500;
  }

  .nav-section-label {
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text3);
    font-weight: 600;
    margin-bottom: 6px;
    padding-left: 10px;
  }

  .nav-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 10px;
    border-radius: var(--radius-sm);
    border: none;
    background: none;
    color: var(--text2);
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    font-weight: 400;
    cursor: pointer;
    width: 100%;
    text-align: left;
    transition: all 0.15s;
    position: relative;
  }
  .nav-btn:hover { background: var(--surface2); color: var(--text); }
  .nav-btn.active {
    background: var(--accent-dim);
    color: var(--accent);
    font-weight: 500;
  }
  .nav-btn .nav-icon { font-size: 15px; width: 18px; text-align: center; }
  .nav-count {
    margin-left: auto;
    font-size: 11px;
    background: var(--surface3);
    color: var(--text3);
    padding: 1px 7px;
    border-radius: var(--radius-pill);
  }
  .nav-btn.active .nav-count {
    background: var(--accent-dim2);
    color: var(--accent);
  }

  .cat-dot {
    width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
  }

  /* Main */
  .main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .topbar {
    padding: 1.5rem 2rem;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--bg);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .search-wrap {
    flex: 1;
    position: relative;
    max-width: 380px;
  }
  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text3);
    font-size: 14px;
    pointer-events: none;
  }
  .search-input {
    width: 100%;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    padding: 9px 14px 9px 36px;
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    outline: none;
    transition: border-color 0.15s;
  }
  .search-input::placeholder { color: var(--text3); }
  .search-input:focus { border-color: var(--border2); }

  .topbar-select {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text2);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    padding: 8px 12px;
    outline: none;
    cursor: pointer;
  }

  .add-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--accent);
    color: #0f0e0c;
    border: none;
    border-radius: var(--radius-sm);
    padding: 9px 18px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.1s;
    white-space: nowrap;
  }
  .add-btn:hover { opacity: 0.9; }
  .add-btn:active { transform: scale(0.98); }

  /* Stats strip */
  .stats-strip {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border-bottom: 1px solid var(--border);
  }
  .stat-cell {
    padding: 1.25rem 2rem;
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .stat-cell:last-child { border-right: none; }
  .stat-num {
    font-family: 'DM Serif Display', serif;
    font-size: 32px;
    color: var(--text);
    line-height: 1;
  }
  .stat-num.accent { color: var(--accent); }
  .stat-num.green { color: var(--green); }
  .stat-num.red { color: var(--red); }
  .stat-label { font-size: 12px; color: var(--text3); font-weight: 500; letter-spacing: 0.04em; }

  /* Content area */
  .content {
    flex: 1;
    padding: 2rem;
    overflow-y: auto;
  }

  .section-header {
    display: flex;
    align-items: baseline;
    gap: 10px;
    margin-bottom: 1.5rem;
  }
  .section-title {
    font-family: 'DM Serif Display', serif;
    font-size: 22px;
    color: var(--text);
  }
  .section-count {
    font-size: 13px;
    color: var(--text3);
  }

  /* Task list */
  .task-list { display: flex; flex-direction: column; gap: 6px; }

  .task-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 14px 16px;
    display: flex;
    align-items: flex-start;
    gap: 14px;
    transition: border-color 0.15s, background 0.15s;
    animation: slideIn 0.2s ease;
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .task-card:hover { border-color: var(--border2); background: var(--surface2); }
  .task-card.done { opacity: 0.45; }
  .task-card.done .task-title { text-decoration: line-through; color: var(--text3); }
  .task-card.overdue-card { border-color: rgba(224,112,112,0.2); }

  .check-btn {
    width: 20px; height: 20px;
    border-radius: 50%;
    border: 1.5px solid var(--border2);
    background: none;
    cursor: pointer;
    flex-shrink: 0;
    margin-top: 2px;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
  }
  .check-btn:hover { border-color: var(--green); }
  .check-btn.checked { background: var(--green); border-color: var(--green); }
  .check-btn.checked::after {
    content: '';
    display: block;
    width: 10px; height: 6px;
    border-left: 2px solid #0f0e0c;
    border-bottom: 2px solid #0f0e0c;
    transform: rotate(-45deg) translateY(-1px);
  }

  .task-body { flex: 1; min-width: 0; }
  .task-title { font-size: 14px; font-weight: 500; color: var(--text); margin-bottom: 6px; line-height: 1.4; }
  .task-notes { font-size: 12px; color: var(--text3); margin-bottom: 8px; line-height: 1.5; }
  .task-meta { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }

  .badge {
    font-size: 11px;
    font-weight: 500;
    padding: 2px 9px;
    border-radius: var(--radius-pill);
  }
  .badge-high { background: var(--red-dim); color: var(--red); }
  .badge-med { background: var(--accent-dim); color: var(--accent); }
  .badge-low { background: var(--green-dim); color: var(--green); }
  .badge-cat { background: var(--surface3); color: var(--text2); }
  .badge-due { background: none; color: var(--text3); font-size: 11px; padding: 0; }
  .badge-overdue { color: var(--red); }

  .task-actions { display: flex; gap: 4px; flex-shrink: 0; }
  .icon-btn {
    background: none; border: none;
    color: var(--text3); cursor: pointer;
    padding: 5px; border-radius: var(--radius-sm);
    font-size: 14px; line-height: 1;
    transition: color 0.15s, background 0.15s;
  }
  .icon-btn:hover { color: var(--text); background: var(--surface3); }
  .icon-btn.del:hover { color: var(--red); }

  .empty-state {
    text-align: center;
    padding: 5rem 2rem;
    color: var(--text3);
  }
  .empty-state .empty-icon { font-size: 36px; margin-bottom: 1rem; }
  .empty-state p { font-size: 14px; }

  /* Modal */
  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(4px);
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    animation: fadeIn 0.15s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .modal {
    background: var(--surface);
    border: 1px solid var(--border2);
    border-radius: var(--radius);
    padding: 1.75rem;
    width: 100%;
    max-width: 460px;
    box-shadow: var(--shadow);
    animation: modalIn 0.2s ease;
  }
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.96) translateY(10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
  }
  .modal-title {
    font-family: 'DM Serif Display', serif;
    font-size: 20px;
    color: var(--text);
  }
  .modal-close {
    background: none; border: none;
    color: var(--text3); cursor: pointer;
    font-size: 18px; padding: 4px;
    border-radius: var(--radius-sm);
    transition: color 0.15s;
  }
  .modal-close:hover { color: var(--text); }

  .form-group { margin-bottom: 16px; }
  .form-label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--text3);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  .form-input, .form-select, .form-textarea {
    width: 100%;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    padding: 10px 12px;
    outline: none;
    transition: border-color 0.15s;
  }
  .form-input:focus, .form-select:focus, .form-textarea:focus {
    border-color: var(--accent);
  }
  .form-input::placeholder, .form-textarea::placeholder { color: var(--text3); }
  .form-textarea { height: 80px; resize: vertical; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 1.5rem;
    padding-top: 1.25rem;
    border-top: 1px solid var(--border);
  }
  .btn-ghost {
    background: none;
    border: 1px solid var(--border2);
    border-radius: var(--radius-sm);
    color: var(--text2);
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    padding: 9px 18px;
    cursor: pointer;
    transition: background 0.15s;
  }
  .btn-ghost:hover { background: var(--surface2); }

  /* Category color mapping */
  .dot-Work { background: #7ab4e0; }
  .dot-Personal { background: #c47ae0; }
  .dot-Health { background: #7ec9a0; }
  .dot-Learning { background: #e0b47a; }
  .dot-Finance { background: #e07a7a; }

  /* Responsive */
  @media (max-width: 768px) {
    .sidebar { display: none; }
    .stats-strip { grid-template-columns: repeat(2, 1fr); }
    .stat-cell { padding: 1rem; }
    .content { padding: 1.25rem; }
    .topbar { padding: 1rem; gap: 8px; }
  }
`;

// ── Category color ─────────────────────────────────────────────────────────────
const CAT_COLORS = {
  Work: "#7ab4e0",
  Personal: "#c47ae0",
  Health: "#7ec9a0",
  Learning: "#e0b47a",
  Finance: "#e07a7a",
};

// ── TaskModal ──────────────────────────────────────────────────────────────────
function TaskModal({ task, onSave, onClose }) {
  const [form, setForm] = useState({
    title: task?.title || "",
    notes: task?.notes || "",
    priority: task?.priority || "med",
    cat: task?.cat || "Work",
    due: task?.due || fmtDate(1),
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.title.trim()) return;
    onSave({ ...form, title: form.title.trim() });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{task ? "Edit Task" : "New Task"}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="form-group">
          <label className="form-label">Title</label>
          <input
            className="form-input"
            placeholder="What needs to be done?"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea
            className="form-textarea"
            placeholder="Add details or context..."
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select className="form-select" value={form.priority} onChange={(e) => set("priority", e.target.value)}>
              {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" value={form.cat} onChange={(e) => set("cat", e.target.value)}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Due Date</label>
          <input className="form-input" type="date" value={form.due} onChange={(e) => set("due", e.target.value)} />
        </div>

        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="add-btn" onClick={handleSave} style={{ padding: "9px 22px" }}>
            {task ? "Update" : "Add Task"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── TaskCard ───────────────────────────────────────────────────────────────────
function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const over = isOverdue(task);
  const dueLabel = friendlyDate(task.due);

  return (
    <div className={`task-card ${task.done ? "done" : ""} ${over ? "overdue-card" : ""}`}>
      <button
        className={`check-btn ${task.done ? "checked" : ""}`}
        onClick={() => onToggle(task.id)}
        title={task.done ? "Mark incomplete" : "Mark complete"}
      />
      <div className="task-body">
        <div className="task-title">{task.title}</div>
        {task.notes && <div className="task-notes">{task.notes}</div>}
        <div className="task-meta">
          <span className={`badge badge-${task.priority}`}>
            {task.priority === "med" ? "Medium" : task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
          <span className="badge badge-cat">{task.cat}</span>
          {dueLabel && (
            <span className={`badge badge-due ${over ? "badge-overdue" : ""}`}>
              {over ? "⚠ Overdue · " : "📅 "}{dueLabel}
            </span>
          )}
        </div>
      </div>
      <div className="task-actions">
        <button className="icon-btn" onClick={() => onEdit(task)} title="Edit">✎</button>
        <button className="icon-btn del" onClick={() => onDelete(task.id)} title="Delete">✕</button>
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────────
export default function SmartTaskManager() {
  const [tasks, setTasks] = useState(SEED_TASKS);
  const [nextId, setNextId] = useState(9);
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [catFilter, setCatFilter] = useState("");
  const [modal, setModal] = useState(null); // null | "new" | task-object

  // Inject styles
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = css;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  const tod = today();

  // stats
  const stats = useMemo(() => ({
    total: tasks.length,
    done: tasks.filter((t) => t.done).length,
    pending: tasks.filter((t) => !t.done).length,
    overdue: tasks.filter((t) => isOverdue(t)).length,
  }), [tasks]);

  // filter counts for sidebar
  const filterCounts = useMemo(() => ({
    all: tasks.length,
    today: tasks.filter((t) => t.due === tod).length,
    pending: tasks.filter((t) => !t.done).length,
    done: tasks.filter((t) => t.done).length,
    overdue: tasks.filter((t) => isOverdue(t)).length,
  }), [tasks, tod]);

  // cat counts
  const catCounts = useMemo(() => {
    const m = {};
    CATEGORIES.forEach((c) => { m[c] = tasks.filter((t) => t.cat === c).length; });
    return m;
  }, [tasks]);

  // filtered + sorted tasks
  const displayed = useMemo(() => {
    let list = tasks.filter((t) => {
      const q = search.toLowerCase();
      if (q && !t.title.toLowerCase().includes(q) && !t.notes.toLowerCase().includes(q)) return false;
      if (catFilter && t.cat !== catFilter) return false;
      if (activeFilter === "today") return t.due === tod;
      if (activeFilter === "pending") return !t.done;
      if (activeFilter === "done") return t.done;
      if (activeFilter === "overdue") return isOverdue(t);
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === "priority") return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (sortBy === "name") return a.title.localeCompare(b.title);
      return (a.due || "").localeCompare(b.due || "");
    });

    return list;
  }, [tasks, search, catFilter, activeFilter, sortBy, tod]);

  const sectionLabel = FILTERS.find((f) => f.key === activeFilter)?.label || "All";

  // actions
  const toggleDone = (id) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const deleteTask = (id) =>
    setTasks((prev) => prev.filter((t) => t.id !== id));

  const saveTask = (data) => {
    if (modal && typeof modal === "object") {
      setTasks((prev) => prev.map((t) => (t.id === modal.id ? { ...t, ...data } : t)));
    } else {
      setTasks((prev) => [...prev, { id: nextId, done: false, ...data }]);
      setNextId((n) => n + 1);
    }
    setModal(null);
  };

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-name">Taskwise</span>
          <span className="brand-sub">Smart Task Manager</span>
        </div>

        <div>
          <div className="nav-section-label">Views</div>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`nav-btn ${activeFilter === f.key ? "active" : ""}`}
              onClick={() => { setActiveFilter(f.key); setCatFilter(""); }}
            >
              <span className="nav-icon">
                {f.key === "all" && "⊞"}
                {f.key === "today" && "◎"}
                {f.key === "pending" && "◷"}
                {f.key === "done" && "✓"}
                {f.key === "overdue" && "⚠"}
              </span>
              {f.label}
              <span className="nav-count">{filterCounts[f.key]}</span>
            </button>
          ))}
        </div>

        <div>
          <div className="nav-section-label">Categories</div>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`nav-btn ${catFilter === c && activeFilter === "all" ? "active" : ""}`}
              onClick={() => { setCatFilter(c); setActiveFilter("all"); }}
            >
              <span
                className="cat-dot"
                style={{ background: CAT_COLORS[c] }}
              />
              {c}
              <span className="nav-count">{catCounts[c]}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        {/* Topbar */}
        <div className="topbar">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="topbar-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="date">Sort: Date</option>
            <option value="priority">Sort: Priority</option>
            <option value="name">Sort: Name</option>
          </select>
          <button className="add-btn" onClick={() => setModal("new")}>
            + New Task
          </button>
        </div>

        {/* Stats */}
        <div className="stats-strip">
          <div className="stat-cell">
            <span className="stat-num">{stats.total}</span>
            <span className="stat-label">Total Tasks</span>
          </div>
          <div className="stat-cell">
            <span className="stat-num green">{stats.done}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-cell">
            <span className="stat-num accent">{stats.pending}</span>
            <span className="stat-label">In Progress</span>
          </div>
          <div className="stat-cell">
            <span className="stat-num red">{stats.overdue}</span>
            <span className="stat-label">Overdue</span>
          </div>
        </div>

        {/* Task list */}
        <div className="content">
          <div className="section-header">
            <span className="section-title">{catFilter || sectionLabel}</span>
            <span className="section-count">{displayed.length} task{displayed.length !== 1 ? "s" : ""}</span>
          </div>

          {displayed.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>No tasks found. Add one to get started!</p>
            </div>
          ) : (
            <div className="task-list">
              {displayed.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onToggle={toggleDone}
                  onEdit={(task) => setModal(task)}
                  onDelete={deleteTask}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {modal && (
        <TaskModal
          task={typeof modal === "object" ? modal : null}
          onSave={saveTask}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}