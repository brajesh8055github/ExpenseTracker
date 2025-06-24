const express = require("express");
const Expense = require("../models/Expense");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/expenses", auth, async (req, res) => {
  const expense = new Expense({ ...req.body, userId: req.userId });
  await expense.save();
  res.status(201).json(expense);
});

router.get("/expenses", auth, async (req, res) => {
  const { category, startDate, endDate } = req.query;
  let filter = { userId: req.userId };
  if (category) filter.category = category;
  if (startDate && endDate) {
    filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }
  const expenses = await Expense.find(filter);
  res.json(expenses);
});

router.delete("/expenses/:id", auth, async (req, res) => {
  await Expense.deleteOne({ _id: req.params.id, userId: req.userId });
  res.sendStatus(204);
});

module.exports = router;