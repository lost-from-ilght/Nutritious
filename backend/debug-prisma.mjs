import { config } from 'dotenv';
config({ path: './backend/.env' });

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './backend/src/generated/prisma/index.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const models = Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$'));
console.log('available models:', models);
console.log('prisma.user type:', typeof prisma.user);
