import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import { AuthContext } from "../context/AuthContext";

const Register: React.FC = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await API.post("/auth/register", { firstName, lastName, email, password });
      const { token, user } = res.data;
      login(user, token);  // Log the user in on successful registration
      navigate("/vacations");
    } catch (err: any) {
      console.error("Registration failed:", err);
      setError(err.response?.data?.message || "Registration failed.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded">
      <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
      {error && <p className="text-red-600 mb-3">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label className="block mb-2">
          First Name:
          <input 
            type="text" 
            className="block w-full border rounded px-3 py-2 mt-1"
            value={firstName} 
            onChange={e => setFirstName(e.target.value)}
            required 
          />
        </label>
        <label className="block mb-2">
          Last Name:
          <input 
            type="text" 
            className="block w-full border rounded px-3 py-2 mt-1"
            value={lastName} 
            onChange={e => setLastName(e.target.value)}
            required 
          />
        </label>
        <label className="block mb-2">
          Email:
          <input 
            type="email" 
            className="block w-full border rounded px-3 py-2 mt-1"
            value={email} 
            onChange={e => setEmail(e.target.value)}
            required 
          />
        </label>
        <label className="block mb-4">
          Password:
          <input 
            type="password" 
            className="block w-full border rounded px-3 py-2 mt-1"
            value={password} 
            onChange={e => setPassword(e.target.value)}
            required 
            minLength={4}
          />
        </label>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
          Sign Up
        </button>
      </form>
      <p className="mt-4 text-center">
        Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
      </p>
    </div>
  );
};

export default Register;
