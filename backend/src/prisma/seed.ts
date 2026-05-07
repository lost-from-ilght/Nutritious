import { PrismaClient } from '../generated/prisma';
import bcrypt from 'bcryptjs';
import { getToday, getDaysAgo, getDateString } from '../utils/date';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create test user
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      name: 'Test User',
      email: 'test@example.com',
      passwordHash,
      calorieGoal: 2000,
      streakCount: 5,
      totalScore: 250,
    },
  });

  console.log('✅ Created user:', user.email);

  // Create streak
  await prisma.streak.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      startDate: getDaysAgo(5),
      endDate: getToday(),
      currentStreak: 5,
      longestStreak: 5,
    },
  });

  console.log('✅ Created streak');

  // Create food logs for the last 5 days
  const foodEntries = [
    { name: 'Grilled Chicken Salad', calories: 450, protein: 35, carbs: 20, fats: 25 },
    { name: 'Turkey Sandwich', calories: 520, protein: 30, carbs: 45, fats: 20 },
    { name: 'Greek Yogurt with Berries', calories: 180, protein: 15, carbs: 25, fats: 5 },
    { name: 'Salmon with Rice', calories: 650, protein: 40, carbs: 60, fats: 25 },
    { name: 'Protein Smoothie', calories: 300, protein: 25, carbs: 35, fats: 8 },
  ];

  for (let i = 0; i < 5; i++) {
    const date = getDaysAgo(4 - i);
    const food = foodEntries[i];
    
    await prisma.foodLog.create({
      data: {
        userId: user.id,
        foodName: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fats: food.fats,
        timestamp: new Date(date.getTime() + 12 * 60 * 60 * 1000), // 12 PM
        details: `Delicious ${food.name.toLowerCase()}`,
      },
    });
  }

  console.log('✅ Created food logs');

  // Create exercise logs
  const exerciseEntries = [
    { name: 'Morning Run', calories: 320, duration: 30 },
    { name: 'Weight Training', calories: 250, duration: 45 },
    { name: 'Yoga Session', calories: 150, duration: 60 },
    { name: 'Cycling', calories: 400, duration: 40 },
    { name: 'Swimming', calories: 350, duration: 30 },
  ];

  for (let i = 0; i < 5; i++) {
    const date = getDaysAgo(4 - i);
    const exercise = exerciseEntries[i];
    
    await prisma.exerciseLog.create({
      data: {
        userId: user.id,
        exerciseName: exercise.name,
        caloriesBurned: exercise.calories,
        duration: exercise.duration,
        timestamp: new Date(date.getTime() + 7 * 60 * 60 * 1000), // 7 AM
        details: `Great ${exercise.name.toLowerCase()} session`,
      },
    });
  }

  console.log('✅ Created exercise logs');

  // Create daily summaries
  for (let i = 0; i < 5; i++) {
    const date = getDaysAgo(4 - i);
    const food = foodEntries[i];
    const exercise = exerciseEntries[i];
    
    const caloriesConsumed = food.calories;
    const caloriesBurned = exercise.calories;
    const netCalories = caloriesConsumed - caloriesBurned;
    
    await prisma.dailySummary.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date,
        },
      },
      update: {},
      create: {
        userId: user.id,
        date,
        caloriesConsumed,
        caloriesBurned,
        netCalories,
        protein: food.protein,
        carbs: food.carbs,
        fats: food.fats,
      },
    });

    // Create activity graph entries
    const status = netCalories < 1600 ? 'under' : netCalories > 2400 ? 'over' : 'onTrack';
    await prisma.activityGraph.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date,
        },
      },
      update: {},
      create: {
        userId: user.id,
        date,
        status,
      },
    });
  }

  console.log('✅ Created daily summaries and activity graph');

  // Create some scores
  const scores = [
    { points: 10, reason: 'Daily log entry' },
    { points: 10, reason: 'Daily log entry' },
    { points: 50, reason: 'Hit daily calorie goal' },
    { points: 30, reason: '3 day streak' },
    { points: 10, reason: 'Daily log entry' },
  ];

  for (let i = 0; i < 5; i++) {
    const date = getDaysAgo(4 - i);
    await prisma.score.create({
      data: {
        userId: user.id,
        points: scores[i].points,
        reason: scores[i].reason,
        timestamp: new Date(date.getTime() + 18 * 60 * 60 * 1000), // 6 PM
      },
    });
  }

  console.log('✅ Created scores');

  console.log('\n🎉 Seeding completed!');
  console.log('\n📝 Test credentials:');
  console.log('   Email: test@example.com');
  console.log('   Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

