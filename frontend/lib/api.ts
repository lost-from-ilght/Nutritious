const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Get auth token from localStorage
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

// Set auth token in localStorage
export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
};

// Remove auth token from localStorage
export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
};

// API request helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { 'x-session-token': token } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    // Send the better-auth session cookie cross-origin to the Express backend
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Auth API
export const authApi = {
  signup: async (data: { name: string; email: string; password: string }) => {
    const response = await apiRequest<{ user: any; token: string }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response.token) {
      setToken(response.token);
    }
    return response;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await apiRequest<{ user: any; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response.token) {
      setToken(response.token);
    }
    return response;
  },

  logout: async () => {
    await apiRequest('/api/auth/logout', {
      method: 'POST',
    });
    removeToken();
  },
};

// Dashboard API
export const dashboardApi = {
  getDashboard: async () => {
    return apiRequest<{
      calorieGoal: { consumed: number; goal: number };
      macros: {
        protein: { current: number; total: number };
        carbs: { current: number; total: number };
        fats: { current: number; total: number };
      };
      activityGraph: Array<{ date: string; status: string }>;
      recentActivity: Array<{
        id: string;
        title: string;
        calories: number;
        type: 'food' | 'exercise';
        time: string;
        details?: string;
      }>;
    }>('/api/dashboard');
  },
};

// User API
export const userApi = {
  getProfile: async () => {
    return apiRequest<{
      user: {
        id: string;
        name: string;
        email: string;
        avatarUrl: string | null;
        streakCount: number;
        totalScore: number;
        calorieGoal: number;
        heightCm?: number | null;
        currentWeightKg?: number | null;
        targetWeightKg?: number | null;
        activityLevel?: string | null;
        goalType?: string | null;
        age?: number | null;
        gender?: string | null;
        latestWeight?: { weightKg: number; date: string } | null;
        streak: {
          current: number;
          longest: number;
          startDate: string | null;
          endDate: string | null;
        };
        recentScores: Array<{
          id: string;
          points: number;
          reason: string;
          timestamp: string;
        }>;
      };
    }>('/api/user/profile');
  },

  updateProfile: async (data: {
    name?: string;
    avatarUrl?: string;
    calorieGoal?: number;
    age?: number;
    gender?: string;
    heightCm?: number;
    currentWeightKg?: number;
    targetWeightKg?: number;
    activityLevel?: string;
    goalType?: string;
  }) => {
    return apiRequest<{ message: string; user: any }>('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Food API
export const foodApi = {
  logFood: async (data: {
    foodName: string;
    calories: number;
    protein?: number;
    carbs?: number;
    fats?: number;
    details?: string;
  }) => {
    return apiRequest('/api/food', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getRecentFood: async () => {
    return apiRequest<Array<{
      id: string;
      foodName: string;
      calories: number;
      timestamp: string;
      details?: string;
    }>>('/api/food/recent');
  },

  deleteFood: async (id: string) => {
    return apiRequest(`/api/food/${id}`, {
      method: 'DELETE',
    });
  },
};

// Exercise API
export const exerciseApi = {
  logExercise: async (data: {
    exerciseName: string;
    caloriesBurned: number;
    details?: string;
  }) => {
    return apiRequest('/api/exercise', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getRecentExercise: async () => {
    return apiRequest<Array<{
      id: string;
      exerciseName: string;
      caloriesBurned: number;
      timestamp: string;
      details?: string;
    }>>('/api/exercise/recent');
  },

  deleteExercise: async (id: string) => {
    return apiRequest(`/api/exercise/${id}`, {
      method: 'DELETE',
    });
  },
};

// Scores API (for leaderboard)
export const scoresApi = {
  getScores: async (limit?: number, offset?: number) => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<{
      scores: Array<{
        id: string;
        points: number;
        reason: string;
        timestamp: string;
      }>;
      pagination: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
      };
    }>(`/api/scores${query}`);
  },

  getLeaderboard: async (limit?: number) => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<{
      leaderboard: Array<{
        rank: number;
        name: string;
        points: number;
        avatar: string;
      }>;
    }>(`/api/scores/leaderboard${query}`);
  },
};

// Weight API
export const weightApi = {
  getHistory: async () => {
    return apiRequest<{
      logs: Array<{ date: string; weightKg: number; note?: string }>;
    }>('/api/user/weight');
  },

  logWeight: async (data: { weightKg: number; note?: string; date?: string }) => {
    return apiRequest<{ entry: { date: string; weightKg: number } }>('/api/user/weight', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteLog: async (date: string) => {
    return apiRequest(`/api/user/weight/${date}`, { method: 'DELETE' });
  },
};

// Progress API
export const progressApi = {
  getWeekly: async () => {
    return apiRequest<{
      thisWeek: { daysWithData: number; daysInDeficit: number; avgCalories: number; avgProtein: number; totalCaloriesBurned: number; weightChange: number | null };
      prevWeek: { daysWithData: number; daysInDeficit: number; avgCalories: number; avgProtein: number; totalCaloriesBurned: number };
      dailyBreakdown: Array<{ date: string; calories: number; goal: number; protein: number; inDeficit: boolean }>;
      calorieGoal: number;
    }>('/api/progress/weekly');
  },

  getMonthly: async () => {
    return apiRequest<{
      weeks: Array<{ label: string; avgCalories: number; daysInDeficit: number; avgProtein: number }>;
      weightLogs: Array<{ date: string; weightKg: number }>;
      calorieGoal: number;
    }>('/api/progress/monthly');
  },
};

// AI API
export const aiApi = {
  processEntry: async (text: string) => {
    return apiRequest<{ message: string; data?: any }>('/api/ai/process', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },
};

