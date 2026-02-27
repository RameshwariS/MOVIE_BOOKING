const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Movie = require('./models/movie.model');
const Theater = require('./models/theater.model');
const Show = require('./models/show.model');

dotenv.config();

const movies = [
    {
        name: 'John Wick: Chapter 4',
        description: 'John Wick uncovers a path to defeating The High Table.',
        genre: ['ACTION'],
        releaseDate: '2023-03-24',
        director: 'Chad Stahelski',
        casts: ['Keanu Reeves', 'Donnie Yen'],
        posterURL: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=2070'
    },
    {
        name: 'Inception',
        description: 'A thief who steals corporate secrets through the use of dream-sharing technology.',
        genre: ['SCI-FI', 'ACTION'],
        releaseDate: '2010-07-16',
        director: 'Christopher Nolan',
        casts: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt'],
        posterURL: 'https://images.unsplash.com/photo-1542204112-1630f8177d0b?auto=format&fit=crop&q=80&w=2070'
    },
    {
        name: 'The Hangover',
        description: 'Three buddies wake up from a bachelor party in Las Vegas with no memory of the previous night.',
        genre: ['COMEDY'],
        releaseDate: '2009-06-05',
        director: 'Todd Phillips',
        casts: ['Bradley Cooper', 'Zach Galifianakis'],
        posterURL: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=2070'
    }
];

const theaters = [
    {
        name: 'Grand IMAX Cinema',
        address: '123 Movie Lane',
        city: 'Mumbai',
        pinCode: 400001,
        rating: 4.5
    },
    {
        name: 'Starlight Multiplex',
        address: '456 Entertainment St',
        city: 'Delhi',
        pinCode: 110001,
        rating: 4.2
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log('Connected to DB for seeding...');

        // Clear existing data
        await Movie.deleteMany({});
        await Theater.deleteMany({});
        await Show.deleteMany({});
        console.log('Cleared existing data.');

        // Insert Movies
        const createdMovies = await Movie.insertMany(movies);
        console.log('Added movies.');

        // Insert Theaters
        const createdTheaters = await Theater.insertMany(theaters);
        console.log('Added theaters.');

        // Add Shows
        const shows = [];
        createdMovies.forEach(movie => {
            createdTheaters.forEach(theater => {
                // Create 2 shows per movie per theater
                const morning = new Date();
                morning.setHours(10, 0, 0, 0);
                morning.setDate(morning.getDate() + 1);

                const evening = new Date();
                evening.setHours(20, 0, 0, 0);
                evening.setDate(evening.getDate() + 1);

                shows.push({
                    movie: movie._id,
                    theater: theater._id,
                    startTime: morning,
                    endTime: new Date(morning.getTime() + 120 * 60000),
                    price: 250,
                    totalSeats: 50,
                    status: 'SCHEDULED'
                });

                shows.push({
                    movie: movie._id,
                    theater: theater._id,
                    startTime: evening,
                    endTime: new Date(evening.getTime() + 120 * 60000),
                    price: 350,
                    totalSeats: 50,
                    status: 'SCHEDULED'
                });
            });
        });

        await Show.insertMany(shows);
        console.log('Added shows.');

        console.log('Seeding complete!');
        process.exit();
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seedDB();
