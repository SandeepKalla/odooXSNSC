import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const cities = [
  // Europe
  { name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522, popularityScore: 95 },
  { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, popularityScore: 94 },
  { name: 'Rome', country: 'Italy', latitude: 41.9028, longitude: 12.4964, popularityScore: 93 },
  { name: 'Barcelona', country: 'Spain', latitude: 41.3851, longitude: 2.1734, popularityScore: 92 },
  { name: 'Amsterdam', country: 'Netherlands', latitude: 52.3676, longitude: 4.9041, popularityScore: 91 },
  { name: 'Berlin', country: 'Germany', latitude: 52.5200, longitude: 13.4050, popularityScore: 90 },
  { name: 'Prague', country: 'Czech Republic', latitude: 50.0755, longitude: 14.4378, popularityScore: 89 },
  { name: 'Vienna', country: 'Austria', latitude: 48.2082, longitude: 16.3738, popularityScore: 88 },
  { name: 'Athens', country: 'Greece', latitude: 37.9838, longitude: 23.7275, popularityScore: 87 },
  { name: 'Istanbul', country: 'Turkey', latitude: 41.0082, longitude: 28.9784, popularityScore: 86 },
  { name: 'Dublin', country: 'Ireland', latitude: 53.3498, longitude: -6.2603, popularityScore: 85 },
  { name: 'Edinburgh', country: 'United Kingdom', latitude: 55.9533, longitude: -3.1883, popularityScore: 84 },
  { name: 'Lisbon', country: 'Portugal', latitude: 38.7223, longitude: -9.1393, popularityScore: 83 },
  { name: 'Madrid', country: 'Spain', latitude: 40.4168, longitude: -3.7038, popularityScore: 82 },
  { name: 'Florence', country: 'Italy', latitude: 43.7696, longitude: 11.2558, popularityScore: 81 },
  
  // Asia
  { name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503, popularityScore: 98 },
  { name: 'Bangkok', country: 'Thailand', latitude: 13.7563, longitude: 100.5018, popularityScore: 97 },
  { name: 'Singapore', country: 'Singapore', latitude: 1.3521, longitude: 103.8198, popularityScore: 96 },
  { name: 'Hong Kong', country: 'China', latitude: 22.3193, longitude: 114.1694, popularityScore: 95 },
  { name: 'Seoul', country: 'South Korea', latitude: 37.5665, longitude: 126.9780, popularityScore: 94 },
  { name: 'Dubai', country: 'UAE', latitude: 25.2048, longitude: 55.2708, popularityScore: 93 },
  { name: 'Mumbai', country: 'India', latitude: 19.0760, longitude: 72.8777, popularityScore: 92 },
  { name: 'Delhi', country: 'India', latitude: 28.6139, longitude: 77.2090, popularityScore: 91 },
  { name: 'Beijing', country: 'China', latitude: 39.9042, longitude: 116.4074, popularityScore: 90 },
  { name: 'Shanghai', country: 'China', latitude: 31.2304, longitude: 121.4737, popularityScore: 89 },
  { name: 'Kyoto', country: 'Japan', latitude: 35.0116, longitude: 135.7681, popularityScore: 88 },
  { name: 'Bali', country: 'Indonesia', latitude: -8.3405, longitude: 115.0920, popularityScore: 87 },
  { name: 'Phuket', country: 'Thailand', latitude: 7.8804, longitude: 98.3923, popularityScore: 86 },
  { name: 'Kuala Lumpur', country: 'Malaysia', latitude: 3.1390, longitude: 101.6869, popularityScore: 85 },
  { name: 'Ho Chi Minh City', country: 'Vietnam', latitude: 10.8231, longitude: 106.6297, popularityScore: 84 },
  
  // North America
  { name: 'New York', country: 'USA', latitude: 40.7128, longitude: -74.0060, popularityScore: 99 },
  { name: 'Los Angeles', country: 'USA', latitude: 34.0522, longitude: -118.2437, popularityScore: 98 },
  { name: 'San Francisco', country: 'USA', latitude: 37.7749, longitude: -122.4194, popularityScore: 97 },
  { name: 'Las Vegas', country: 'USA', latitude: 36.1699, longitude: -115.1398, popularityScore: 96 },
  { name: 'Miami', country: 'USA', latitude: 25.7617, longitude: -80.1918, popularityScore: 95 },
  { name: 'Chicago', country: 'USA', latitude: 41.8781, longitude: -87.6298, popularityScore: 94 },
  { name: 'Toronto', country: 'Canada', latitude: 43.6532, longitude: -79.3832, popularityScore: 93 },
  { name: 'Vancouver', country: 'Canada', latitude: 49.2827, longitude: -123.1207, popularityScore: 92 },
  { name: 'Mexico City', country: 'Mexico', latitude: 19.4326, longitude: -99.1332, popularityScore: 91 },
  { name: 'Cancun', country: 'Mexico', latitude: 21.1619, longitude: -86.8515, popularityScore: 90 },
  
  // South America
  { name: 'Rio de Janeiro', country: 'Brazil', latitude: -22.9068, longitude: -43.1729, popularityScore: 95 },
  { name: 'Buenos Aires', country: 'Argentina', latitude: -34.6037, longitude: -58.3816, popularityScore: 94 },
  { name: 'Lima', country: 'Peru', latitude: -12.0464, longitude: -77.0428, popularityScore: 93 },
  { name: 'Santiago', country: 'Chile', latitude: -33.4489, longitude: -70.6693, popularityScore: 92 },
  { name: 'Bogota', country: 'Colombia', latitude: 4.7110, longitude: -74.0721, popularityScore: 91 },
  
  // Africa & Middle East
  { name: 'Cairo', country: 'Egypt', latitude: 30.0444, longitude: 31.2357, popularityScore: 94 },
  { name: 'Marrakech', country: 'Morocco', latitude: 31.6295, longitude: -7.9811, popularityScore: 93 },
  { name: 'Cape Town', country: 'South Africa', latitude: -33.9249, longitude: 18.4241, popularityScore: 92 },
  { name: 'Tel Aviv', country: 'Israel', latitude: 32.0853, longitude: 34.7818, popularityScore: 91 },
  { name: 'Jerusalem', country: 'Israel', latitude: 31.7683, longitude: 35.2137, popularityScore: 90 },
  
  // Oceania
  { name: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093, popularityScore: 96 },
  { name: 'Melbourne', country: 'Australia', latitude: -37.8136, longitude: 144.9631, popularityScore: 95 },
  { name: 'Auckland', country: 'New Zealand', latitude: -36.8485, longitude: 174.7633, popularityScore: 94 },
];

