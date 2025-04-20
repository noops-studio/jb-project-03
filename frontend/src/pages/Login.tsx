// src/pages/Login.tsx
import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await API.post("/auth/login", { email, password });
      const { token, user } = res.data;
      login(user, token);
      navigate("/vacations");
    } catch (err: unknown) {
      console.error("Login failed:", err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Login failed. Please check your credentials.");
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white dark:bg-gray-800 shadow-xl rounded-lg">
      <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Sign In</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label className="block mb-4">
          Email:
          <input
            type="email"
            className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="block mb-6">
          Password:
          <input
            type="password"
            className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={4}
          />
        </label>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white py-2 rounded hover:from-green-500 hover:to-blue-600 transition"
        >
          Sign In
        </button>
      </form>
      <p className="mt-6 text-center">
        New user?{" "}
        <Link to="/register" className="text-blue-600 hover:underline">
          Register here
        </Link>
      </p>
    </div>
  );
};

export default Login;
