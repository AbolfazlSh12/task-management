import express from "express";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();
const TASKS_FILE = "./data/tasks.json";
const USERS_FILE = "./data/users.json";

function readTasks() {
  if (!fs.existsSync(TASKS_FILE)) return [];
  const data = fs.readFileSync(TASKS_FILE);
  return JSON.parse(data);
}

function writeTasks(tasks) {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

function isAdmin(req) {
  const { userId } = req.headers;
  const users = JSON.parse(fs.readFileSync(USERS_FILE));
  const user = users.find((u) => u.id === userId);
  return user && user.isAdmin;
}

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management
 */

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks (Admin only)
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: List of all tasks
 *       403:
 *         description: Access denied
 */
router.get("/", (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ message: "Access denied" });

  const tasks = readTasks();
  res.json(tasks);
});

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created successfully
 */
router.post("/", (req, res) => {
  const { title, description } = req.body;
  const tasks = readTasks();

  const newTask = { id: uuidv4(), title, description, assignedTo: null };
  tasks.push(newTask);
  writeTasks(tasks);

  res.status(201).json({ message: "Task created successfully", task: newTask });
});

// Define other CRUD operations with Swagger comments...

export default router;
