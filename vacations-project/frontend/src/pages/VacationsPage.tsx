import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { VacationProvider } from '../contexts/VacationContext';
import Layout from '../components/layout/Layout';
import VacationFilters from '../components/vacations/VacationFilters';
import VacationGrid from '../components/vacations/VacationGrid';

const VacationsPage = () => {
  const { auth } = useAuth();
  
  // Redirect to login if not authenticated
  if (!auth.isAuthenticated && !auth.isLoading) {
    return <Navigate to="/login" />;
  }
  
  // Show nothing while checking authentication
  if (auth.isLoading) {
    return null;
  }
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Vacations</h1>
        
        <VacationProvider>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <VacationFilters />
            </div>
            
            <div className="md:col-span-3">
              <VacationGrid />
            </div>
          </div>
        </VacationProvider>
      </div>
    </Layout>
  );
};

export default VacationsPage;