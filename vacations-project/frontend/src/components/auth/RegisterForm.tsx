import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { RegisterRequest } from '../../types';

 const RegisterForm = () => {
  const { register: registerUser } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    watch
  } = useForm<RegisterRequest & { confirmPassword: string }>();
  
  const password = watch('password', '');
  
  const onSubmit = async (data: RegisterRequest & { confirmPassword: string }) => {
    if (data.password !== data.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      // Omit confirmPassword from registration data
      const { confirmPassword, ...registrationData } = data;
      await registerUser(registrationData);
      navigate('/vacations');
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || 
        'Registration failed. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Register</h2>
      
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="firstName" className="block text-gray-700 font-medium mb-1">
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            className={`w-full px-4 py-2 border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500`}
            {...register('firstName', { required: 'First name is required' })}
          />
          {errors.firstName && (
            <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="lastName" className="block text-gray-700 font-medium mb-1">
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            className={`w-full px-4 py-2 border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500`}
            {...register('lastName', { required: 'Last name is required' })}
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500`}
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            className={`w-full px-4 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500`}
            {...register('password', { 
              required: 'Password is required',
              minLength: {
                value: 4,
                message: 'Password must be at least 4 characters'
              }
            })}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-1">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            className={`w-full px-4 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500`}
            {...register('confirmPassword', { 
              required: 'Please confirm your password',
              validate: value => value === password || 'Passwords do not match'
            })}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md transition duration-200 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? 'Registering...' : 'Register'}
        </button>
        
        <div className="text-center mt-4">
          <span className="text-gray-600">Already have an account?</span>{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
            Login
          </Link>
        </div>
      </form>
    </div>
  );
};
export default RegisterForm;