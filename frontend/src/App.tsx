import React, { JSX, useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import NavBar from "./components/NavBar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VacationList from "./pages/VacationList";
import AddVacation from "./pages/AddVacation";
import EditVacation from "./pages/EditVacation";
import Reports from "./pages/Reports";

// Wrapper for routes that require login
const PrivateRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
};

// Wrapper for routes that require admin role
const AdminRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { user } = useContext(AuthContext);
  return (user && user.role === "admin") ? children : <Navigate to="/vacations" />;
};

// Auth-aware redirect for login/register pages
const PublicRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { user } = useContext(AuthContext);
  // If user is logged in, redirect to vacations page
  return user ? <Navigate to="/vacations" replace /> : children;
};

const App: React.FC = () => {
  const { user } = useContext(AuthContext);
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="flex-1 p-4">
        <Routes>
          <Route path="/" element={<Navigate to={user ? "/vacations" : "/login"} replace />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/vacations" element={<PrivateRoute><VacationList /></PrivateRoute>} />
          <Route path="/addVacation" element={<AdminRoute><AddVacation /></AdminRoute>} />
          <Route path="/editVacation/:id" element={<AdminRoute><EditVacation /></AdminRoute>} />
          <Route path="/reports" element={<AdminRoute><Reports /></AdminRoute>} />
          <Route path="*" element={<Navigate to={user ? "/vacations" : "/login"} replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