const activityTemplates = [
  // Travel activities
  { name: 'Airport Transfer', type: 'TRAVEL', cost: 25, duration: 60 },
  { name: 'Train Journey', type: 'TRAVEL', cost: 50, duration: 120 },
  { name: 'Bus Transfer', type: 'TRAVEL', cost: 15, duration: 90 },
  { name: 'Taxi Ride', type: 'TRAVEL', cost: 20, duration: 30 },
  { name: 'Car Rental', type: 'TRAVEL', cost: 80, duration: 1440 },
  { name: 'Metro Pass', type: 'TRAVEL', cost: 10, duration: 1440 },
  
  // Stay activities
  { name: 'Hotel Stay', type: 'STAY', cost: 150, duration: 1440 },
  { name: 'Hostel Stay', type: 'STAY', cost: 40, duration: 1440 },
  { name: 'Airbnb Stay', type: 'STAY', cost: 100, duration: 1440 },
  { name: 'Resort Stay', type: 'STAY', cost: 300, duration: 1440 },
  { name: 'Boutique Hotel', type: 'STAY', cost: 200, duration: 1440 },
  
  // Experience activities
  { name: 'Museum Visit', type: 'EXPERIENCE', cost: 20, duration: 180 },
  { name: 'Art Gallery Tour', type: 'EXPERIENCE', cost: 15, duration: 120 },
  { name: 'Historical Site Visit', type: 'EXPERIENCE', cost: 25, duration: 150 },
  { name: 'City Walking Tour', type: 'EXPERIENCE', cost: 30, duration: 180 },
  { name: 'Food Tour', type: 'EXPERIENCE', cost: 60, duration: 240 },
  { name: 'Wine Tasting', type: 'EXPERIENCE', cost: 50, duration: 120 },
  { name: 'Cooking Class', type: 'EXPERIENCE', cost: 70, duration: 180 },
  { name: 'Photography Tour', type: 'EXPERIENCE', cost: 45, duration: 180 },
  { name: 'Sunset Cruise', type: 'EXPERIENCE', cost: 80, duration: 120 },
  { name: 'Boat Tour', type: 'EXPERIENCE', cost: 60, duration: 150 },
  { name: 'Helicopter Tour', type: 'EXPERIENCE', cost: 200, duration: 60 },
  { name: 'Hot Air Balloon', type: 'EXPERIENCE', cost: 150, duration: 120 },
  { name: 'Paragliding', type: 'EXPERIENCE', cost: 120, duration: 60 },
  { name: 'Scuba Diving', type: 'EXPERIENCE', cost: 100, duration: 240 },
  { name: 'Snorkeling', type: 'EXPERIENCE', cost: 50, duration: 180 },
  { name: 'Surfing Lesson', type: 'EXPERIENCE', cost: 60, duration: 120 },
  { name: 'Hiking Tour', type: 'EXPERIENCE', cost: 40, duration: 300 },
  { name: 'Bike Tour', type: 'EXPERIENCE', cost: 35, duration: 180 },
  { name: 'Safari Tour', type: 'EXPERIENCE', cost: 150, duration: 360 },
  { name: 'Wildlife Watching', type: 'EXPERIENCE', cost: 80, duration: 240 },
  { name: 'Beach Day', type: 'EXPERIENCE', cost: 20, duration: 360 },
  { name: 'Spa Treatment', type: 'EXPERIENCE', cost: 100, duration: 120 },
  { name: 'Yoga Class', type: 'EXPERIENCE', cost: 25, duration: 90 },
  { name: 'Meditation Session', type: 'EXPERIENCE', cost: 20, duration: 60 },
  { name: 'Shopping', type: 'EXPERIENCE', cost: 100, duration: 180 },
  { name: 'Local Market Visit', type: 'EXPERIENCE', cost: 30, duration: 120 },
  { name: 'Concert', type: 'EXPERIENCE', cost: 75, duration: 180 },
  { name: 'Theater Show', type: 'EXPERIENCE', cost: 60, duration: 150 },
  { name: 'Nightlife Tour', type: 'EXPERIENCE', cost: 50, duration: 240 },
  { name: 'Street Food Tour', type: 'EXPERIENCE', cost: 40, duration: 180 },
  { name: 'Fine Dining', type: 'EXPERIENCE', cost: 120, duration: 150 },
  { name: 'Cafe Hopping', type: 'EXPERIENCE', cost: 30, duration: 180 },
  { name: 'Temple Visit', type: 'EXPERIENCE', cost: 10, duration: 90 },
  { name: 'Church Visit', type: 'EXPERIENCE', cost: 5, duration: 60 },
  { name: 'Mosque Visit', type: 'EXPERIENCE', cost: 5, duration: 60 },
  { name: 'Palace Tour', type: 'EXPERIENCE', cost: 30, duration: 150 },
  { name: 'Castle Visit', type: 'EXPERIENCE', cost: 25, duration: 120 },
  { name: 'Garden Tour', type: 'EXPERIENCE', cost: 15, duration: 120 },
  { name: 'Zoo Visit', type: 'EXPERIENCE', cost: 25, duration: 180 },
  { name: 'Aquarium Visit', type: 'EXPERIENCE', cost: 30, duration: 150 },
  { name: 'Theme Park', type: 'EXPERIENCE', cost: 80, duration: 360 },
  { name: 'Amusement Park', type: 'EXPERIENCE', cost: 60, duration: 300 },
  
  // Buffer activities
  { name: 'Rest Day', type: 'BUFFER', cost: 0, duration: 1440 },
  { name: 'Free Time', type: 'BUFFER', cost: 0, duration: 180 },
  { name: 'Flexible Schedule', type: 'BUFFER', cost: 0, duration: 240 },
];

