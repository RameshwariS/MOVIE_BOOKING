const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

const Movie = require('./models/movie.model');
const Theater = require('./models/theater.model');
const Show = require('./models/show.model');
const User = require('./models/user.model');
const Booking = require('./models/booking.model');
const Review = require('./models/review.model');

dotenv.config();

// ─── Helpers ────────────────────────────────────────────────────────────────
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickMany = (arr, n) => [...arr].sort(() => Math.random() - 0.5).slice(0, n);
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const futureDate = (daysAhead, hour) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  d.setHours(hour, 0, 0, 0);
  return d;
};
const pastDate = (daysAgo, hour) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 0, 0, 0);
  return d;
};
const seatRows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const generateSeats = (n) => {
  const seats = new Set();
  while (seats.size < n) {
    seats.add(`${seatRows[Math.floor(Math.random() * 8)]}${Math.floor(Math.random() * 12) + 1}`);
  }
  return [...seats];
};

// ─── Movies Data ────────────────────────────────────────────────────────────
const movieData = [
  {
    name: 'John Wick: Chapter 4',
    description: 'John Wick uncovers a path to defeating The High Table. But before he can earn his freedom, Wick must face off against a new enemy with powerful alliances across the globe.',
    genre: ['ACTION', 'THRILLER'],
    language: ['ENG', 'HIN'],
    releaseDate: '2023-03-24',
    director: 'Chad Stahelski',
    casts: ['Keanu Reeves', 'Donnie Yen', 'Bill Skarsgård', 'Laurence Fishburne'],
    trailerURL: 'https://www.youtube.com/watch?v=qEVUtrk8_B4',
    posterURL: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=800',
    releaseStatus: 'RELEASED',
  },
  {
    name: 'Inception',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.',
    genre: ['SCI-FI', 'ACTION', 'THRILLER'],
    language: ['ENG'],
    releaseDate: '2010-07-16',
    director: 'Christopher Nolan',
    casts: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page', 'Tom Hardy'],
    trailerURL: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
    posterURL: 'https://images.unsplash.com/photo-1542204112-1630f8177d0b?auto=format&fit=crop&q=80&w=800',
    releaseStatus: 'RELEASED',
  },
  {
    name: 'The Dark Knight',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.',
    genre: ['ACTION', 'DRAMA', 'THRILLER'],
    language: ['ENG', 'HIN'],
    releaseDate: '2008-07-18',
    director: 'Christopher Nolan',
    casts: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Maggie Gyllenhaal'],
    trailerURL: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
    posterURL: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&q=80&w=800',
    releaseStatus: 'RELEASED',
  },
  {
    name: 'Interstellar',
    description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    genre: ['SCI-FI', 'DRAMA'],
    language: ['ENG'],
    releaseDate: '2014-11-07',
    director: 'Christopher Nolan',
    casts: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
    trailerURL: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    posterURL: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=800',
    releaseStatus: 'RELEASED',
  },
  {
    name: 'The Hangover',
    description: 'Three buddies wake up from a bachelor party in Las Vegas with no memory of the previous night, and the groom is missing.',
    genre: ['COMEDY'],
    language: ['ENG'],
    releaseDate: '2009-06-05',
    director: 'Todd Phillips',
    casts: ['Bradley Cooper', 'Zach Galifianakis', 'Ed Helms', 'Heather Graham'],
    trailerURL: 'https://www.youtube.com/watch?v=tcdUhdOlz9M',
    posterURL: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=800',
    releaseStatus: 'RELEASED',
  },
  {
    name: 'Avengers: Endgame',
    description: 'After the devastating events of Infinity War, the Avengers assemble once more to reverse Thanos\'s actions and restore balance to the universe.',
    genre: ['ACTION', 'SCI-FI'],
    language: ['ENG', 'HIN', 'TAM'],
    releaseDate: '2019-04-26',
    director: 'Anthony Russo, Joe Russo',
    casts: ['Robert Downey Jr.', 'Chris Evans', 'Mark Ruffalo', 'Scarlett Johansson', 'Chris Hemsworth'],
    trailerURL: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
    posterURL: 'https://images.unsplash.com/photo-1616530940355-351fabd9524b?auto=format&fit=crop&q=80&w=800',
    releaseStatus: 'RELEASED',
  },
  {
    name: 'RRR',
    description: 'A fictitious story about two legendary revolutionaries and their journey away from home before they started fighting for their country in the 1920s.',
    genre: ['ACTION', 'DRAMA'],
    language: ['TEL', 'HIN', 'TAM'],
    releaseDate: '2022-03-25',
    director: 'S.S. Rajamouli',
    casts: ['N.T. Rama Rao Jr.', 'Ram Charan', 'Ajay Devgn', 'Alia Bhatt'],
    trailerURL: 'https://www.youtube.com/watch?v=f_vbAtFSEc0',
    posterURL: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&q=80&w=800',
    releaseStatus: 'RELEASED',
  },
  {
    name: 'Parasite',
    description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
    genre: ['THRILLER', 'DRAMA'],
    language: ['KOR'],
    releaseDate: '2019-10-11',
    director: 'Bong Joon-ho',
    casts: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong', 'Choi Woo-shik'],
    trailerURL: 'https://www.youtube.com/watch?v=5xH0HfJHsaY',
    posterURL: 'https://images.unsplash.com/photo-1512070679279-8988d32161be?auto=format&fit=crop&q=80&w=800',
    releaseStatus: 'RELEASED',
  },
  {
    name: 'Spider-Man: No Way Home',
    description: 'With his identity now revealed, Peter Parker asks Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds start to appear.',
    genre: ['ACTION', 'SCI-FI'],
    language: ['ENG', 'HIN'],
    releaseDate: '2021-12-17',
    director: 'Jon Watts',
    casts: ['Tom Holland', 'Zendaya', 'Benedict Cumberbatch', 'Willem Dafoe'],
    trailerURL: 'https://www.youtube.com/watch?v=JfVOs4VSpmA',
    posterURL: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&q=80&w=800',
    releaseStatus: 'RELEASED',
  },
  {
    name: 'Dune: Part Two',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    genre: ['SCI-FI', 'ACTION'],
    language: ['ENG'],
    releaseDate: '2024-03-01',
    director: 'Denis Villeneuve',
    casts: ['Timothee Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Josh Brolin'],
    trailerURL: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    posterURL: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=800',
    releaseStatus: 'RELEASED',
  },
  {
    name: 'Oppenheimer',
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
    genre: ['DRAMA', 'THRILLER'],
    language: ['ENG'],
    releaseDate: '2023-07-21',
    director: 'Christopher Nolan',
    casts: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.'],
    trailerURL: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
    posterURL: 'https://images.unsplash.com/photo-1559582798-678dfc71ccd8?auto=format&fit=crop&q=80&w=800',
    releaseStatus: 'RELEASED',
  },
  {
    name: 'Barbie',
    description: 'Barbie and Ken are having the time of their lives in the colorful and seemingly perfect world of Barbie Land, until they start questioning their existence.',
    genre: ['COMEDY', 'FANTASY'],
    language: ['ENG', 'HIN'],
    releaseDate: '2023-07-21',
    director: 'Greta Gerwig',
    casts: ['Margot Robbie', 'Ryan Gosling', 'America Ferrera', 'Kate McKinnon'],
    trailerURL: 'https://www.youtube.com/watch?v=pBk4NYhWNMM',
    posterURL: 'https://images.unsplash.com/photo-1601693810979-46dbda789b19?auto=format&fit=crop&q=80&w=800',
    releaseStatus: 'RELEASED',
  },
  {
    name: 'Kalki 2898 AD',
    description: 'A futuristic world inspired by Hindu mythology, where a fierce warrior is destined to be the savior of humanity.',
    genre: ['ACTION', 'SCI-FI', 'FANTASY'],
    language: ['TEL', 'HIN', 'TAM', 'ENG'],
    releaseDate: '2024-06-27',
    director: 'Nag Ashwin',
    casts: ['Prabhas', 'Deepika Padukone', 'Amitabh Bachchan', 'Kamal Haasan'],
    trailerURL: 'https://www.youtube.com/watch?v=example_kalki',
    posterURL: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&q=80&w=800',
    releaseStatus: 'RELEASED',
  },
  {
    name: 'Pushpa: The Rule',
    description: 'Pushpa Raj\'s empire is threatened by a determined cop who vows to bring him down, while Pushpa refuses to bow before anyone.',
    genre: ['ACTION', 'DRAMA'],
    language: ['TEL', 'HIN', 'TAM'],
    releaseDate: '2024-12-05',
    director: 'Sukumar',
    casts: ['Allu Arjun', 'Rashmika Mandanna', 'Fahadh Faasil'],
    trailerURL: 'https://www.youtube.com/watch?v=example_pushpa',
    posterURL: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800',
    releaseStatus: 'RELEASED',
  },
  {
    name: 'Mission: Impossible Dead Reckoning',
    description: 'Ethan Hunt and his IMF team must track down a terrifying new weapon that threatens all of humanity before it falls into the wrong hands.',
    genre: ['ACTION', 'THRILLER'],
    language: ['ENG', 'HIN'],
    releaseDate: '2023-07-12',
    director: 'Christopher McQuarrie',
    casts: ['Tom Cruise', 'Hayley Atwell', 'Ving Rhames', 'Simon Pegg'],
    trailerURL: 'https://www.youtube.com/watch?v=avz06PDqDbM',
    posterURL: 'https://images.unsplash.com/photo-1580130775562-0ef92da028de?auto=format&fit=crop&q=80&w=800',
    releaseStatus: 'RELEASED',
  },
  {
    name: 'Avatar 3',
    description: 'Jake Sully and Ney\'tiri continue their adventures across Pandora, discovering new clans and facing greater threats.',
    genre: ['SCI-FI', 'ACTION', 'FANTASY'],
    language: ['ENG', 'HIN'],
    releaseDate: '2025-12-19',
    director: 'James Cameron',
    casts: ['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver'],
    trailerURL: 'https://www.youtube.com/watch?v=example_avatar3',
    posterURL: 'https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?auto=format&fit=crop&q=80&w=800',
    releaseStatus: 'UPCOMING',
  },
  {
    name: 'Deadpool and Wolverine 2',
    description: 'Wade Wilson and Logan return for another multiverse-shattering adventure that breaks every rule in the superhero handbook.',
    genre: ['ACTION', 'COMEDY'],
    language: ['ENG'],
    releaseDate: '2026-07-25',
    director: 'Shawn Levy',
    casts: ['Ryan Reynolds', 'Hugh Jackman', 'Jennifer Garner'],
    trailerURL: 'https://www.youtube.com/watch?v=example_deadpool2',
    posterURL: 'https://images.unsplash.com/photo-1635963612668-8eefbf498f09?auto=format&fit=crop&q=80&w=800',
    releaseStatus: 'UPCOMING',
  },
];

