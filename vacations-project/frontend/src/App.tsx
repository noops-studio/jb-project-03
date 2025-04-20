import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VacationsPage from './pages/VacationsPage';
import AddVacationPage from './pages/admin/AddVacationPage';
import EditVacationPage from './pages/admin/EditVacationPage';
import ReportsPage from './pages/admin/ReportsPage';
import NotFoundPage from './pages/NotFoundPage';

// Import global styles
// import 'react-toastify/dist/ReactToastify.css';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected routes */}
          <Route path="/vacations" element={<VacationsPage />} />
          
          {/* Admin routes */}
          <Route path="/admin/add-vacation" element={<AddVacationPage />} />
          <Route path="/admin/edit-vacation/:id" element={<EditVacationPage />} />
          <Route path="/admin/reports" element={<ReportsPage />} />
          
          {/* Not found and redirects */}
          <Route path="/admin" element={<Navigate to="/admin/reports" />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
      
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </AuthProvider>
  );
}

export default App;