const citySpecificActivities: Record<string, Array<{ name: string; type: 'EXPERIENCE' | 'STAY' | 'TRAVEL'; cost: number; duration: number }>> = {
  'Paris': [
    { name: 'Eiffel Tower Visit', type: 'EXPERIENCE', cost: 30, duration: 120 },
    { name: 'Louvre Museum', type: 'EXPERIENCE', cost: 20, duration: 240 },
    { name: 'Notre-Dame Visit', type: 'EXPERIENCE', cost: 0, duration: 90 },
    { name: 'Seine River Cruise', type: 'EXPERIENCE', cost: 50, duration: 90 },
    { name: 'Versailles Palace', type: 'EXPERIENCE', cost: 25, duration: 240 },
    { name: 'Montmartre Tour', type: 'EXPERIENCE', cost: 25, duration: 180 },
    { name: 'Champs-Élysées Walk', type: 'EXPERIENCE', cost: 0, duration: 120 },
  ],
  'London': [
    { name: 'Big Ben Visit', type: 'EXPERIENCE', cost: 0, duration: 60 },
    { name: 'Tower of London', type: 'EXPERIENCE', cost: 35, duration: 180 },
    { name: 'British Museum', type: 'EXPERIENCE', cost: 0, duration: 240 },
    { name: 'Westminster Abbey', type: 'EXPERIENCE', cost: 25, duration: 120 },
    { name: 'Thames River Cruise', type: 'EXPERIENCE', cost: 40, duration: 90 },
    { name: 'Buckingham Palace', type: 'EXPERIENCE', cost: 30, duration: 120 },
    { name: 'London Eye', type: 'EXPERIENCE', cost: 35, duration: 60 },
  ],
  'Tokyo': [
    { name: 'Senso-ji Temple', type: 'EXPERIENCE', cost: 0, duration: 90 },
    { name: 'Shibuya Crossing', type: 'EXPERIENCE', cost: 0, duration: 60 },
    { name: 'Tokyo Skytree', type: 'EXPERIENCE', cost: 30, duration: 120 },
    { name: 'Tsukiji Fish Market', type: 'EXPERIENCE', cost: 20, duration: 120 },
    { name: 'Meiji Shrine', type: 'EXPERIENCE', cost: 0, duration: 90 },
    { name: 'Harajuku District', type: 'EXPERIENCE', cost: 0, duration: 180 },
    { name: 'Sushi Making Class', type: 'EXPERIENCE', cost: 80, duration: 180 },
  ],
  'New York': [
    { name: 'Statue of Liberty', type: 'EXPERIENCE', cost: 25, duration: 180 },
    { name: 'Empire State Building', type: 'EXPERIENCE', cost: 40, duration: 120 },
    { name: 'Central Park Walk', type: 'EXPERIENCE', cost: 0, duration: 180 },
    { name: 'Times Square', type: 'EXPERIENCE', cost: 0, duration: 90 },
    { name: 'Broadway Show', type: 'EXPERIENCE', cost: 150, duration: 180 },
    { name: 'Metropolitan Museum', type: 'EXPERIENCE', cost: 25, duration: 240 },
    { name: 'Brooklyn Bridge Walk', type: 'EXPERIENCE', cost: 0, duration: 120 },
  ],
  'Rome': [
    { name: 'Colosseum Tour', type: 'EXPERIENCE', cost: 20, duration: 120 },
    { name: 'Vatican Museums', type: 'EXPERIENCE', cost: 20, duration: 240 },
    { name: 'Trevi Fountain', type: 'EXPERIENCE', cost: 0, duration: 60 },
    { name: 'Pantheon Visit', type: 'EXPERIENCE', cost: 0, duration: 60 },
    { name: 'Roman Forum', type: 'EXPERIENCE', cost: 15, duration: 120 },
    { name: 'Spanish Steps', type: 'EXPERIENCE', cost: 0, duration: 60 },
  ],
  'Barcelona': [
    { name: 'Sagrada Familia', type: 'EXPERIENCE', cost: 25, duration: 120 },
    { name: 'Park Güell', type: 'EXPERIENCE', cost: 15, duration: 180 },
    { name: 'La Rambla Walk', type: 'EXPERIENCE', cost: 0, duration: 120 },
    { name: 'Gothic Quarter Tour', type: 'EXPERIENCE', cost: 20, duration: 150 },
    { name: 'Camp Nou Tour', type: 'EXPERIENCE', cost: 30, duration: 120 },
  ],
  'Dubai': [
    { name: 'Burj Khalifa', type: 'EXPERIENCE', cost: 50, duration: 120 },
    { name: 'Palm Jumeirah', type: 'EXPERIENCE', cost: 0, duration: 180 },
    { name: 'Dubai Mall', type: 'EXPERIENCE', cost: 0, duration: 240 },
    { name: 'Desert Safari', type: 'EXPERIENCE', cost: 80, duration: 360 },
    { name: 'Dubai Marina', type: 'EXPERIENCE', cost: 0, duration: 120 },
  ],
  'Bangkok': [
    { name: 'Wat Pho Temple', type: 'EXPERIENCE', cost: 10, duration: 90 },
    { name: 'Grand Palace', type: 'EXPERIENCE', cost: 15, duration: 180 },
    { name: 'Floating Market', type: 'EXPERIENCE', cost: 30, duration: 180 },
    { name: 'Chatuchak Market', type: 'EXPERIENCE', cost: 0, duration: 240 },
    { name: 'Thai Massage', type: 'EXPERIENCE', cost: 30, duration: 90 },
  ],
  'Sydney': [
    { name: 'Sydney Opera House', type: 'EXPERIENCE', cost: 40, duration: 120 },
    { name: 'Harbour Bridge Climb', type: 'EXPERIENCE', cost: 200, duration: 180 },
    { name: 'Bondi Beach', type: 'EXPERIENCE', cost: 0, duration: 240 },
    { name: 'Taronga Zoo', type: 'EXPERIENCE', cost: 45, duration: 240 },
  ],
  'Rio de Janeiro': [
    { name: 'Christ the Redeemer', type: 'EXPERIENCE', cost: 30, duration: 180 },
    { name: 'Copacabana Beach', type: 'EXPERIENCE', cost: 0, duration: 240 },
    { name: 'Sugarloaf Mountain', type: 'EXPERIENCE', cost: 40, duration: 180 },
    { name: 'Samba Show', type: 'EXPERIENCE', cost: 60, duration: 120 },
  ],
};

