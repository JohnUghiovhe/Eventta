import User from '../models/User';
import Event from '../models/Event';
import { EventStatus, UserRole } from '../types';
import { Logger } from '../utils/logger';
import { SYSTEM_MESSAGES } from '../utils/systemMessages';

const sampleEvents = [
  {
    title: 'Tech Summit 2026: AI & Future',
    description: 'Join industry experts discussing the latest in artificial intelligence, machine learning, and emerging technologies. Network with over 1000 tech enthusiasts.',
    category: 'Technology',
    venue: 'Lagos Convention Center',
    location: {
      address: '1234 Technology Way',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      coordinates: { latitude: 6.5244, longitude: 3.3792 }
    },
    startDate: new Date('2026-03-15T09:00:00'),
    endDate: new Date('2026-03-15T18:00:00'),
    ticketPrice: 15000,
    totalTickets: 500,
    images: ['https://via.placeholder.com/400x300?text=Tech+Summit'],
    status: EventStatus.PUBLISHED,
    defaultReminder: '1_day',
    tags: ['technology', 'ai', 'business', 'networking']
  },
  {
    title: 'Ultimate Music Festival',
    description: 'Experience live performances from top African and international artists. A 3-day music extravaganza with amazing food, drinks, and entertainment.',
    category: 'Entertainment',
    venue: 'Lekki Conservation Centre',
    location: {
      address: 'Lekki Conservation Road',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      coordinates: { latitude: 6.4669, longitude: 3.6753 }
    },
    startDate: new Date('2026-04-10T18:00:00'),
    endDate: new Date('2026-04-12T23:59:00'),
    ticketPrice: 25000,
    totalTickets: 2000,
    images: ['https://via.placeholder.com/400x300?text=Music+Festival'],
    status: EventStatus.PUBLISHED,
    defaultReminder: '3_days',
    tags: ['music', 'festival', 'entertainment', 'concert']
  },
  {
    title: 'Business Growth Workshop',
    description: 'Learn proven strategies to scale your business from successful entrepreneurs and business consultants. Includes 1-on-1 mentoring sessions.',
    category: 'Business',
    venue: 'Victoria Island Business Hub',
    location: {
      address: '5 Oniru Road, Victoria Island',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      coordinates: { latitude: 6.4282, longitude: 3.4289 }
    },
    startDate: new Date('2026-02-28T08:30:00'),
    endDate: new Date('2026-02-28T17:00:00'),
    ticketPrice: 8000,
    totalTickets: 150,
    images: ['https://via.placeholder.com/400x300?text=Business+Workshop'],
    status: EventStatus.PUBLISHED,
    defaultReminder: '1_day',
    tags: ['business', 'workshop', 'entrepreneurship', 'growth']
  },
  {
    title: 'Creative Arts Showcase 2026',
    description: 'Celebrate Nigerian creativity through paintings, sculptures, digital art, and live performances. Perfect for art enthusiasts and collectors.',
    category: 'Arts & Culture',
    venue: 'Nike Art Gallery',
    location: {
      address: 'Ikoyi, Lagos',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      coordinates: { latitude: 6.4669, longitude: 3.6244 }
    },
    startDate: new Date('2026-03-01T10:00:00'),
    endDate: new Date('2026-03-07T20:00:00'),
    ticketPrice: 5000,
    totalTickets: 300,
    images: ['https://via.placeholder.com/400x300?text=Arts+Showcase'],
    status: EventStatus.PUBLISHED,
    defaultReminder: '1_week',
    tags: ['art', 'culture', 'exhibition', 'creative']
  },
  {
    title: 'Sports Marathon - Lagos Heritage Race',
    description: '21km and 10km runs through iconic Lagos routes. For all fitness levels. Free health screening and refreshments provided.',
    category: 'Sports',
    venue: 'Lekki Beach',
    location: {
      address: 'Lekki Beach Road',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      coordinates: { latitude: 6.4733, longitude: 3.5898 }
    },
    startDate: new Date('2026-03-22T06:00:00'),
    endDate: new Date('2026-03-22T12:00:00'),
    ticketPrice: 3000,
    totalTickets: 800,
    images: ['https://via.placeholder.com/400x300?text=Marathon'],
    status: EventStatus.PUBLISHED,
    defaultReminder: '1_day',
    tags: ['sports', 'marathon', 'fitness', 'health']
  },
  {
    title: 'Food & Wine Festival',
    description: 'Taste cuisines from around the world. Meet celebrity chefs, wine sommeliers, and food enthusiasts. Live cooking demonstrations and tastings.',
    category: 'Food & Beverage',
    venue: 'Ikoyi Club 1938',
    location: {
      address: 'Ikoyi Club grounds',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      coordinates: { latitude: 6.4582, longitude: 3.6344 }
    },
    startDate: new Date('2026-04-05T11:00:00'),
    endDate: new Date('2026-04-05T22:00:00'),
    ticketPrice: 20000,
    totalTickets: 400,
    images: ['https://via.placeholder.com/400x300?text=Food+Wine'],
    status: EventStatus.PUBLISHED,
    defaultReminder: '3_days',
    tags: ['food', 'wine', 'culinary', 'festival']
  },
  {
    title: 'Digital Marketing Masterclass',
    description: 'Master SEO, social media marketing, email campaigns, and analytics. Learn from industry leaders. Get certification upon completion.',
    category: 'Education',
    venue: 'Impact Hub Lagos',
    location: {
      address: 'Yaba, Lagos',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      coordinates: { latitude: 6.5128, longitude: 3.3606 }
    },
    startDate: new Date('2026-02-20T09:00:00'),
    endDate: new Date('2026-02-22T17:00:00'),
    ticketPrice: 12000,
    totalTickets: 100,
    images: ['https://via.placeholder.com/400x300?text=Digital+Marketing'],
    status: EventStatus.PUBLISHED,
    defaultReminder: '1_week',
    tags: ['education', 'marketing', 'digital', 'training']
  },
  {
    title: 'Comedy Night - Laugh Out Loud',
    description: 'An evening of laughter with Nigeria\'s top comedians. Food and drinks available. Arrive early for best seating.',
    category: 'Entertainment',
    venue: 'Hard Rock Cafe Lagos',
    location: {
      address: 'Oniru Road, Victoria Island',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      coordinates: { latitude: 6.4282, longitude: 3.4289 }
    },
    startDate: new Date('2026-02-25T20:00:00'),
    endDate: new Date('2026-02-25T23:00:00'),
    ticketPrice: 10000,
    totalTickets: 250,
    images: ['https://via.placeholder.com/400x300?text=Comedy+Night'],
    status: EventStatus.PUBLISHED,
    defaultReminder: '1_day',
    tags: ['comedy', 'entertainment', 'nightlife', 'fun']
  }
];

