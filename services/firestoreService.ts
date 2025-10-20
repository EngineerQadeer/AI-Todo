import type { Task, PrayerSettings, HealthSettings, Notification, Theme } from '../types';

// The key for storing all app data in localStorage.
const APP_DATA_KEY = 'ai-planner-app-data';

export interface AppData {
    tasks: Task[];
    prayerSettings: PrayerSettings;
    healthSettings: HealthSettings;
    theme: Theme;
    notifications: Notification[];
}

/**
 * Saves the entire application state to localStorage.
 * This acts as our persistent storage, ensuring data is saved across sessions.
 * @param data The complete application data object.
 */
export const saveData = (data: AppData) => {
    try {
        localStorage.setItem(APP_DATA_KEY, JSON.stringify(data));
    } catch (error) {
        // This can happen if localStorage is full or disabled.
        console.error("Failed to save application data to localStorage:", error);
    }
};

/**
 * Loads the entire application state from localStorage.
 * This retrieves the user's data when the app starts.
 * @returns The saved AppData object, or null if no data is found.
 */
export const loadData = (): AppData | null => {
    try {
        const savedData = localStorage.getItem(APP_DATA_KEY);
        if (savedData) {
            return JSON.parse(savedData) as AppData;
        }
        return null;
    } catch (error) {
        console.error("Failed to load application data from localStorage:", error);
        // If there's a parsing error, it's safer to start fresh.
        localStorage.removeItem(APP_DATA_KEY);
        return null;
    }
};
