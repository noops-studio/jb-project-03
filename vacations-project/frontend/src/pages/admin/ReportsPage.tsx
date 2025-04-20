import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/layout/Layout';
import ReportChart from '../../components/admin/ReportChart';

const ReportsPage = () => {
  const { auth } = useAuth();
  
  // Redirect to login if not authenticated
  if (!auth.isAuthenticated && !auth.isLoading) {
    return <Navigate to="/login" />;
  }
  
  // Redirect to vacations if not admin
  if (auth.user?.role !== 'admin') {
    return <Navigate to="/vacations" />;
  }
  
  // Show nothing while checking authentication
  if (auth.isLoading) {
    return null;
  }
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Vacation Reports</h1>
        <ReportChart />
      </div>
    </Layout>
  );
};

export default ReportsPage;