// ─── Theaters Data ───────────────────────────────────────────────────────────
const theaterData = [
  { name: 'Grand IMAX Cinema', address: '123 Movie Lane, Andheri West', city: 'Mumbai', pinCode: 400001, description: 'Premium IMAX experience with Dolby Atmos sound.', rating: 4.8, isopen: true },
  { name: 'Starlight Multiplex', address: '456 Entertainment St, Connaught Place', city: 'Delhi', pinCode: 110001, description: 'Multi-screen multiplex with 4DX and VIP seating.', rating: 4.5, isopen: true },
  { name: 'PVR Phoenix Mills', address: '789 Phoenix Mall, Lower Parel', city: 'Mumbai', pinCode: 400013, description: 'Flagship PVR with 8 screens and luxury lounges.', rating: 4.6, isopen: true },
  { name: 'INOX Insignia', address: '12 MG Road, Brigade Road', city: 'Bangalore', pinCode: 560001, description: 'Luxury cinema with plush seating and premium F&B.', rating: 4.7, isopen: true },
  { name: 'Cinepolis Hyderabad', address: '1 HITEC City, Madhapur', city: 'Hyderabad', pinCode: 500081, description: 'State-of-the-art multiplex with latest technology.', rating: 4.4, isopen: true },
  { name: 'SPI Palazzo', address: '14 Phoenix Market City, Velachery', city: 'Chennai', pinCode: 600042, description: 'Premium cinema with exclusive recliners and bar.', rating: 4.6, isopen: true },
  { name: 'Miraj Cinemas Gold', address: '34 Sector 18, Noida', city: 'Noida', pinCode: 201301, description: 'Affordable multiplex with great sound system.', rating: 4.2, isopen: true },
  { name: 'Carnival Cinemas Kolkata', address: '56 Salt Lake Sector V', city: 'Kolkata', pinCode: 700091, description: 'Modern cinemas with excellent screen quality.', rating: 4.3, isopen: true },
  { name: 'Fun Cinemas Ahmedabad', address: '78 Satellite Road, Prahlad Nagar', city: 'Ahmedabad', pinCode: 380015, description: 'Family-friendly multiplex with food court.', rating: 4.1, isopen: true },
  { name: 'IMAX Pune', address: '90 Bund Garden Road, Koregaon Park', city: 'Pune', pinCode: 411001, description: 'Only IMAX screen in Pune with 270-degree viewing.', rating: 4.9, isopen: true },
];

