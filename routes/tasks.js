import express from "express";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();
const TASKS_FILE = "./data/tasks.json";
const USERS_FILE = "./data/users.json";

const readTasks = () => {
  if (!fs.existsSync(TASKS_FILE)) return [];
  const data = fs.readFileSync(TASKS_FILE);
  return JSON.parse(data);
};

const writeTasks = (tasks) => {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
};

const isAdmin = (req) => {
  const { userId } = req.headers;
  const users = JSON.parse(fs.readFileSync(USERS_FILE));
  const user = users.find((u) => u.id === userId);
  return user && user.isAdmin;
};

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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   assignedTo:
 *                     type: string
 *                     nullable: true
 *       403:
 *         description: Access denied
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get("/", (req, res) => {
  //   if (!isAdmin(req)) return res.status(403).json({ message: "Access denied" });

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
 *                 description: Title of the task
 *                 example: "Complete the project documentation"
 *               description:
 *                 type: string
 *                 description: Description of the task
 *                 example: "Finish writing the documentation for the new project"
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Unique identifier for the task
 *                   example: "1a2b3c4d"
 *                 title:
 *                   type: string
 *                   description: Title of the task
 *                   example: "Complete the project documentation"
 *                 description:
 *                   type: string
 *                   description: Description of the task
 *                   example: "Finish writing the documentation for the new project"
 *                 assignedTo:
 *                   type: string
 *                   nullable: true
 *                   description: ID of the user assigned to the task
 *                   example: "user123"
 *       400:
 *         description: Invalid request body
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Title is required"
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
