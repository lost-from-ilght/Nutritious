/**
 * Nutrition and calorie calculation utilities
 */

/**
 * Calculate net calories (consumed - burned)
 */
export const calculateNetCalories = (consumed: number, burned: number): number => {
  return consumed - burned;
};

/**
 * Determine activity status based on calorie goal and net calories
 */
export type ActivityStatus = 'noData' | 'under' | 'onTrack' | 'over';

export const getActivityStatus = (
  caloriesConsumed: number,
  caloriesBurned: number,
  calorieGoal: number
): ActivityStatus => {
  const netCalories = calculateNetCalories(caloriesConsumed, caloriesBurned);

  if (caloriesConsumed === 0 && caloriesBurned === 0) {
    return 'noData';
  }

  const percentage = (netCalories / calorieGoal) * 100;

  if (percentage < 80) return 'under';
  if (percentage > 100) return 'over';
  return 'onTrack';
};

/**
 * Calculate macro percentages
 */
export const calculateMacroPercentages = (
  protein: number,
  carbs: number,
  fats: number
): { protein: number; carbs: number; fats: number } => {
  const total = protein + carbs + fats;
  if (total === 0) return { protein: 0, carbs: 0, fats: 0 };
  return {
    protein: (protein / total) * 100,
    carbs: (carbs / total) * 100,
    fats: (fats / total) * 100,
  };
};

/**
 * Calculate recommended macros based on calorie goal.
 * For weight loss: higher protein (35%) to preserve muscle, moderate carbs (35%), lower fat (30%)
 */
export const calculateRecommendedMacros = (
  calorieGoal: number,
  goalType: string = 'maintain'
): { protein: number; carbs: number; fats: number } => {
  let proteinRatio = 0.30;
  let carbsRatio   = 0.40;
  let fatsRatio    = 0.30;

  if (goalType === 'lose') {
    proteinRatio = 0.35; // higher protein preserves muscle during deficit
    carbsRatio   = 0.35;
    fatsRatio    = 0.30;
  } else if (goalType === 'gain') {
    proteinRatio = 0.30;
    carbsRatio   = 0.45;
    fatsRatio    = 0.25;
  }

  return {
    protein: Math.round((calorieGoal * proteinRatio) / 4),
    carbs:   Math.round((calorieGoal * carbsRatio)   / 4),
    fats:    Math.round((calorieGoal * fatsRatio)    / 9),
  };
};

/**
 * Activity level multipliers (Mifflin-St Jeor)
 */
const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary:   1.2,   // desk job, no exercise
  light:       1.375, // 1-3 days/week
  moderate:    1.55,  // 3-5 days/week
  active:      1.725, // 6-7 days/week
  very_active: 1.9,   // physical job + training
};

/**
 * Calculate TDEE (Total Daily Energy Expenditure) using Mifflin-St Jeor BMR.
 * Returns null if required fields are missing.
 */
export const calculateTDEE = (params: {
  age: number;
  gender: string;
  heightCm: number;
  weightKg: number;
  activityLevel: string;
}): number | null => {
  const { age, gender, heightCm, weightKg, activityLevel } = params;
  if (!age || !gender || !heightCm || !weightKg) return null;

  // Mifflin-St Jeor BMR
  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }

  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.2;
  return Math.round(bmr * multiplier);
};

/**
 * Calculate a calorie goal from TDEE adjusted for goal type.
 * lose:     -500 kcal/day  → ~0.5 kg/week loss
 * maintain:  0
 * gain:     +300 kcal/day  → lean bulk
 */
export const calculateCalorieGoalFromTDEE = (
  tdee: number,
  goalType: string
): number => {
  if (goalType === 'lose')     return Math.max(1200, tdee - 500);
  if (goalType === 'gain')     return tdee + 300;
  return tdee;
};

/**
 * Estimate weeks to reach target weight at current deficit/surplus.
 * Returns null if not enough data.
 */
export const estimateWeeksToGoal = (
  currentWeightKg: number,
  targetWeightKg: number,
  dailyCalorieDelta: number // negative = deficit
): number | null => {
  if (!currentWeightKg || !targetWeightKg || dailyCalorieDelta === 0) return null;
  const kgToLose = currentWeightKg - targetWeightKg;
  if (kgToLose === 0) return 0;
  // 1 kg of fat ≈ 7700 kcal
  const weeksNeeded = (kgToLose * 7700) / (Math.abs(dailyCalorieDelta) * 7);
  return Math.round(weeksNeeded);
};
