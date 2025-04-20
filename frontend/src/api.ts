import axios from "axios";

// You can set the API URL via an environment variable for flexibility
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Create an Axios instance
const API = axios.create({
  baseURL: BASE_URL
});

// Attach token to each request if available
API.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
