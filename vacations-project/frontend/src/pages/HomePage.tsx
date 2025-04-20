import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';

const HomePage = () => {
  const { auth } = useAuth();
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Welcome to Vacation System</h1>
        <p className="text-xl text-gray-600 mb-8">
          Discover and follow your dream vacations around the world.
        </p>
        
        {auth.isAuthenticated ? (
          <Link 
            to="/vacations"
            className="inline-block px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md text-lg transition duration-200"
          >
            Browse Vacations
          </Link>
        ) : (
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link 
              to="/login"
              className="inline-block px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md text-lg transition duration-200"
            >
              Login
            </Link>
            <Link 
              to="/register"
              className="inline-block px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md text-lg transition duration-200"
            >
              Register
            </Link>
          </div>
        )}
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Discover</h3>
            <p className="text-gray-600">
              Browse through a curated list of vacation destinations from around the world.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Follow</h3>
            <p className="text-gray-600">
              Follow your favorite vacations to keep track of them and stay updated.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Plan</h3>
            <p className="text-gray-600">
              Get all the details you need to plan your next perfect getaway.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;