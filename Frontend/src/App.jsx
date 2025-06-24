import React, { useEffect, useState } from "react";
import './App.css'
import axios from "axios";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale);

const API = "http://localhost:5000/api";

function App() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ title: "", amount: "", category: "", date: "" });

  const [authForm, setAuthForm] = useState({ email: "", password: "" });
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    if (token) fetchExpenses();
  }, [token]);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${API}/expenses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(res.data);
    } catch (err) {
      console.error("Fetch error:", err.response?.status, err.response?.data);
    }
  };


  const login = async () => {
    if (!authForm.email || !authForm.password) {
      alert("Please fill in both email and password.");
      return;
    }
    try {
      const res = await axios.post(`${API}/login`, authForm);
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      alert("Login successful");
      setAuthForm({ email: "", password: "" });
    } catch (err) {
      alert("Login failed");
      console.error(err.response?.data);
    }
  };
  const register = async () => {
    if (!authForm.email || !authForm.password) {
      alert("Please fill in both email and password.");
      return;
    }
    try {
      await axios.post(`${API}/register`, authForm);
      alert("Registered successfully. Now log in.");
      setShowLogin(true);
      setAuthForm({ email: "", password: "" });
    } catch (err) {
      alert("Registration failed");
      console.error(err.response?.data);
    }
  };


  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setExpenses([]);
    alert("Logged out");
  };

  const addExpense = async () => {
    if (!form.title || !form.amount || !form.category || !form.date) {
      alert("Please fill all fields before submitting");
      return;
    }

    try {
      await axios.post(`${API}/expenses`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ title: "", amount: "", category: "", date: "" });
      fetchExpenses();
      alert("Expense added successfully");
    } catch (err) {
      console.error("Add expense error:", err.response?.status, err.response?.data);
    }
  };

  const deleteExpense = async (id) => {
    try {
      await axios.delete(`${API}/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchExpenses();
    } catch (err) {
      console.error("Delete error:", err.response?.status, err.response?.data);
    }
  };

  const summary = expenses.reduce(
    (acc, curr) => {
      const date = new Date(curr.date);
      const now = new Date();
      const isThisWeek = now - date < 7 * 24 * 60 * 60 * 1000;
      const isThisMonth = now.getMonth() === date.getMonth();
      if (isThisWeek) acc.week += curr.amount;
      if (isThisMonth) acc.month += curr.amount;
      acc.byCategory[curr.category] = (acc.byCategory[curr.category] || 0) + curr.amount;
      return acc;
    },
    { week: 0, month: 0, byCategory: {} }
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 text-center">
        Welcome to the Expense Tracker Application
      </h2>
      <p className="mb-4 text-center">
        Manage your daily expenses with ease. Track spending, visualize categories with charts, and stay organized. Log in or register to start managing your budget more efficiently.
      </p>
      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Expense Tracker</h1>
          {token && (
            <button
              onClick={logout}
              className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded cursor-pointer"
            >
              Logout
            </button>
          )}
        </div>

        {!token && (
          <div className="mb-4">
            <input
              className="w-full p-2 border rounded mb-2"
              placeholder="Email"
              value={authForm.email}
              onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
            />
            <input
              className="w-full p-2 border rounded mb-2"
              type="password"
              placeholder="Password"
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
            />
            {showLogin ? (
              <>
                <button
                  className="w-full bg-blue-600 text-white py-2 rounded cursor-pointer"
                  onClick={login}
                >
                  Login
                </button>
                <p className="text-sm text-center mt-2">
                  Don't have an account?{" "}
                  <span
                    className="text-blue-600 cursor-pointer"
                    onClick={() => setShowLogin(false)}
                  >
                    Register
                  </span>
                </p>
              </>
            ) : (
              <>
                <button
                  className="w-full bg-green-600 text-white py-2 rounded cursor-pointer"
                  onClick={register}
                >
                  Register
                </button>
                <p className="text-sm text-center mt-2">
                  Already have an account?{" "}
                  <span
                    className="text-blue-600 cursor-pointer cursor-pointer"
                    onClick={() => setShowLogin(true)}
                  >
                    Login
                  </span>
                </p>
              </>
            )}
          </div>
        )}

        {token && (
          <>
            <input
              className="w-full p-2 border rounded mb-2"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <input
              className="w-full p-2 border rounded mb-2"
              type="number"
              placeholder="Amount"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
            <input
              className="w-full p-2 border rounded mb-2"
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            <input
              className="w-full p-2 border rounded mb-2"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />

            <button
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded mb-4 cursor-pointer"
              onClick={addExpense}
            >
              Add Expense
            </button>


            <h2 className="text-xl font-semibold mb-2">Summary</h2>
            <p className="mb-1">This Week: ₹{summary.week.toFixed(2)}</p>
            <p className="mb-4">This Month: ₹{summary.month.toFixed(2)}</p>
            {Object.keys(summary.byCategory).length > 0 && (
              <Pie
                data={{
                  labels: Object.keys(summary.byCategory),
                  datasets: [
                    {
                      data: Object.values(summary.byCategory),
                      backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
                    },
                  ],
                }}
                className="mt-4"
              />
            )}
            <h2 className="text-xl font-semibold mt-6 mb-2">Expenses</h2>

            {expenses.length === 0 ? (
              <p className="text-gray-500 text-sm text-center">
                You have not added any expenses till now.
              </p>
            ) : (
              expenses.map((e) => (
                <div
                  key={e._id}
                  className="flex justify-between items-center border p-2 rounded mb-2 bg-gray-50"
                >
                  <div>
                    <p className="font-medium">
                      {e.title} - ₹{e.amount}
                    </p>
                    <p className="text-sm text-gray-600">
                      {e.category} | {new Date(e.date).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    className="text-red-500 text-sm cursor-pointer"
                    onClick={() => deleteExpense(e._id)}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;