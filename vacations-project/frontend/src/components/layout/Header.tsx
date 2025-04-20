
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <header className="bg-primary-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold">
              Vacation System
            </Link>
          </div>
          
          <nav>
            <ul className="flex space-x-6">
              {!auth.isAuthenticated ? (
                <>
                  <li>
                    <Link 
                      to="/login" 
                      className="hover:text-primary-200 transition-colors"
                    >
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/register" 
                      className="hover:text-primary-200 transition-colors"
                    >
                      Register
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link 
                      to="/vacations" 
                      className="hover:text-primary-200 transition-colors"
                    >
                      Vacations
                    </Link>
                  </li>
                  
                  {auth.user?.role === 'admin' && (
                    <>
                      <li>
                        <Link 
                          to="/admin/add-vacation" 
                          className="hover:text-primary-200 transition-colors"
                        >
                          Add Vacation
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/admin/reports" 
                          className="hover:text-primary-200 transition-colors"
                        >
                          Reports
                        </Link>
                      </li>
                    </>
                  )}
                  
                  <li className="flex items-center">
                    <span className="mr-4">
                      Hello, {auth.user?.firstName} {auth.user?.lastName}
                    </span>
                    <button 
                      onClick={handleLogout}
                      className="px-3 py-1 bg-primary-700 rounded hover:bg-primary-800 transition-colors"
                    >
                      Logout
                    </button>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
