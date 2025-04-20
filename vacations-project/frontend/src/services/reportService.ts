import api from './api';
import { FollowerReport } from '../types';

// Get vacation followers report data
export const getFollowersReport = async (): Promise<FollowerReport[]> => {
  try {
    const response = await api.get<FollowerReport[]>('/reports/followers');
    return response.data;
  } catch (error) {
    console.error('Error fetching followers report:', error);
    throw error;
  }
};

// Download CSV report
export const downloadCSVReport = async (): Promise<void> => {
  try {
    const response = await api.get('/reports/followers/csv', {
      responseType: 'blob',
    });
    
    // Create a download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'vacation_followers.csv');
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading CSV report:', error);
    throw error;
  }
};