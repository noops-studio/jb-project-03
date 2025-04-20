import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Vacation, VacationRequest } from '../../types';
import { useVacations } from '../../contexts/VacationContext';

interface VacationFormProps {
  vacationId?: number;
  initialData?: Vacation;
}

const VacationForm = ({ vacationId, initialData }: VacationFormProps) => {
  const { addVacation, updateVacation } = useVacations();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData ? `http://localhost:4000/uploads/${initialData.imageFileName}` : null
  );
  const navigate = useNavigate();
  
  const isEditMode = !!vacationId;
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    setValue,
    watch
  } = useForm<VacationRequest>();
  
  // Watch start date to ensure end date is after
  const watchStartDate = watch('startDate');
  
  // Set initial form values for edit mode
  useEffect(() => {
    if (initialData) {
      setValue('destination', initialData.destination);
      setValue('description', initialData.description);
      setValue('startDate', initialData.startDate.substring(0, 10)); // YYYY-MM-DD format
      setValue('endDate', initialData.endDate.substring(0, 10)); // YYYY-MM-DD format
      setValue('price', initialData.price);
    }
  }, [initialData, setValue]);
  
  // Handle form submission
  const onSubmit = async (data: VacationRequest) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      if (isEditMode && vacationId) {
        await updateVacation(vacationId, data);
      } else {
        await addVacation(data);
      }
      
      navigate('/vacations');
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || 
        `Failed to ${isEditMode ? 'update' : 'create'} vacation. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle image preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {isEditMode ? 'Edit Vacation' : 'Add New Vacation'}
      </h2>
      
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="destination" className="block text-gray-700 font-medium mb-1">
            Destination
          </label>
          <input
            id="destination"
            type="text"
            className={`w-full px-4 py-2 border ${errors.destination ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500`}
            {...register('destination', { required: 'Destination is required' })}
          />
          {errors.destination && (
            <p className="text-red-500 text-sm mt-1">{errors.destination.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="description" className="block text-gray-700 font-medium mb-1">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            className={`w-full px-4 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500`}
            {...register('description', { required: 'Description is required' })}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-gray-700 font-medium mb-1">
              Start Date
            </label>
            <input
              id="startDate"
              type="date"
              className={`w-full px-4 py-2 border ${errors.startDate ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500`}
              {...register('startDate', { 
                required: 'Start date is required',
                validate: value => {
                  // Allow past dates for edit mode
                  if (!isEditMode) {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return new Date(value) >= today || 'Start date cannot be in the past';
                  }
                  return true;
                }
              })}
            />
            {errors.startDate && (
              <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-gray-700 font-medium mb-1">
              End Date
            </label>
            <input
              id="endDate"
              type="date"
              className={`w-full px-4 py-2 border ${errors.endDate ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500`}
              {...register('endDate', { 
                required: 'End date is required',
                validate: value => {
                  if (!watchStartDate) return true;
                  return new Date(value) > new Date(watchStartDate) || 'End date must be after start date';
                }
              })}
            />
            {errors.endDate && (
              <p className="text-red-500 text-sm mt-1">{errors.endDate.message}</p>
            )}
          </div>
        </div>
        
        <div>
          <label htmlFor="price" className="block text-gray-700 font-medium mb-1">
            Price ($)
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            min="0"
            max="10000"
            className={`w-full px-4 py-2 border ${errors.price ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500`}
            {...register('price', { 
              required: 'Price is required',
              min: {
                value: 0,
                message: 'Price cannot be negative'
              },
              max: {
                value: 10000,
                message: 'Price cannot exceed $10,000'
              },
              valueAsNumber: true
            })}
          />
          {errors.price && (
            <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="image" className="block text-gray-700 font-medium mb-1">
            {isEditMode ? 'Change Image (optional)' : 'Image'}
          </label>
          <input
            id="image"
            type="file"
            accept="image/*"
            className={`w-full px-4 py-2 border ${errors.image ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500`}
            {...register('image', { 
              required: isEditMode ? false : 'Image is required'
            })}
            onChange={handleImageChange}
          />
          {errors.image && (
            <p className="text-red-500 text-sm mt-1">{errors.image.message}</p>
          )}
          
          {imagePreview && (
            <div className="mt-2">
              <p className="text-gray-700 font-medium mb-1">Image Preview:</p>
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full max-h-48 object-cover rounded-md"
              />
            </div>
          )}
        </div>
        
        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md transition duration-200 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Saving...' : isEditMode ? 'Update Vacation' : 'Add Vacation'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/vacations')}
            className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium rounded-md transition duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default VacationForm;