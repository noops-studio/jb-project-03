// src/components/NavBar.tsx
import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const NavBar: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold">Vacation System</div>
        <div className="hidden md:flex space-x-6">
          {!user ? (
            <>
              <Link to="/login" className="hover:underline">Login</Link>
              <Link to="/register" className="hover:underline">Register</Link>
            </>
          ) : (
            <>
              <Link to="/vacations" className="hover:underline">Vacations</Link>
              {user.role === "admin" && (
                <>
                  <Link to="/addVacation" className="hover:underline">Add Vacation</Link>
                  <Link to="/reports" className="hover:underline">Reports</Link>
                </>
              )}
              <span className="font-semibold">Hi, {user.firstName}!</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </button>
        </div>
      </div>
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 flex flex-col space-y-3">
          {!user ? (
            <>
              <Link onClick={() => setIsOpen(false)} to="/login" className="hover:underline">Login</Link>
              <Link onClick={() => setIsOpen(false)} to="/register" className="hover:underline">Register</Link>
            </>
          ) : (
            <>
              <Link onClick={() => setIsOpen(false)} to="/vacations" className="hover:underline">Vacations</Link>
              {user.role === "admin" && (
                <>
                  <Link onClick={() => setIsOpen(false)} to="/addVacation" className="hover:underline">Add Vacation</Link>
                  <Link onClick={() => setIsOpen(false)} to="/reports" className="hover:underline">Reports</Link>
                </>
              )}
              <span className="font-semibold">Hi, {user.firstName}!</span>
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default NavBar;
