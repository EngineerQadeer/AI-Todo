import React, { useState, useEffect } from 'react';
import type { HealthSettings } from '../types';

interface HealthPanelProps {
    settings: HealthSettings;
    onSave: (settings: HealthSettings) => void;
}

type Activity = keyof Omit<HealthSettings, 'repeatDaily' | 'quranRecitation'>;

const HealthActivity: React.FC<{
    activity: Activity;
    label: string;
    settings: HealthSettings[Activity];
    onToggle: () => void;
    onTimeChange: (type: 'startTime' | 'endTime', value: string) => void;
}> = ({ activity, label, settings, onToggle, onTimeChange }) => {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-base-300 rounded-lg">
            <span className="text-lg font-medium">{label}</span>
            <div className="flex items-center space-x-4 mt-2 sm:mt-0">
                <label htmlFor={`${activity}-enabled`} className="flex items-center cursor-pointer">
                    <div className="relative">
                        <input type="checkbox" id={`${activity}-enabled`} className="sr-only" checked={settings.enabled} onChange={onToggle} />
                        <div className={`block ${settings.enabled ? 'bg-primary' : 'bg-gray-300'} w-14 h-8 rounded-full transition-colors`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${settings.enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                </label>
                <div className={`flex items-center space-x-2 transition-opacity ${settings.enabled ? 'opacity-100' : 'opacity-50'}`}>
                    <input type="time" value={settings.startTime} onChange={e => onTimeChange('startTime', e.target.value)} disabled={!settings.enabled} className="p-2 border border-base-300 rounded-lg bg-base-200" />
                    <span>-</span>
                    <input type="time" value={settings.endTime} onChange={e => onTimeChange('endTime', e.target.value)} disabled={!settings.enabled} className="p-2 border border-base-300 rounded-lg bg-base-200" />
                </div>
            </div>
        </div>
    );
};


const HealthPanel: React.FC<HealthPanelProps> = ({ settings, onSave }) => {
    const [localSettings, setLocalSettings] = useState<HealthSettings>(settings);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const handleToggle = (activity: Activity) => {
        setLocalSettings(prev => ({
            ...prev,
            [activity]: { ...prev[activity], enabled: !prev[activity].enabled }
        }));
    };

    const handleTimeChange = (activity: Activity, type: 'startTime' | 'endTime', value: string) => {
        setLocalSettings(prev => ({
            ...prev,
            [activity]: { ...prev[activity], [type]: value }
        }));
    };
    
    const handleQuranToggle = () => {
        setLocalSettings(prev => ({
            ...prev,
            quranRecitation: { ...prev.quranRecitation, enabled: !prev.quranRecitation.enabled }
        }));
    };

    const handleQuranDurationChange = (duration: number) => {
        setLocalSettings(prev => ({
            ...prev,
            quranRecitation: { ...prev.quranRecitation, duration: duration > 0 ? duration : 30 }
        }));
    };

    const handleRepeatToggle = () => {
        setLocalSettings(prev => ({ ...prev, repeatDaily: !prev.repeatDaily }));
    };

    const handleSave = () => {
        onSave(localSettings);
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-text-primary mb-6">Health & Wellness</h2>
            <div className="bg-base-100 p-8 rounded-xl shadow-md max-w-4xl mx-auto space-y-10 text-text-primary">
                
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold border-b border-base-300 pb-2">Daily Activities</h3>
                    <p className="text-text-secondary">Enable and schedule your daily health activities. These will be automatically added to your task list.</p>
                    
                    <div className="space-y-4">
                        <HealthActivity
                            activity="gym"
                            label="Gym Session"
                            settings={localSettings.gym}
                            onToggle={() => handleToggle('gym')}
                            onTimeChange={(type, value) => handleTimeChange('gym', type, value)}
                        />
                         <HealthActivity
                            activity="lunch"
                            label="Lunch Break"
                            settings={localSettings.lunch}
                            onToggle={() => handleToggle('lunch')}
                            onTimeChange={(type, value) => handleTimeChange('lunch', type, value)}
                        />
                         <HealthActivity
                            activity="dinner"
                            label="Dinner"
                            settings={localSettings.dinner}
                            onToggle={() => handleToggle('dinner')}
                            onTimeChange={(type, value) => handleTimeChange('dinner', type, value)}
                        />
                        <HealthActivity
                            activity="sleep"
                            label="Sleep Time"
                            settings={localSettings.sleep}
                            onToggle={() => handleToggle('sleep')}
                            onTimeChange={(type, value) => handleTimeChange('sleep', type, value)}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-xl font-semibold border-b border-base-300 pb-2">Spiritual Wellness</h3>
                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-base-300 rounded-lg">
                        <span className="text-lg font-medium">Daily Quran Recitation</span>
                        <div className="flex items-center space-x-4 mt-2 sm:mt-0">
                             <label htmlFor="quran-enabled" className="flex items-center cursor-pointer">
                                <div className="relative">
                                    <input type="checkbox" id="quran-enabled" className="sr-only" checked={localSettings.quranRecitation.enabled} onChange={handleQuranToggle} />
                                    <div className={`block ${localSettings.quranRecitation.enabled ? 'bg-primary' : 'bg-gray-300'} w-14 h-8 rounded-full transition-colors`}></div>
                                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${localSettings.quranRecitation.enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </div>
                            </label>
                            <div className={`flex items-center space-x-2 transition-opacity ${localSettings.quranRecitation.enabled ? 'opacity-100' : 'opacity-50'}`}>
                                <input type="number" value={localSettings.quranRecitation.duration} onChange={e => handleQuranDurationChange(parseInt(e.target.value, 10))} disabled={!localSettings.quranRecitation.enabled} className="p-2 border border-base-300 rounded-lg bg-base-200 w-24" />
                                <span>minutes</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                     <h3 className="text-xl font-semibold border-b border-base-300 pb-2">Automation</h3>
                     <div className="flex items-center justify-between p-4 border border-base-300 rounded-lg">
                        <span className="text-lg font-medium">Repeat All Daily</span>
                         <label htmlFor="repeatDaily" className="flex items-center cursor-pointer">
                            <div className="relative">
                            <input type="checkbox" id="repeatDaily" className="sr-only" checked={localSettings.repeatDaily} onChange={handleRepeatToggle} />
                            <div className={`block ${localSettings.repeatDaily ? 'bg-primary' : 'bg-gray-300'} w-14 h-8 rounded-full transition-colors`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${localSettings.repeatDaily ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button onClick={handleSave} className="px-8 py-3 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
                        Save Health Plan
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HealthPanel;