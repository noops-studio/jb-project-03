// src/utils/initDb.ts
import bcrypt from 'bcrypt';
import { User, Vacation, Follower } from '../models';

// Sample vacation data
const vacations = [
  {
    destination: 'Rome',
    description: 'You can create a dream vacation of famous artistic wonders and historic hidden gems punctuated by top-notch dining in fabulous restaurants with a Rome vacation package.',
    startDate: new Date('2025-10-28'),
    endDate: new Date('2025-11-09'),
    price: 1931,
    imageFileName: 'rome.jpg',
  },
  {
    destination: 'Rhodes',
    description: "It's time to take a break and enjoy a cocktail by the sea on a Rhodes vacation. Incredible seaside views are there for the taking on a trip to Rhodes.",
    startDate: new Date('2025-11-08'),
    endDate: new Date('2025-11-22'),
    price: 462,
    imageFileName: 'rhodes.jpg',
  },
  {
    destination: 'Lahaina',
    description: "It's time to take a break and relax by the ocean on a Lahaina vacation. Incredible seaside views are in plentiful supply on a trip to Lahaina.",
    startDate: new Date('2025-11-15'),
    endDate: new Date('2025-11-30'),
    price: 1049,
    imageFileName: 'lahaina.jpg',
  },
  {
    destination: 'Corfu',
    description: "There's nothing more relaxing than a Corfu vacation. Whether you're treating yourself to refreshing cocktails at a local hot spot or reading your favorite novel by the shore, your trip to Corfu is the time to live out your beach fantasies.",
    startDate: new Date('2025-12-13'),
    endDate: new Date('2025-12-27'),
    price: 789,
    imageFileName: 'corfu.jpg',
  },
  {
    destination: 'Hilo',
    description: "There's nothing like a Hilo vacation to put a spring in your step. The soothing sound of rolling waves and the smell of fresh ocean air will refresh your mind and body.",
    startDate: new Date('2025-12-17'),
    endDate: new Date('2025-12-31'),
    price: 1250,
    imageFileName: 'hilo.jpg',
  },
  {
    destination: 'Montego Bay',
    description: "Montego Bay vacation packages, you can fly into Sangster International Airport and be on your way to Doctor's Cave Beach and Dead End Beach in no time.",
    startDate: new Date('2026-01-03'),
    endDate: new Date('2026-01-17'),
    price: 920,
    imageFileName: 'montego_bay.jpg',
  },
  {
    destination: 'Puerto Rico Island',
    description: "A Puerto Rico Island vacation is the answer to all of your relaxation dreams. Endless breathtaking views of the ocean at Puerto Rico Island will rejuvenate even the weariest of travelers.",
    startDate: new Date('2025-09-15'),
    endDate: new Date('2025-09-30'),
    price: 1100,
    imageFileName: 'puerto_rico.jpg',
  },
  {
    destination: 'Las Vegas',
    description: "There's nothing quite like a Las Vegas vacation. The lights, sounds, and energy of the Strip captivate visitors from around the world. Whether you're here for the casinos, shows, or culinary delights, Las Vegas has something for everyone.",
    startDate: new Date('2025-10-05'),
    endDate: new Date('2025-10-12'),
    price: 850,
    imageFileName: 'las_vegas.jpg',
  },
  {
    destination: 'Honolulu',
    description: "Escape to paradise on a Honolulu vacation. Pristine beaches, crystal-clear waters, and magnificent sunsets await you. From hiking Diamond Head to relaxing on Waikiki Beach, Honolulu offers the perfect blend of adventure and relaxation.",
    startDate: new Date('2026-02-10'),
    endDate: new Date('2026-02-24'),
    price: 1600,
    imageFileName: 'honolulu.jpg',
  },
  {
    destination: 'Kailua-Kona',
    description: "Experience the magic of the Big Island with a Kailua-Kona vacation. Known for its coffee farms, beautiful beaches, and excellent snorkeling, Kailua-Kona offers a unique Hawaiian experience that combines culture, adventure, and relaxation.",
    startDate: new Date('2026-03-05'),
    endDate: new Date('2026-03-19'),
    price: 1350,
    imageFileName: 'kailua_kona.jpg',
  },
  {
    destination: 'Port Antonio',
    description: "Discover Jamaica's hidden gem with a Port Antonio vacation. Lush rainforests, secluded beaches, and the famous Blue Lagoon make this destination a nature lover's paradise. Experience authentic Jamaican culture away from the crowds.",
    startDate: new Date('2026-04-12'),
    endDate: new Date('2026-04-26'),
    price: 980,
    imageFileName: 'port_antonio.jpg',
  },
  {
    destination: 'Santorini',
    description: "Fall in love with the breathtaking views of Santorini. White-washed buildings, blue-domed churches, and spectacular sunsets over the Aegean Sea create a picture-perfect setting for your vacation. Explore ancient ruins, enjoy local wines, and relax on unique volcanic beaches.",
    startDate: new Date('2026-05-20'),
    endDate: new Date('2026-06-03'),
    price: 1800,
    imageFileName: 'santorini.jpg',
  },
];

// Initialize database with sample data
export const initializeDbWithSampleData = async () => {
  try {
    console.log('Starting database initialization...');

    // Create admin user
    const adminExists = await User.findOne({ where: { email: 'admin@example.com' } });
    
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin1234', salt);
      
      await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
      });
      
      console.log('Admin user created');
    }

    // Create regular user
    const userExists = await User.findOne({ where: { email: 'user@example.com' } });
    
    if (!userExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('user1234', salt);
      
      await User.create({
        firstName: 'Regular',
        lastName: 'User',
        email: 'user@example.com',
        password: hashedPassword,
        role: 'user',
      });
      
      console.log('Regular user created');
    }

    // Create vacations if they don't exist
    const vacationCount = await Vacation.count();
    
    if (vacationCount === 0) {
      await Vacation.bulkCreate(vacations);
      console.log('Sample vacations created');
    }

    console.log('Database initialization completed');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// If this script is run directly
if (require.main === module) {
  // Import necessary modules
  const dotenv = require('dotenv');
  dotenv.config();
  
  // Run initialization
  initializeDbWithSampleData()
    .then(() => {
      console.log('Database initialization successful');
      process.exit(0);
    })
    .catch((error: any) => {
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
}