async function main() {
  console.log('Starting seed...');

  // Create cities
  console.log('Creating cities...');
  const createdCities = [];
  for (const city of cities) {
    const created = await prisma.city.upsert({
      where: { name_country: { name: city.name, country: city.country } },
      update: {},
      create: city,
    });
    createdCities.push(created);
  }
  console.log(`Created ${createdCities.length} cities`);

  // Create activities
  console.log('Creating activities...');
  let activityCount = 0;
  
  // Add city-specific activities
  for (const [cityName, activities] of Object.entries(citySpecificActivities)) {
    const city = createdCities.find(c => c.name === cityName);
    if (city) {
      for (const activity of activities) {
        await prisma.activity.create({
          data: {
            ...activity,
            cityId: city.id,
            description: `${activity.name} in ${cityName}`,
          },
        });
        activityCount++;
      }
    }
  }

  // Add template activities to all cities
  for (const city of createdCities) {
    for (const template of activityTemplates) {
      // Skip if city already has this specific activity
      if (citySpecificActivities[city.name]?.some(a => a.name === template.name)) {
        continue;
      }
      
      await prisma.activity.create({
        data: {
          ...template,
          cityId: city.id,
          description: `${template.name} in ${city.name}, ${city.country}`,
        },
      });
      activityCount++;
    }
  }

  console.log(`Created ${activityCount} activities`);
  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

