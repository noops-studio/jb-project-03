import { useState, useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { VacationProvider } from '../../contexts/VacationContext';
import Layout from '../../components/layout/Layout';
import VacationForm from '../../components/admin/VacationForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Vacation } from '../../types';
import api from '../../services/api';

const EditVacationPage = () => {
  const { auth } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [vacation, setVacation] = useState<Vacation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchVacation = async () => {
      try {
        const response = await api.get<Vacation>(`/vacations/${id}`);
        setVacation(response.data);
      } catch (error) {
        console.error('Error fetching vacation details:', error);
        setError('Failed to load vacation details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchVacation();
    }
  }, [id]);
  
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
  
  if (loading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }
  
  if (error || !vacation) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error || 'Vacation not found'}
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <VacationProvider>
          <VacationForm 
            vacationId={parseInt(id as string)} 
            initialData={vacation} 
          />
        </VacationProvider>
      </div>
    </Layout>
  );
};

export default EditVacationPage;