import express from "express";
import Todo from "../modules/Todo.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();
router.use(authenticateToken);

router.get("/", async (req, res) => {
    const todos = await Todo.find({ userId: req.userId });
    res.json(todos);
})

router.post("/", async (req, res) => {
    const { title, description } = req.body;
    if(!title) {
        return res.status(400).json({ message: "Title is required" });
    }
    const todo = new Todo({
        userId: req.userId,
        title,
        description,
    });
    await todo.save();
    res.status(201).json({ todo });
})

router.put("/:todoId", async (req, res) => {
    const { todoId } = req.params;
    const { title, description, completed } = req.body;

    const todo = await Todo.findOneAndUpdate(
        { _id: todoId, userId: req.userId },
        { title, description, completed, updatedAt: new Date() },
        { new: true }
    )

    if(!todo) {
        return res.status(404).json({ message: "Todo not found" });
    }

    res.json(todo);
})

router.delete("/:todoId", async (req, res) => {
    const { todoId } = req.params;
    const todo = await Todo.findOneAndDelete({ _id: todoId, userId: req.userId });
    if(!todo) {
        return res.status(404).json({ message: "Todo not found" });
    }
    res.json({ deleted: todo });
})

export default router;
