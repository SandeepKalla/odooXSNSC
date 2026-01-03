import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupDuplicates() {
  console.log('Starting duplicate cleanup...\n');

  // 1. Clean up duplicate cities (keep the oldest one)
  console.log('Checking for duplicate cities...');
  const allCities = await prisma.city.findMany({
    orderBy: { createdAt: 'asc' },
  });

  const cityMap = new Map<string, string[]>(); // key: "name|country", value: array of IDs
  for (const city of allCities) {
    const key = `${city.name}|${city.country}`;
    if (!cityMap.has(key)) {
      cityMap.set(key, []);
    }
    cityMap.get(key)!.push(city.id);
  }

  let duplicateCitiesDeleted = 0;
  for (const [key, ids] of cityMap.entries()) {
    if (ids.length > 1) {
      // Keep the first one (oldest), delete the rest
      const [keepId, ...deleteIds] = ids;
      console.log(`  Found ${ids.length} duplicates for ${key.split('|')[0]}, ${key.split('|')[1]} - keeping oldest, deleting ${deleteIds.length}`);
      
      // Delete activities associated with duplicate cities first
      for (const deleteId of deleteIds) {
        await prisma.activity.deleteMany({
          where: { cityId: deleteId },
        });
        await prisma.savedDestination.deleteMany({
          where: { cityId: deleteId },
        });
      }
      
      // Delete duplicate cities
      await prisma.city.deleteMany({
        where: { id: { in: deleteIds } },
      });
      
      duplicateCitiesDeleted += deleteIds.length;
    }
  }
  console.log(`Deleted ${duplicateCitiesDeleted} duplicate cities\n`);

  // 2. Clean up duplicate activities (keep the oldest one)
  console.log('Checking for duplicate activities...');
  const allActivities = await prisma.activity.findMany({
    orderBy: { createdAt: 'asc' },
    include: { city: true },
  });

  const activityMap = new Map<string, string[]>(); // key: "name|type|cityId", value: array of IDs
  for (const activity of allActivities) {
    const key = `${activity.name}|${activity.type}|${activity.cityId}`;
    if (!activityMap.has(key)) {
      activityMap.set(key, []);
    }
    activityMap.get(key)!.push(activity.id);
  }

  let duplicateActivitiesDeleted = 0;
  for (const [key, ids] of activityMap.entries()) {
    if (ids.length > 1) {
      // Keep the first one (oldest), delete the rest
      const [keepId, ...deleteIds] = ids;
      const [name, type, cityId] = key.split('|');
      const city = allActivities.find(a => a.cityId === cityId)?.city;
      console.log(`  Found ${ids.length} duplicates for "${name}" (${type}) in ${city?.name || cityId} - keeping oldest, deleting ${deleteIds.length}`);
      
      // Delete section activities associated with duplicate activities
      await prisma.sectionActivity.deleteMany({
        where: { activityId: { in: deleteIds } },
      });
      
      // Delete duplicate activities
      await prisma.activity.deleteMany({
        where: { id: { in: deleteIds } },
      });
      
      duplicateActivitiesDeleted += deleteIds.length;
    }
  }
  console.log(`Deleted ${duplicateActivitiesDeleted} duplicate activities\n`);

  // 3. Clean up orphaned records
  console.log('Checking for orphaned records...');
  
  // Orphaned activities (city doesn't exist)
  const allCityIds = new Set((await prisma.city.findMany()).map(c => c.id));
  const orphanedActivities = await prisma.activity.findMany({
    where: {
      cityId: { notIn: Array.from(allCityIds) },
    },
  });
  
  if (orphanedActivities.length > 0) {
    console.log(`  Found ${orphanedActivities.length} orphaned activities`);
    const orphanedIds = orphanedActivities.map(a => a.id);
    
    // Delete section activities first
    await prisma.sectionActivity.deleteMany({
      where: { activityId: { in: orphanedIds } },
    });
    
    // Delete orphaned activities
    await prisma.activity.deleteMany({
      where: { id: { in: orphanedIds } },
    });
    
    console.log(`  Deleted ${orphanedActivities.length} orphaned activities\n`);
  } else {
    console.log('  No orphaned activities found\n');
  }

  // Orphaned saved destinations
  const orphanedSavedDestinations = await prisma.savedDestination.findMany({
    where: {
      cityId: { notIn: Array.from(allCityIds) },
    },
  });
  
  if (orphanedSavedDestinations.length > 0) {
    console.log(`  Found ${orphanedSavedDestinations.length} orphaned saved destinations`);
    await prisma.savedDestination.deleteMany({
      where: { cityId: { notIn: Array.from(allCityIds) } },
    });
    console.log(`  Deleted ${orphanedSavedDestinations.length} orphaned saved destinations\n`);
  } else {
    console.log('  No orphaned saved destinations found\n');
  }

  // Summary
  console.log('Cleanup completed!');
  console.log(`Summary:`);
  console.log(`  - Duplicate cities deleted: ${duplicateCitiesDeleted}`);
  console.log(`  - Duplicate activities deleted: ${duplicateActivitiesDeleted}`);
  console.log(`  - Orphaned activities deleted: ${orphanedActivities.length}`);
  console.log(`  - Orphaned saved destinations deleted: ${orphanedSavedDestinations.length}`);
}

cleanupDuplicates()
  .catch((e) => {
    console.error('Error during cleanup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

