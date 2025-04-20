import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { FaHeart, FaRegHeart, FaEdit, FaTrash } from 'react-icons/fa';
import { Vacation } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useVacations } from '../../contexts/VacationContext';
import ConfirmDialog from '../common/ConfirmDialog';

interface VacationCardProps {
  vacation: Vacation;
}

const VacationCard = ({ vacation }: VacationCardProps) => {
  const { auth } = useAuth();
  const { followVacation, unfollowVacation, deleteVacation } = useVacations();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const isAdmin = auth.user?.role === 'admin';
  const isFollowing = vacation.isFollowing > 0;
  
  // Format dates
  const formattedStartDate = format(new Date(vacation.startDate), 'MMM dd, yyyy');
  const formattedEndDate = format(new Date(vacation.endDate), 'MMM dd, yyyy');
  
  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      if (isFollowing) {
        await unfollowVacation(vacation.vacationId);
      } else {
        await followVacation(vacation.vacationId);
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle edit vacation
  const handleEdit = () => {
    navigate(`/admin/edit-vacation/${vacation.vacationId}`);
  };
  
  // Handle delete vacation
  const handleDelete = async () => {
    try {
      await deleteVacation(vacation.vacationId);
      setShowConfirmDelete(false);
    } catch (error) {
      console.error('Error deleting vacation:', error);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Image */}
      <div className="h-48 overflow-hidden relative">
        <img 
          src={`http://localhost:4000/uploads/${vacation.imageFileName}`}
          alt={vacation.destination} 
          className="w-full h-full object-cover"
        />
        
        {/* Price tag */}
        <div className="absolute bottom-0 right-0 bg-primary-600 text-white px-3 py-1 rounded-tl-md font-bold">
          ${vacation.price}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-800">{vacation.destination}</h3>
          
          {/* Follow button for regular users, edit/delete for admins */}
          {isAdmin ? (
            <div className="flex space-x-2">
              <button 
                onClick={handleEdit}
                className="text-primary-600 hover:text-primary-800"
              >
                <FaEdit size={18} />
              </button>
              <button 
                onClick={() => setShowConfirmDelete(true)}
                className="text-red-600 hover:text-red-800"
              >
                <FaTrash size={18} />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleFollowToggle}
              disabled={loading}
              className={`${
                isFollowing 
                  ? 'text-red-600 hover:text-red-800' 
                  : 'text-gray-400 hover:text-red-600'
              } transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isFollowing ? <FaHeart size={18} /> : <FaRegHeart size={18} />}
            </button>
          )}
        </div>
        
        {/* Dates */}
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <span>{formattedStartDate} - {formattedEndDate}</span>
        </div>
        
        {/* Description */}
        <p className="text-gray-700 mb-3 line-clamp-3">{vacation.description}</p>
        
        {/* Followers count */}
        <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
          <span>{vacation.followersCount} {vacation.followersCount === 1 ? 'follower' : 'followers'}</span>
        </div>
      </div>
      
      {/* Confirm delete dialog */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        title="Delete Vacation"
        message={`Are you sure you want to delete the vacation to ${vacation.destination}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirmDelete(false)}
      />
    </div>
  );
};

export default VacationCard;