// src/controllers/analyticsController.js
const Project = require("../models/Project");

const STATUS_LIST = ["draft", "in_review", "changes_requested", "approved"];

function monthKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function monthLabel(date) {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
function lastNMonths(n) {
  const months = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: monthKey(date), label: monthLabel(date) });
  }
  return months;
}

// GET /api/analytics/overview
async function getOverview(req, res, next) {
  try {
    const projects = await Project.find({ freelancer: req.user._id }).select(
      "status clientName clientEmail createdAt"
    );

    const totalProjects = projects.length;
    const approvedProjects = projects.filter((p) => p.status === "approved").length;

    const statusCounts = Object.fromEntries(STATUS_LIST.map((s) => [s, 0]));
    projects.forEach((p) => {
      statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
    });
    const statusBreakdown = STATUS_LIST.map((status) => ({ status, count: statusCounts[status] }));

    // Distinct clients, identified by email (falls back to name if no email was given),
    // plus the date each one's FIRST project was created — that's when they "became a client."
    const clientKey = (p) => (p.clientEmail || p.clientName || "").toLowerCase().trim();
    const clientFirstSeen = new Map(); // key -> Date
    projects.forEach((p) => {
      const key = clientKey(p);
      if (!key) return;
      const created = new Date(p.createdAt);
      const existing = clientFirstSeen.get(key);
      if (!existing || created < existing) clientFirstSeen.set(key, created);
    });
    const totalClients = clientFirstSeen.size;

    const months = lastNMonths(6); // oldest -> newest
    const windowStartKey = months[0].key;

    // bucket "new" counts by month key first (cheap, O(n)) — avoids re-scanning
    // every client/project for every month
    const newClientsByMonth = {};
    clientFirstSeen.forEach((firstDate) => {
      const k = monthKey(firstDate);
      newClientsByMonth[k] = (newClientsByMonth[k] || 0) + 1;
    });
    const newProjectsByMonth = {};
    projects.forEach((p) => {
      const k = monthKey(p.createdAt);
      newProjectsByMonth[k] = (newProjectsByMonth[k] || 0) + 1;
    });

    // seed the running totals with anything that happened BEFORE the visible
    // window, so the first point on the chart reflects real history instead
    // of falsely resetting an established freelancer's numbers to zero
    let clientRunning = 0;
    Object.entries(newClientsByMonth).forEach(([k, count]) => {
      if (k < windowStartKey) clientRunning += count;
    });
    let projectRunning = 0;
    Object.entries(newProjectsByMonth).forEach(([k, count]) => {
      if (k < windowStartKey) projectRunning += count;
    });

    const clientGrowth = months.map(({ key, label }) => {
      clientRunning += newClientsByMonth[key] || 0;
      return { month: label, clients: clientRunning };
    });
    const projectGrowth = months.map(({ key, label }) => {
      projectRunning += newProjectsByMonth[key] || 0;
      return { month: label, projects: projectRunning };
    });

    res.json({ totalProjects, approvedProjects, totalClients, statusBreakdown, clientGrowth, projectGrowth });
  } catch (err) {
    next(err);
  }
}

module.exports = { getOverview };