// ─── People Data ─────────────────────────────────────────────────────────────
const firstNames = ['Aarav','Aditi','Arjun','Ananya','Rohit','Priya','Vikram','Sneha','Karan','Pooja','Raj','Meera','Siddharth','Kavya','Nikhil','Deepika','Amit','Nisha','Rahul','Sunita','Ajay','Divya','Ravi','Swati','Manish','Rekha','Aditya','Tanvi','Sourav','Shruti','Harish','Geeta','Vivek','Bhavna','Sachin','Heena','Gaurav','Pallavi','Dinesh','Jyoti','Tarun','Anita','Suresh','Poonam','Rakesh','Sonal','Mohit','Neha','Deepak','Ritu'];
const lastNames = ['Sharma','Gupta','Singh','Verma','Patel','Shah','Mehta','Joshi','Nair','Reddy','Kumar','Mishra','Yadav','Chaudhary','Pandey','Tiwari','Iyer','Pillai','Menon','Kapoor','Malhotra','Khanna','Bose','Das','Roy','Chatterjee','Mukherjee','Banerjee','Rao','Naidu'];

const reviewComments = [
  'Absolutely breathtaking! One of the best movies I have seen in years.',
  'Great storyline but the ending felt a bit rushed. Overall enjoyable.',
  'Outstanding performances from the entire cast. Highly recommended!',
  'The visual effects are mind-blowing. IMAX is definitely the way to watch this.',
  'A masterpiece of filmmaking. Christopher Nolan has done it again!',
  'Good movie, but felt a bit long. Could have been tighter editing.',
  'The soundtrack alone makes this movie worth watching. Phenomenal!',
  'An emotional rollercoaster from start to finish. Brought tears to my eyes.',
  'Solid action sequences but the plot needed more depth.',
  'Best superhero movie in a decade. Perfect blend of humor and action.',
  'The director\'s vision is truly remarkable. Every frame is a work of art.',
  'Not my favorite but fans of the genre will definitely love it.',
  'Exceeded all my expectations! The twists kept me on the edge of my seat.',
  'A must-watch for cinema lovers. Brilliant writing and direction.',
  'Average movie. Entertaining enough for a one-time watch.',
  'The lead actor delivered an Oscar-worthy performance!',
  'Fun family movie, though some scenes might be intense for young kids.',
  'Loved the cultural references and the authentic representation.',
  'The pacing was off but the climax redeemed it entirely.',
  'Absolute fire from start to finish! Watched it twice already.',
  'Visually stunning but the story felt hollow.',
  'A cinematic experience unlike anything I have ever seen before!',
  'Decent entertainer. Nothing groundbreaking but a fun watch.',
  'The chemistry between the leads was electric. Loved every second!',
  'Overrated in my opinion, but I can see why others love it.',
];

