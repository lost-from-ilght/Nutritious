/**
 * Scoring system for user engagement
 */

export enum ScoreReason {
  DAILY_LOG = 'Daily log entry',
  GOAL_HIT = 'Hit daily calorie goal',
  STREAK_3 = '3 day streak',
  STREAK_7 = '7 day streak',
  STREAK_30 = '30 day streak',
  CONSISTENT_LOGGING = 'Consistent logging',
}

export const SCORE_VALUES: Record<ScoreReason, number> = {
  [ScoreReason.DAILY_LOG]: 10,
  [ScoreReason.GOAL_HIT]: 50,
  [ScoreReason.STREAK_3]: 30,
  [ScoreReason.STREAK_7]: 100,
  [ScoreReason.STREAK_30]: 500,
  [ScoreReason.CONSISTENT_LOGGING]: 25,
};

/**
 * Calculate score for a given reason
 */
export const calculateScore = (reason: ScoreReason): number => {
  return SCORE_VALUES[reason] || 0;
};

/**
 * Check if user should get a streak milestone score
 */
export const getStreakMilestoneScore = (streakCount: number): { reason: ScoreReason | null; points: number } => {
  if (streakCount === 3) {
    return { reason: ScoreReason.STREAK_3, points: SCORE_VALUES[ScoreReason.STREAK_3] };
  }
  if (streakCount === 7) {
    return { reason: ScoreReason.STREAK_7, points: SCORE_VALUES[ScoreReason.STREAK_7] };
  }
  if (streakCount === 30) {
    return { reason: ScoreReason.STREAK_30, points: SCORE_VALUES[ScoreReason.STREAK_30] };
  }
  return { reason: null, points: 0 };
};

