
import { Request, Response } from 'express';
import Follower from '../models/Follower';
import Vacation from '../models/Vacation';

// Follow a vacation
export const followVacation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    
    // Verify vacation exists
    const vacation = await Vacation.findByPk(id);
    if (!vacation) {
      return res.status(404).json({ message: 'Vacation not found' });
    }
    
    // Check if already following
    const existingFollow = await Follower.findOne({
      where: { userId, vacationId: id }
    });
    
    if (existingFollow) {
      return res.status(400).json({ message: 'Already following this vacation' });
    }
    
    // Create follow relationship
    await Follower.create({
      userId,
      vacationId: parseInt(id)
    });
    
    res.status(201).json({ message: 'Vacation followed successfully' });
  } catch (error) {
    console.error('Error following vacation:', error);
    res.status(500).json({ message: 'Server error when following vacation' });
  }
};

// Unfollow a vacation
export const unfollowVacation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    
    // Verify vacation exists
    const vacation = await Vacation.findByPk(id);
    if (!vacation) {
      return res.status(404).json({ message: 'Vacation not found' });
    }
    
    // Find and delete follow relationship
    const follow = await Follower.findOne({
      where: { userId, vacationId: id }
    });
    
    if (!follow) {
      return res.status(400).json({ message: 'Not following this vacation' });
    }
    
    await follow.destroy();
    
    res.json({ message: 'Vacation unfollowed successfully' });
  } catch (error) {
    console.error('Error unfollowing vacation:', error);
    res.status(500).json({ message: 'Server error when unfollowing vacation' });
  }
};