export async function seedEvents(): Promise<void> {
  try {
    Logger.info('Starting to seed events...');

    // Check if events already exist
    const existingEvents = await Event.countDocuments();
    if (existingEvents > 0) {
      Logger.info(`Database already has ${existingEvents} events. Skipping seed.`);
      return;
    }

    // Create a demo creator user if it doesn't exist
    let creator = await User.findOne({ email: `creator@${SYSTEM_MESSAGES.appName.toLowerCase()}.com` });
    if (!creator) {
      creator = await User.create({
        email: `creator@${SYSTEM_MESSAGES.appName.toLowerCase()}.com`,
        password: 'Demo@123',
        firstName: 'Demo',
        lastName: 'Creator',
        role: UserRole.CREATOR,
        phoneNumber: '+2348000000000'
      });
      Logger.info('Created demo creator user');
    }

    // Create all sample events for the demo creator
    const eventsToCreate = sampleEvents.map((event) => ({
      ...event,
      creator: creator!._id.toString(),
      availableTickets: event.totalTickets
    }));

    const createdEvents = await Event.insertMany(eventsToCreate);
    Logger.info(`✅ Successfully seeded ${createdEvents.length} events to database`);
  } catch (error) {
    Logger.error('Error seeding events:', error);
    throw error;
  }
}
