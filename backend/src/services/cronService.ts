import cron from 'node-cron';
import { evaluateConsistency } from './rrService';

export const startCronJobs = () => {
  console.log('Starting background cron jobs...');

  // Run at midnight (00:00) every day
  cron.schedule('0 0 * * *', async () => {
    try {
      await evaluateConsistency();
    } catch (error) {
      console.error('Error during evaluateConsistency cron job:', error);
    }
  });
};
