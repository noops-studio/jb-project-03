import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { VacationProvider } from '../../contexts/VacationContext';
import Layout from '../../components/layout/Layout';
import VacationForm from '../../components/admin/VacationForm';

const AddVacationPage = () => {
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
      <div className="max-w-3xl mx-auto">
        <VacationProvider>
          <VacationForm />
        </VacationProvider>
      </div>
    </Layout>
  );
};

export default AddVacationPage;