// ─── Main Seed ───────────────────────────────────────────────────────────────
const seedDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log('Connected to DB for seeding...');

    // Clear all collections
    await Promise.all([
      Movie.deleteMany({}),
      Theater.deleteMany({}),
      Show.deleteMany({}),
      User.deleteMany({}),
      Booking.deleteMany({}),
      Review.deleteMany({}),
    ]);
    console.log('Cleared existing data.');

    // 1. Users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const usersToInsert = [
      { name: 'System Admin', email: 'admin@test.com', password: hashedPassword, role: 'ADMIN' },
      { name: 'Theater Owner 1', email: 'owner1@test.com', password: hashedPassword, role: 'OWNER' },
      { name: 'Theater Owner 2', email: 'owner2@test.com', password: hashedPassword, role: 'OWNER' },
      { name: 'Default User', email: 'user@test.com', password: hashedPassword, role: 'USER' },
    ];

    const usedEmails = new Set(usersToInsert.map(u => u.email));
    for (let i = 0; i < 50; i++) {
      const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
      const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
      let email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@gmail.com`;
      if (usedEmails.has(email)) email = `user_auto_${i}_${Date.now()}@gmail.com`;
      usedEmails.add(email);
      usersToInsert.push({ name: `${fn} ${ln}`, email, password: hashedPassword, role: 'USER' });
    }

    const createdUsers = await User.insertMany(usersToInsert, { ordered: false });
    const regularUsers = createdUsers.filter(u => u.role === 'USER');
    console.log(`Created ${createdUsers.length} users.`);

    // 2. Movies
    const createdMovies = await Movie.insertMany(movieData);
    console.log(`Created ${createdMovies.length} movies.`);

    // 3. Theaters
    const createdTheaters = await Theater.insertMany(theaterData);
    console.log(`Created ${createdTheaters.length} theaters.`);

    // Cross-link movies <-> theaters
    for (const theater of createdTheaters) {
      const linkedMovies = pickMany(createdMovies, randInt(8, 15)).map(m => m._id);
      await Theater.findByIdAndUpdate(theater._id, { movies: linkedMovies });
    }
    for (const movie of createdMovies) {
      const linkedTheaters = pickMany(createdTheaters, randInt(3, 7)).map(t => t._id);
      await Movie.findByIdAndUpdate(movie._id, { theaters: linkedTheaters });
    }
    console.log('Linked movies <-> theaters.');

    // 4. Shows
    const showTimes = [9, 12, 15, 18, 21, 23];
    const prices = [150, 180, 200, 250, 300, 350, 400];
    const seatOptions = [60, 80, 100, 120, 150, 200];
    const showsToInsert = [];
    const releasedMovies = createdMovies.filter(m => m.releaseStatus === 'RELEASED');

    for (const movie of releasedMovies) {
      const theaterSubset = pickMany(createdTheaters, randInt(4, 8));
      for (const theater of theaterSubset) {
        // Past shows -> COMPLETED
        for (let day = 7; day >= 1; day--) {
          const hour = showTimes[Math.floor(Math.random() * showTimes.length)];
          const start = pastDate(day, hour);
          const total = seatOptions[Math.floor(Math.random() * seatOptions.length)];
          showsToInsert.push({
            movie: movie._id,
            theater: theater._id,
            startTime: start,
            endTime: new Date(start.getTime() + randInt(100, 180) * 60000),
            price: prices[Math.floor(Math.random() * prices.length)],
            totalSeats: total,
            bookedSeats: generateSeats(randInt(10, 40)),
            status: 'COMPLETED',
          });
        }
        // Future shows -> SCHEDULED
        for (let day = 0; day <= 7; day++) {
          const selectedTimes = pickMany(showTimes, randInt(2, 4));
          for (const hour of selectedTimes) {
            const start = futureDate(day, hour);
            const total = seatOptions[Math.floor(Math.random() * seatOptions.length)];
            showsToInsert.push({
              movie: movie._id,
              theater: theater._id,
              startTime: start,
              endTime: new Date(start.getTime() + randInt(100, 180) * 60000),
              price: prices[Math.floor(Math.random() * prices.length)],
              totalSeats: total,
              bookedSeats: generateSeats(randInt(0, 20)),
              status: 'SCHEDULED',
            });
          }
        }
      }
    }

    // CANCELLED shows
    for (let i = 0; i < 25; i++) {
      const movie = pick(releasedMovies);
      const theater = pick(createdTheaters);
      const hour = showTimes[Math.floor(Math.random() * showTimes.length)];
      const start = pastDate(randInt(1, 14), hour);
      showsToInsert.push({
        movie: movie._id,
        theater: theater._id,
        startTime: start,
        endTime: new Date(start.getTime() + 120 * 60000),
        price: prices[Math.floor(Math.random() * prices.length)],
        totalSeats: seatOptions[Math.floor(Math.random() * seatOptions.length)],
        bookedSeats: [],
        status: 'CANCELLED',
      });
    }

    const createdShows = await Show.insertMany(showsToInsert);
    const completedShows = createdShows.filter(s => s.status === 'COMPLETED');
    const scheduledShows = createdShows.filter(s => s.status === 'SCHEDULED');
    console.log(`Created ${createdShows.length} shows (${completedShows.length} completed, ${scheduledShows.length} scheduled, 25 cancelled).`);

    // 5. Bookings
    const bookingsToInsert = [];
    const bookingStatusPool = ['CONFIRMED', 'CONFIRMED', 'CONFIRMED', 'CANCELLED', 'CREATED'];

    for (const show of completedShows.slice(0, 100)) {
      const numBookings = randInt(2, 6);
      for (let i = 0; i < numBookings; i++) {
        const user = regularUsers[Math.floor(Math.random() * regularUsers.length)];
        const seats = generateSeats(randInt(1, 4));
        const status = bookingStatusPool[Math.floor(Math.random() * bookingStatusPool.length)];
        const payStatus = status === 'CONFIRMED' ? 'PAID' : status === 'CANCELLED' ? (Math.random() > 0.5 ? 'REFUNDED' : 'FAILED') : 'PENDING';
        bookingsToInsert.push({
          user: user._id,
          show: show._id,
          movie: show.movie,
          theater: show.theater,
          seats,
          totalPrice: show.price * seats.length,
          status,
          paymentStatus: payStatus,
        });
      }
    }

    for (const show of scheduledShows.slice(0, 60)) {
      const numBookings = randInt(1, 4);
      for (let i = 0; i < numBookings; i++) {
        const user = regularUsers[Math.floor(Math.random() * regularUsers.length)];
        const seats = generateSeats(randInt(1, 3));
        const status = Math.random() > 0.3 ? 'CONFIRMED' : 'CREATED';
        bookingsToInsert.push({
          user: user._id,
          show: show._id,
          movie: show.movie,
          theater: show.theater,
          seats,
          totalPrice: show.price * seats.length,
          status,
          paymentStatus: status === 'CONFIRMED' ? 'PAID' : 'PENDING',
        });
      }
    }

    const createdBookings = await Booking.insertMany(bookingsToInsert);
    console.log(`Created ${createdBookings.length} bookings.`);

    // 6. Reviews
    const reviewsToInsert = [];
    const reviewedPairs = new Set();

    for (const movie of releasedMovies) {
      const reviewers = pickMany(regularUsers, randInt(10, 20));
      for (const user of reviewers) {
        const key = `${user._id}-${movie._id}`;
        if (reviewedPairs.has(key)) continue;
        reviewedPairs.add(key);
        reviewsToInsert.push({
          user: user._id,
          movie: movie._id,
          rating: randInt(2, 5),
          comment: reviewComments[Math.floor(Math.random() * reviewComments.length)],
        });
      }
    }

    const createdReviews = await Review.insertMany(reviewsToInsert);
    console.log(`Created ${createdReviews.length} reviews.`);

    // Summary
    console.log('\n==========================================');
    console.log('SEEDING COMPLETE - Summary');
    console.log('==========================================');
    console.log(`  Users    : ${createdUsers.length}`);
    console.log(`  Movies   : ${createdMovies.length}`);
    console.log(`  Theaters : ${createdTheaters.length}`);
    console.log(`  Shows    : ${createdShows.length}`);
    console.log(`  Bookings : ${createdBookings.length}`);
    console.log(`  Reviews  : ${createdReviews.length}`);
    console.log('==========================================\n');
    console.log('Default credentials: admin@test.com / owner1@test.com / user@test.com  ->  password123');

    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedDB();
