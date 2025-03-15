import bcrypt from 'bcrypt';
import { User, Vacation, Follower, sequelize } from '../models';
import { UserRole } from '../models/user.model';
import { v4 as uuidv4 } from 'uuid';

// Define the seed data types
interface SeedUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}

interface SeedVacation {
  destination: string;
  description: string;
  startDate: string;
  endDate: string;
  price: number;
  imageFileName: string;
}

interface SeedFollower {
  userEmail: string;
  vacationDestination: string;
}

interface SeedData {
  users: SeedUser[];
  vacations: SeedVacation[];
  followers: SeedFollower[];
}

// Import the seed data with the correct type
const seedData: SeedData = require('./data.json');

const loadSeedData = async () => {
  try {
    console.log('Starting database seeding...');
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Sync database with force: true to drop tables
    await sequelize.sync({ force: true });
    console.log('Database tables created');

    // Seed users
    console.log('Seeding users...');
    const userMap = new Map<string, User>();
    
    for (const userData of seedData.users) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await User.create({
        ...userData,
        password: hashedPassword,
        role: userData.role as UserRole
      });
      userMap.set(userData.email, user);
    }
    console.log(`${userMap.size} users created`);

    // Seed vacations
    console.log('Seeding vacations...');
    const vacationMap = new Map<string, Vacation>();
    
    for (const vacationData of seedData.vacations) {
      // Generate UUID for the image filename (simulating S3 upload)
      const fileExt = vacationData.imageFileName.split('.').pop();
      const imageFileName = `${uuidv4()}.${fileExt}`;
      
      const vacation = await Vacation.create({
        ...vacationData,
        imageFileName,
        startDate: new Date(vacationData.startDate),
        endDate: new Date(vacationData.endDate)
      });
      vacationMap.set(vacationData.destination, vacation);
    }
    console.log(`${vacationMap.size} vacations created`);

    // Seed followers
    console.log('Seeding followers...');
    let followerCount = 0;
    
    for (const followerData of seedData.followers) {
      const user = userMap.get(followerData.userEmail);
      const vacation = vacationMap.get(followerData.vacationDestination);
      
      if (user && vacation) {
        await Follower.create({
          userId: user.id,
          vacationId: vacation.id
        });
        followerCount++;
      }
    }
    console.log(`${followerCount} followers created`);

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeder
loadSeedData();