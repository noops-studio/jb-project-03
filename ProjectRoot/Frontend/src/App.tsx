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

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="flex-1 p-4">
        <Routes>
          <Route path="/" element={<Navigate to="/vacations" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/vacations" element={<PrivateRoute><VacationList /></PrivateRoute>} />
          <Route path="/addVacation" element={<AdminRoute><AddVacation /></AdminRoute>} />
          <Route path="/editVacation/:id" element={<AdminRoute><EditVacation /></AdminRoute>} />
          <Route path="/reports" element={<AdminRoute><Reports /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/vacations" />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
