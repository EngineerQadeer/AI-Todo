import React from 'react';
import type { HealthSettings } from '../types';
import { CheckCircleIcon } from './icons';

interface QuranTrackerProps {
    healthSettings: HealthSettings;
}

const QuranTracker: React.FC<QuranTrackerProps> = ({ healthSettings }) => {
    const goal = 60; // 30 Para * 2 days/Para (approx) = 60 days
    const completedDays = healthSettings.quranRecitation.completionHistory?.length || 0;
    const progressPercentage = (completedDays / goal) * 100;

    if (!healthSettings.quranRecitation.enabled) {
        return null;
    }

    return (
        <div className="bg-base-100 p-6 rounded-xl shadow-md border-l-4 border-accent">
            <div className="flex items-center mb-3">
                <CheckCircleIcon className="w-6 h-6 text-accent mr-3" />
                <h3 className="text-xl font-bold text-text-primary">Quran Completion Tracker</h3>
            </div>
            <p className="text-text-secondary mb-4">
                Your goal is to complete the Quran in {goal} days. Keep up the great work!
            </p>
            
            <div className="space-y-2">
                <div className="flex justify-between font-semibold">
                    <span>Progress</span>
                    <span>Day {completedDays} / {goal}</span>
                </div>
                <div className="w-full bg-base-200 rounded-full h-4">
                    <div 
                        className="bg-accent h-4 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default QuranTracker;