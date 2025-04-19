-- Users table: stores registered users (regular or admin)
CREATE TABLE Users (
  id          INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  firstName   VARCHAR(50)  NOT NULL,
  lastName    VARCHAR(50)  NOT NULL,
  email       VARCHAR(100) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,   -- stores bcrypt hash of user password
  role        ENUM('user','admin') NOT NULL DEFAULT 'user'
) ENGINE=InnoDB;

-- Vacations table: stores vacation details
CREATE TABLE Vacations (
  id             INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  destination    VARCHAR(100) NOT NULL,
  description    VARCHAR(1000) NOT NULL,
  startDate      DATE         NOT NULL,
  endDate        DATE         NOT NULL,
  price          DECIMAL(8,2) NOT NULL,
  imageFileName  VARCHAR(255) NOT NULL   -- stored name of the image file (if any)
) ENGINE=InnoDB;

-- Followers table: join table linking users who follow vacations
CREATE TABLE Followers (
  id          INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  userId      INT NOT NULL,
  vacationId  INT NOT NULL,
  CONSTRAINT fk_user FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
  CONSTRAINT fk_vacation FOREIGN KEY (vacationId) REFERENCES Vacations(id) ON DELETE CASCADE,
  UNIQUE KEY unique_follow (userId, vacationId)   -- prevent duplicate follows
) ENGINE=InnoDB;

-- Insert sample users (1 admin and 1 regular user)
INSERT INTO Users (firstName, lastName, email, password, role) VALUES
('Admin', 'User', 'admin@example.com', '$2b$12$8XK4HAT2Nwbg/xd94EdzW.Uqq/VBQhhcM.fj6MXtEJLT8BzvAlOhO', 'admin'),
('John',  'Doe',  'john@example.com',  '$2b$12$1ofGCKLQrCo4Fn.M.OJBOO9EmnWJyHFMWjLlaYtM6bKpUaDW4snBu', 'user');
-- Note: the password hashes correspond to "Admin123" for admin and "1234" for user.

-- Insert sample vacations (12 vacations with realistic data)
INSERT INTO Vacations (destination, description, startDate, endDate, price, imageFileName) VALUES
('Paris, France',       'Romantic city with art, gastronomy, and culture.',       '2025-03-01', '2025-03-10', 1500.00, 'paris.jpg'),
('New York, USA',       'The Big Apple, the city that never sleeps.',            '2024-12-20', '2024-12-31', 2000.00, 'newyork.jpg'),
('Tokyo, Japan',        'Modern meets traditional in bustling Tokyo.',           '2025-02-01', '2025-02-15', 1800.00, 'tokyo.jpg'),
('London, UK',          'Historical city with modern attractions.',             '2025-03-25', '2025-04-15', 2200.00, 'london.jpg'),
('Sydney, Australia',   'Harbour city with the iconic Opera House.',             '2025-04-01', '2025-04-10', 5000.00, 'sydney.jpg'),
('Rome, Italy',         'Ancient history and vibrant street life.',              '2025-03-01', '2025-05-01', 1200.00, 'rome.jpg'),
('Maldives',            'Tropical paradise with stunning island resorts.',       '2025-04-05', '2025-04-20', 8000.00, 'maldives.jpg'),
('Bangkok, Thailand',   'Bustling city known for street life and temples.',      '2025-04-20', '2025-05-01', 1400.00, 'bangkok.jpg'),
('Rio de Janeiro, BR',  'City of Carnival and beautiful beaches.',               '2025-06-10', '2025-06-20', 3000.00, 'rio.jpg'),
('San Francisco, USA',  'City by the bay with the Golden Gate Bridge.',          '2025-09-01', '2025-09-10', 2500.00, 'sanfran.jpg'),
('Cape Town, ZA',       'Scenic coastal city with Table Mountain.',              '2026-01-15', '2026-01-30', 4000.00, 'capetown.jpg'),
('Barcelona, Spain',    'Mediterranean city known for Gaudi architecture.',      '2025-12-15', '2025-12-25', 1300.00, 'barcelona.jpg');

-- Insert sample follower relationships (user with id=2 follows some vacations)
INSERT INTO Followers (userId, vacationId) VALUES 
(2, 1), (2, 4), (2, 5), (2, 6), (2, 7);
