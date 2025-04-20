import { useEffect } from 'react';
import { useVacations } from '../../contexts/VacationContext';
import VacationCard from './VacationCard';
import LoadingSpinner from '../common/LoadingSpinner';
import Pagination from '../common/Pagination';

const VacationGrid = () => {
  const { 
    vacations, 
    pagination, 
    loading, 
    error, 
    fetchVacations 
  } = useVacations();
  
  useEffect(() => {
    fetchVacations();
  }, [fetchVacations]);
  
  const handlePageChange = (page: number) => {
    fetchVacations(page);
  };
  
  if (loading && vacations.length === 0) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }
  
  if (vacations.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No vacations found</h3>
        <p className="text-gray-600">Try changing your filters or check back later.</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {vacations.map(vacation => (
          <VacationCard key={vacation.vacationId} vacation={vacation} />
        ))}
      </div>
      
      {pagination.totalPages > 1 && (
        <Pagination 
          pagination={pagination} 
          onPageChange={handlePageChange} 
        />
      )}
    </div>
  );
};

export default VacationGrid;