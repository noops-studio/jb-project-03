import { createContext, useContext, useState, ReactNode } from 'react';
import { 
  Vacation, 
  VacationFilters, 
  VacationsResponse, 
  VacationRequest, 
  PaginationInfo 
} from '../types';
import api from '../services/api';

// Define context shape
interface VacationContextType {
  vacations: Vacation[];
  pagination: PaginationInfo;
  filters: VacationFilters;
  loading: boolean;
  error: string | null;
  setFilters: (filters: VacationFilters) => void;
  fetchVacations: (page?: number) => Promise<void>;
  followVacation: (vacationId: number) => Promise<void>;
  unfollowVacation: (vacationId: number) => Promise<void>;
  addVacation: (vacation: VacationRequest) => Promise<void>;
  updateVacation: (vacationId: number, vacation: VacationRequest) => Promise<void>;
  deleteVacation: (vacationId: number) => Promise<void>;
}

// Create context with default values
const VacationContext = createContext<VacationContextType>({
  vacations: [],
  pagination: { page: 1, limit: 10, totalItems: 0, totalPages: 0 },
  filters: {},
  loading: false,
  error: null,
  setFilters: () => {},
  fetchVacations: async () => {},
  followVacation: async () => {},
  unfollowVacation: async () => {},
  addVacation: async () => {},
  updateVacation: async () => {},
  deleteVacation: async () => {},
});

// Context provider component
export const VacationProvider = ({ children }: { children: ReactNode }) => {
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<VacationFilters>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch vacations with pagination and filters
  const fetchVacations = async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(filters.followed ? { followed: 'true' } : {}),
        ...(filters.upcoming ? { upcoming: 'true' } : {}),
        ...(filters.active ? { active: 'true' } : {}),
      });
      
      const response = await api.get<VacationsResponse>(`/vacations?${params}`);
      
      setVacations(response.data.vacations);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching vacations:', error);
      setError('Failed to load vacations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Follow vacation
  const followVacation = async (vacationId: number) => {
    try {
      await api.post(`/vacations/${vacationId}/follow`);
      
      // Update local state
      setVacations(prevVacations => 
        prevVacations.map(vacation => 
          vacation.vacationId === vacationId 
            ? { 
                ...vacation, 
                isFollowing: 1, 
                followersCount: vacation.followersCount + 1 
              } 
            : vacation
        )
      );
    } catch (error) {
      console.error('Error following vacation:', error);
      throw error;
    }
  };

  // Unfollow vacation
  const unfollowVacation = async (vacationId: number) => {
    try {
      await api.post(`/vacations/${vacationId}/unfollow`);
      
      // Update local state
      setVacations(prevVacations => 
        prevVacations.map(vacation => 
          vacation.vacationId === vacationId 
            ? { 
                ...vacation, 
                isFollowing: 0, 
                followersCount: vacation.followersCount - 1 
              } 
            : vacation
        )
      );
    } catch (error) {
      console.error('Error unfollowing vacation:', error);
      throw error;
    }
  };

  // Add new vacation (admin only)
  const addVacation = async (vacation: VacationRequest) => {
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('destination', vacation.destination);
      formData.append('description', vacation.description);
      formData.append('startDate', vacation.startDate);
      formData.append('endDate', vacation.endDate);
      formData.append('price', vacation.price.toString());
      
      if (vacation.image) {
        formData.append('image', vacation.image);
      }
      
      await api.post('/vacations', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Refetch vacations to update the list
      fetchVacations(pagination.page);
    } catch (error) {
      console.error('Error adding vacation:', error);
      throw error;
    }
  };

  // Update vacation (admin only)
  const updateVacation = async (vacationId: number, vacation: VacationRequest) => {
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('destination', vacation.destination);
      formData.append('description', vacation.description);
      formData.append('startDate', vacation.startDate);
      formData.append('endDate', vacation.endDate);
      formData.append('price', vacation.price.toString());
      
      if (vacation.image) {
        formData.append('image', vacation.image);
      }
      
      await api.put(`/vacations/${vacationId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Refetch vacations to update the list
      fetchVacations(pagination.page);
    } catch (error) {
      console.error('Error updating vacation:', error);
      throw error;
    }
  };

  // Delete vacation (admin only)
  const deleteVacation = async (vacationId: number) => {
    try {
      await api.delete(`/vacations/${vacationId}`);
      
      // Update local state
      setVacations(prevVacations => 
        prevVacations.filter(vacation => vacation.vacationId !== vacationId)
      );
      
      // If we've deleted the last item on this page, go to previous page
      if (vacations.length === 1 && pagination.page > 1) {
        fetchVacations(pagination.page - 1);
      } else if (vacations.length > 1) {
        // Recalculate pagination
        setPagination(prev => ({
          ...prev,
          totalItems: prev.totalItems - 1,
          totalPages: Math.ceil((prev.totalItems - 1) / prev.limit)
        }));
      }
    } catch (error) {
      console.error('Error deleting vacation:', error);
      throw error;
    }
  };

  return (
    <VacationContext.Provider
      value={{
        vacations,
        pagination,
        filters,
        loading,
        error,
        setFilters,
        fetchVacations,
        followVacation,
        unfollowVacation,
        addVacation,
        updateVacation,
        deleteVacation,
      }}
    >
      {children}
    </VacationContext.Provider>
  );
};

// Custom hook to use the vacation context
export const useVacations = () => useContext(VacationContext);
