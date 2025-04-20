import { useVacations } from '../../contexts/VacationContext';
import { VacationFilters as Filters } from '../../types';

const VacationFilters = () => {
  const { filters, setFilters, fetchVacations } = useVacations();
  
  const handleFilterChange = (filterName: keyof Filters, checked: boolean) => {
    const newFilters = {
      ...filters,
      [filterName]: checked,
    };
    
    // Ensure only one date filter is active at a time
    if (filterName === 'upcoming' && checked) {
      newFilters.active = false;
    } else if (filterName === 'active' && checked) {
      newFilters.upcoming = false;
    }
    
    setFilters(newFilters);
    fetchVacations(1); // Reset to first page when filters change
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Filters</h3>
      
      <div className="space-y-2">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="followed"
            checked={!!filters.followed}
            onChange={(e) => handleFilterChange('followed', e.target.checked)}
            className="h-4 w-4 text-primary-600 rounded"
          />
          <label htmlFor="followed" className="ml-2 text-gray-700">
            Show only vacations I follow
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="upcoming"
            checked={!!filters.upcoming}
            onChange={(e) => handleFilterChange('upcoming', e.target.checked)}
            className="h-4 w-4 text-primary-600 rounded"
          />
          <label htmlFor="upcoming" className="ml-2 text-gray-700">
            Show only upcoming vacations
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="active"
            checked={!!filters.active}
            onChange={(e) => handleFilterChange('active', e.target.checked)}
            className="h-4 w-4 text-primary-600 rounded"
          />
          <label htmlFor="active" className="ml-2 text-gray-700">
            Show only active vacations
          </label>
        </div>
      </div>
      
      <button
        onClick={() => {
          setFilters({});
          fetchVacations(1);
        }}
        className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
      >
        Clear Filters
      </button>
    </div>
  );
};

export default VacationFilters;