
import { Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import sequelize from '../config/database';
import Vacation from '../models/Vacation';
import Follower from '../models/Follower';
import fs from 'fs';
import path from 'path';
import { createObjectCsvWriter } from 'csv-writer';

// Get followers count for each vacation (for chart)
export const getFollowersReport = async (req: Request, res: Response) => {
  try {
    // Query to get each vacation with its follower count
    const report = await sequelize.query(
      `SELECT v.destination, COUNT(f.userId) as followersCount 
       FROM vacations v 
       LEFT JOIN followers f ON v.vacationId = f.vacationId 
       GROUP BY v.vacationId 
       ORDER BY v.destination`,
      { type: QueryTypes.SELECT }
    );
    
    res.json(report);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Server error when generating report' });
  }
};

// Generate and download CSV report
export const downloadCSVReport = async (req: Request, res: Response) => {
  try {
    // Query to get each vacation with its follower count
    const report: any = await sequelize.query(
      `SELECT v.destination, COUNT(f.userId) as followers 
       FROM vacations v 
       LEFT JOIN followers f ON v.vacationId = f.vacationId 
       GROUP BY v.vacationId 
       ORDER BY v.destination`,
      { type: QueryTypes.SELECT }
    );
    
    // Ensure the temp directory exists
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Create CSV file
    const csvFilePath = path.join(tempDir, 'vacation_followers.csv');
    
    const csvWriter = createObjectCsvWriter({
      path: csvFilePath,
      header: [
        { id: 'destination', title: 'Destination' },
        { id: 'followers', title: 'Followers' }
      ]
    });
    
    await csvWriter.writeRecords(report);
    
    // Send file for download
    res.download(csvFilePath, 'vacation_followers.csv', (err) => {
      if (err) {
        console.error('Error sending CSV file:', err);
      }
      
      // Delete the file after sending
      fs.unlinkSync(csvFilePath);
    });
  } catch (error) {
    console.error('Error generating CSV report:', error);
    res.status(500).json({ message: 'Server error when generating CSV report' });
  }
};
