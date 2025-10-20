import React from 'react';
import type { PrayerTimes, PrayerSettings } from '../types';

interface PrayerTimesPanelProps {
    prayerTimes: PrayerTimes | null;
    prayerSettings: PrayerSettings;
}

const prayerNames: (keyof PrayerTimes)[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const PrayerTimesPanel: React.FC<PrayerTimesPanelProps> = ({ prayerTimes, prayerSettings }) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-text-primary">Prayer Times</h2>
            </div>

            <div className="bg-base-100 p-8 rounded-xl shadow-md text-text-primary">
                <div className="mb-4">
                    <h3 className="text-xl font-bold">
                        Today's Schedule for {prayerSettings.city}, {prayerSettings.country}
                        {!prayerSettings.autoFetch && <span className="text-sm font-normal text-text-secondary"> (Manual)</span>}
                    </h3>
                    <p className="text-text-secondary">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                {prayerTimes ? (
                    <div className="space-y-3">
                        {prayerNames.map(prayer => (
                            <div key={prayer} className="flex justify-between items-center p-4 bg-base-200 rounded-lg">
                                <span className="text-lg font-medium">{prayer}</span>
                                <span className="text-lg font-bold text-primary">{prayerTimes[prayer]}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-text-secondary">
                            {prayerSettings.autoFetch
                                ? "Could not fetch prayer times. Please check your location settings or network connection."
                                : "No manual prayer times set. Please configure them in the Settings page."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PrayerTimesPanel;