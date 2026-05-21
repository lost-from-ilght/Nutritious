import 'dotenv/config';
import { prisma } from '../config/database';

async function run() {
  const users = await prisma.user.findMany({
    where: { totalRR: { lt: 10 } }
  });

  for (const u of users) {
    let newRank = u.rank === 'UNRANKED' || u.rank === 'PLASTIC' ? 'IRON' : u.rank;
    let newCurrent = u.currentRR < 10 ? 10 : u.currentRR;
    
    await prisma.user.update({
      where: { id: u.id },
      data: {
        totalRR: 10,
        currentRR: newCurrent,
        rank: newRank,
        tier: 1
      }
    });
  }

  console.log(`Updated ${users.length} users to 10 RR baseline.`);
}

run().catch(console.error).finally(() => process.exit(0));
