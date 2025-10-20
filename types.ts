export enum TaskCategory {
    Work = 'Work',
    Personal = 'Personal',
    Health = 'Health',
    Finance = 'Finance',
    Home = 'Home',
    Social = 'Social',
    Other = 'Other',
}

export enum TaskStatus {
    Pending = 'Pending',
    Done = 'Done',
}

export enum RecurrenceFrequency {
    Daily = 'Daily',
    Weekly = 'Weekly',
    Monthly = 'Monthly',
}

export interface RecurrenceRule {
    frequency: RecurrenceFrequency;
}

export interface Task {
    id: string;
    title: string;
    category: TaskCategory;
    time: string;
    status: TaskStatus;
    date: string;
    reminder?: number;
    recurrence?: RecurrenceRule;
}

export enum Page {
    Dashboard = 'Dashboard',
    Analytics = 'Analytics',
    PrayerTimes = 'Prayer Times',
    Health = 'Health',
    Settings = 'Settings',
    About = 'About',
}

export interface PrayerTimes {
    Fajr: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
    [key: string]: string;
}

export interface PrayerSettings {
    autoFetch: boolean;
    city: string;
    country: string;
    juristic: 'Standard' | 'Hanafi';
    highLatitudeMethod: 'AngleBased' | 'MiddleOfTheNight' | 'OneSeventh';
    notifications: boolean;
    manualTimes: {
        [day: string]: Partial<PrayerTimes>
    };
    repeatWeekly: boolean;
}

export interface Notification {
    id: string;
    title: string;
    body: string;
    timestamp: number;
    read: boolean;
}

export type Theme = 'light' | 'dark' | 'high-contrast';

export interface HealthSettings {
    gym: { enabled: boolean; startTime: string; endTime: string; };
    sleep: { enabled: boolean; startTime: string; endTime: string; };
    lunch: { enabled: boolean; startTime: string; endTime: string; };
    dinner: { enabled: boolean; startTime: string; endTime: string; };
    quranRecitation: { enabled: boolean; duration: number; completionHistory: string[] };
    repeatDaily: boolean;
}