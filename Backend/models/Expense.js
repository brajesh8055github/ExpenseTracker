const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  userId: String,
  title: String,
  amount: Number,
  category: String,
  date: Date,
});

module.exports = mongoose.model("Expense", expenseSchema);
