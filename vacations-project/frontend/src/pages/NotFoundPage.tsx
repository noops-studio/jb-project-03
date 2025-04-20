import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';

const NotFoundPage = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto text-center py-16">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-700 mb-6">Page Not Found</h2>
        <p className="text-xl text-gray-600 mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link 
          to="/"
          className="inline-block px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md text-lg transition duration-200"
        >
          Go Back Home
        </Link>
      </div>
    </Layout>
  );
};

export default NotFoundPage;