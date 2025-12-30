
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMascotAdvice = async (points: number, tasksCount: number, habitsCount: number) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a minimalist, calm productivity assistant for a Notion-style app called Unrot. 
      Current Workspace Status: ${points} points earned, ${tasksCount} tasks pending.
      Focus on encouraging consistency. Keep it to 1 sentence, professional, minimalist.`,
    });
    return response.text || "Structure your workspace for maximum clarity.";
  } catch (error) {
    console.error("Mascot Error:", error);
    return "Ready to organize your workspace for the day?";
  }
};

export const chatWithAssistant = async (message: string, history: any[]) => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: "You are the Unrot Assistant, a minimalist, professional, and helpful productivity expert. You live inside a Notion-style workspace. Keep your answers concise, high-value, and formatted in clean text. Use a calm and neutral tone.",
      }
    });

    const response = await chat.sendMessage({ message });
    return response.text || "I'm here to help you stay focused.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "I'm having trouble connecting right now. Let's focus on your tasks.";
  }
};

export const suggestStructuredSchedule = async (tasks: any[], context: string) => {
  try {
    if (tasks.length === 0) return [];
    
    const taskSummary = tasks.map(t => ({ id: t.id, title: t.title, category: t.category })).slice(0, 15);
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User Intent: "${context || 'normal day'}". 
      Available Tasks: ${JSON.stringify(taskSummary)}.
      Requirement: Create a schedule between 07:00 and 21:00.
      Rule 1: Use the EXACT "id" provided for each task. 
      Rule 2: Map tasks to reasonable "startTime" slots (format HH:00).
      Rule 3: Return ONLY a JSON array. Do not include any text outside the JSON.
      
      Example: [{"taskId": "id123", "startTime": "09:00"}]`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              taskId: { type: Type.STRING },
              startTime: { type: Type.STRING }
            },
            required: ["taskId", "startTime"]
          }
        }
      }
    });
    
    const text = response.text?.trim() || "[]";
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Planner Error:", error);
    throw error;
  }
};

// Fixed: Added missing getWeeklySuggestions function for Dashboard insights
export const getWeeklySuggestions = async (stats: {
  tasksDone: number;
  pointsEarned: number;
  pointsSpent: number;
  categoryBreakdown: Record<string, number>;
}) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `As an AI productivity analyst for the "Unrot" workspace, review these weekly stats:
      - Tasks Completed: ${stats.tasksDone}
      - Points Earned: ${stats.pointsEarned}
      - Points Spent: ${stats.pointsSpent}
      - Category Distribution: ${JSON.stringify(stats.categoryBreakdown)}
      
      Provide 3 specific, minimalist suggestions for improving focus or maintaining balance. 
      Format: Bulleted list (•), one sentence per point.`,
    });
    return response.text || "• Stay consistent with your daily tasks.\n• Reward your hard work occasionally.\n• Balance your work across different categories.";
  } catch (error) {
    console.error("Weekly Suggestions Error:", error);
    return "• Maintain your current productivity levels.\n• Check your task priorities regularly.\n• Ensure you are taking breaks.";
  }
};
