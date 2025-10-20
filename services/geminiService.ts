import { GoogleGenAI, Type } from '@google/genai';
import { TaskCategory, RecurrenceFrequency } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const schema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: 'The concise title of the task.',
    },
    category: {
      type: Type.STRING,
      description: 'The category of the task, inferred from the title and context.',
      enum: Object.values(TaskCategory),
    },
    startTime: {
      type: Type.STRING,
      description: 'The start time of the task in HH:MM AM/PM format.',
    },
    endTime: {
      type: Type.STRING,
      description: 'The end time of the task in HH:MM AM/PM format. Can be the same as start time for events.',
    },
    reminder: {
        type: Type.NUMBER,
        description: 'Optional reminder time in minutes before the start time. If the user mentions a time-based event but no reminder, default to 15 minutes.'
    },
    recurrence: {
        type: Type.STRING,
        description: 'Optional recurrence frequency, inferred from phrases like "every day" or "weekly".',
        enum: Object.values(RecurrenceFrequency),
    }
  },
  required: ['title', 'category', 'startTime', 'endTime'],
};

interface GeminiTaskResponse {
    title: string;
    category: string;
    startTime: string;
    endTime: string;
    reminder?: number;
    recurrence?: RecurrenceFrequency;
}

export async function generateTaskFromPrompt(prompt: string): Promise<GeminiTaskResponse | null> {
    try {
        const fullPrompt = `Parse the following user request into a structured task object. Analyze the request to infer recurrence (Daily, Weekly, Monthly) and reminder time. If a reminder isn't specified for a timed event, default it to 15 minutes. Current date is ${new Date().toDateString()}. Request: "${prompt}"`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });

        const jsonText = response.text.trim().replace(/^```json\s*|```\s*$/g, '');
        const parsedJson = JSON.parse(jsonText) as GeminiTaskResponse;
        
        if (parsedJson && parsedJson.title && parsedJson.category && parsedJson.startTime && parsedJson.endTime) {
            return parsedJson;
        } else {
            console.error("Generated JSON is missing required fields:", parsedJson);
            return null;
        }

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw error;
    }
}
