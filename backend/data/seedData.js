const bcrypt = require('bcryptjs');

const demoPassword = 'Demo123!';
const demoPasswordHash = bcrypt.hashSync(demoPassword, 10);

const theatres = [
  {
    id: 1,
    name: 'National Theatre',
    location: 'Athens, Greece',
    description: 'The historical central theatre of Athens.',
    image_url: 'https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    name: 'Rex Theatre',
    location: 'Athens, Greece',
    description: 'A modern space for contemporary performances.',
    image_url: 'https://images.unsplash.com/photo-1503095396549-807a8bc3667c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    name: 'Ancient Theatre of Epidaurus',
    location: 'Epidaurus, Greece',
    description: 'The most famous ancient theatre in the world.',
    image_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
  },
];

const shows = [
  {
    id: 1,
    theatre_id: 1,
    title: 'Hamlet',
    description: 'Shakespeare classic tragedy.',
    duration: 180,
    age_rating: '12+',
    image_url: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    theatre_id: 1,
    title: 'Antigone',
    description: 'Sophocles ancient masterpiece.',
    duration: 120,
    age_rating: '10+',
    image_url: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    theatre_id: 2,
    title: 'Modern Dance Expo',
    description: 'A showcase of contemporary movement.',
    duration: 90,
    age_rating: 'All Ages',
    image_url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 4,
    theatre_id: 3,
    title: 'Oedipus Rex',
    description: 'Performed in the historic ancient stones.',
    duration: 100,
    age_rating: '12+',
    image_url: 'https://images.unsplash.com/photo-1533147670608-2a2f9775d3a4?auto=format&fit=crop&w=800&q=80',
  },
];

const showtimes = [
  { id: 1, show_id: 1, start_time: '2026-05-01 20:00:00', price: 25.0 },
  { id: 2, show_id: 1, start_time: '2026-05-02 20:00:00', price: 25.0 },
  { id: 3, show_id: 2, start_time: '2026-05-05 19:00:00', price: 20.0 },
  { id: 4, show_id: 3, start_time: '2026-05-10 21:00:00', price: 15.0 },
  { id: 5, show_id: 4, start_time: '2026-06-15 21:30:00', price: 30.0 },
];

const reservations = [
  { id: 1, user_id: 1, showtime_id: 1, seat_number: 'A3', status: 'confirmed' },
  { id: 2, user_id: 1, showtime_id: 1, seat_number: 'A4', status: 'confirmed' },
  { id: 3, user_id: 1, showtime_id: 2, seat_number: 'B2', status: 'confirmed' },
  { id: 4, user_id: 1, showtime_id: 3, seat_number: 'A1', status: 'confirmed' },
  { id: 5, user_id: 1, showtime_id: 4, seat_number: 'C1', status: 'confirmed' },
];

const demoUsers = [
  {
    id: 1,
    name: 'Demo Guest',
    email: 'demo@stage.local',
    password: demoPasswordHash,
  },
];

module.exports = {
  demoPassword,
  demoPasswordHash,
  theatres,
  shows,
  showtimes,
  reservations,
  demoUsers,
};
