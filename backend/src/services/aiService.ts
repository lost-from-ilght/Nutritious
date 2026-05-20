import Groq from 'groq-sdk';

export interface AIProcessedEntry {
  type: 'food' | 'exercise';
  data: {
    name: string;
    calories: number;
    caloriesBurned?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
    duration?: number;
    details?: string;
  };
}

export const processAIEntry = async (text: string, groqApiKey: string): Promise<AIProcessedEntry> => {
  const groq = new Groq({
    apiKey: groqApiKey.trim(),
    timeout: 30000,
  });

  const prompt = `You are a nutrition and fitness expert. Analyze the following user entry and determine if it describes food consumption or exercise activity.
User entry: "${text}"

Return a JSON object with the following structure:
If it's food: { "type": "food", "data": { "name": "Food Name", "calories": 250, "protein": 15, "carbs": 30, "fats": 8, "details": "Description of the meal and estimated portion size" } }
If it's exercise: { "type": "exercise", "data": { "name": "exercise", "caloriesBurned": 300, "duration": 45, "details": "Description of the exercise intensity" } }

Ensure all numerical values are numbers, not strings. Provide your best scientific estimate for nutrition if not specified.
Return ONLY the JSON object, no other text.`;

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      response_format: { type: 'json_object' },
      max_tokens: 512,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('AI returned an empty response');
    }

    const result = JSON.parse(content);
    return result as AIProcessedEntry;
  } catch (error: any) {
    console.error('Groq API Error details:', error?.response?.data || error);

    if (error?.status === 401) {
      throw new Error('Invalid Groq API Key. Please check your .env file.');
    }

    throw new Error(error instanceof Error ? error.message : 'Failed to process entry with AI');
  }
};
