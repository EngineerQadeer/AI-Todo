import React, { useRef } from 'react';
import type { PrayerSettings, Task, Theme, HealthSettings, Notification } from '../types';
import { DownloadIcon, UploadIcon } from './icons';

interface SettingsPanelProps {
    prayerSettings: PrayerSettings;
    healthSettings: HealthSettings;
    notifications: Notification[];
    onPrayerSettingsChange: (settings: PrayerSettings) => void;
    allTasks: Task[];
    onImportData: (data: { tasks: Task[], prayerSettings: PrayerSettings, healthSettings: HealthSettings, theme: Theme }) => void;
    currentTheme: Theme;
    onThemeChange: (theme: Theme) => void;
}

const prayerNames: (keyof PrayerSettings['manualTimes']['day'])[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const convertTo24Hour = (timeStr: string): string => {
    if (!timeStr) return '';
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return timeStr;
    
    let [_, hours, minutes, ampm] = match;
    let hours24 = parseInt(hours, 10);

    if (ampm.toLowerCase() === 'pm' && hours24 < 12) hours24 += 12;
    if (ampm.toLowerCase() === 'am' && hours24 === 12) hours24 = 0;
    
    return `${String(hours24).padStart(2, '0')}:${minutes}`;
};

const convertToAmPm = (timeStr: string): string => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    if (!hours || !minutes) return '';
    const hoursNum = parseInt(hours, 10);
    const ampm = hoursNum >= 12 ? 'PM' : 'AM';
    let hours12 = hoursNum % 12;
    if (hours12 === 0) hours12 = 12;
    return `${String(hours12).padStart(2, '0')}:${minutes} ${ampm}`;
};

const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
    prayerSettings, 
    healthSettings,
    notifications,
    onPrayerSettingsChange, 
    allTasks, 
    onImportData, 
    currentTheme, 
    onThemeChange 
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSettingsChange = (updatedSettings: Partial<PrayerSettings>) => {
        onPrayerSettingsChange({ ...prayerSettings, ...updatedSettings });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        handleSettingsChange({ [name]: value });
    };

    const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        handleSettingsChange({[name]: checked });
    };

     const handleManualTimeChange = (prayer: keyof PrayerSettings['manualTimes']['day'], time: string) => {
        const amPmTime = convertToAmPm(time);
        const newManualTimes = {
            ...prayerSettings.manualTimes,
            'Monday': {
                ...prayerSettings.manualTimes['Monday'],
                [prayer]: amPmTime,
            }
        };
        handleSettingsChange({ manualTimes: newManualTimes });
    };

    const handleExport = () => {
        const dataToExport = {
            tasks: allTasks,
            prayerSettings: prayerSettings,
            healthSettings: healthSettings,
            theme: currentTheme,
            notifications: notifications,
        };
        const dataStr = JSON.stringify(dataToExport, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        const date = new Date().toISOString().split('T')[0];
        link.download = `ai-planner-backup-${date}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const data = JSON.parse(text);
                if (data.tasks && data.prayerSettings && data.healthSettings && data.theme && Array.isArray(data.tasks)) {
                    onImportData(data);
                    alert('Data imported successfully!');
                } else {
                    throw new Error('Invalid or incomplete file format');
                }
            } catch (error) {
                console.error("Import failed:", error);
                alert('Import failed. Please check the file format.');
            }
        };
        reader.readAsText(file);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-text-primary mb-6">Settings</h2>
            <div className="bg-base-100 p-8 rounded-xl shadow-md max-w-4xl mx-auto space-y-10 text-text-primary">
                
                {/* Appearance Settings */}
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold border-b border-base-300 pb-2">Appearance</h3>
                    <div className="space-y-2">
                        <label className="text-lg font-medium">Theme</label>
                        <div className="flex space-x-4">
                            {(['light', 'dark', 'high-contrast'] as Theme[]).map(theme => (
                                <button key={theme} onClick={() => onThemeChange(theme)}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 border-2 ${currentTheme === theme ? 'border-primary bg-primary text-white' : 'border-base-300 hover:border-primary'}`}>
                                    {theme.charAt(0).toUpperCase() + theme.slice(1).replace('-', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Prayer Time Settings */}
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold border-b border-base-300 pb-2">Prayer Time Settings</h3>
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-medium">Auto Fetch Prayer Times</span>
                        <label htmlFor="autoFetch" className="flex items-center cursor-pointer">
                            <div className="relative">
                            <input type="checkbox" id="autoFetch" name="autoFetch" className="sr-only" checked={prayerSettings.autoFetch} onChange={handleToggleChange} />
                            <div className={`block ${prayerSettings.autoFetch ? 'bg-primary' : 'bg-gray-300'} w-14 h-8 rounded-full transition-colors`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${prayerSettings.autoFetch ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </div>
                        </label>
                    </div>
                    {prayerSettings.autoFetch ? (
                        <>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="city" className="block text-lg font-medium">City</label>
                                    <input type="text" id="city" name="city" value={prayerSettings.city} onChange={handleInputChange} className="mt-2 w-full p-3 border border-base-300 rounded-lg focus:ring-2 focus:ring-primary bg-base-200" />
                                </div>
                                <div>
                                    <label htmlFor="country" className="block text-lg font-medium">Country</label>
                                    <input type="text" id="country" name="country" value={prayerSettings.country} onChange={handleInputChange} className="mt-2 w-full p-3 border border-base-300 rounded-lg focus:ring-2 focus:ring-primary bg-base-200" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="juristic" className="block text-lg font-medium">Juristic School (for Asr)</label>
                                <select id="juristic" name="juristic" value={prayerSettings.juristic} onChange={handleInputChange} className="mt-2 w-full p-3 border border-base-300 rounded-lg bg-base-200 focus:ring-2 focus:ring-primary">
                                    <option value="Standard">Standard (Shafi, Maliki, Hanbali)</option>
                                    <option value="Hanafi">Hanafi</option>
                                </select>
                            </div>
                             <div>
                                <label htmlFor="highLatitudeMethod" className="block text-lg font-medium">Higher Latitude Adjustment</label>
                                <select id="highLatitudeMethod" name="highLatitudeMethod" value={prayerSettings.highLatitudeMethod} onChange={handleInputChange} className="mt-2 w-full p-3 border border-base-300 rounded-lg bg-base-200 focus:ring-2 focus:ring-primary">
                                    <option value="AngleBased">Angle Based</option>
                                    <option value="MiddleOfTheNight">Middle of the Night</option>
                                    <option value="OneSeventh">One Seventh</option>
                                </select>
                            </div>
                        </>
                    ) : (
                        <div>
                             <h4 className="text-lg font-semibold mb-4">Manual Configuration</h4>
                             <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label htmlFor="city-manual" className="block text-md font-medium">City</label>
                                    <input type="text" id="city-manual" name="city" value={prayerSettings.city} onChange={handleInputChange} className="mt-1 w-full p-3 border border-base-300 rounded-lg bg-base-200" />
                                </div>
                                <div>
                                    <label htmlFor="country-manual" className="block text-md font-medium">Country</label>
                                    <input type="text" id="country-manual" name="country" value={prayerSettings.country} onChange={handleInputChange} className="mt-1 w-full p-3 border border-base-300 rounded-lg bg-base-200" />
                                </div>
                            </div>
                             <p className="text-text-secondary mb-4">Set times for one day. Enable "Repeat Weekly" to use this schedule for the entire week.</p>
                             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                                {prayerNames.map(prayer => (
                                    <div key={prayer}>
                                        <label className="block text-sm font-medium">{prayer}</label>
                                        <input type="time" value={convertTo24Hour(prayerSettings.manualTimes['Monday']?.[prayer] || '')} onChange={(e) => handleManualTimeChange(prayer, e.target.value)} className="mt-1 w-full p-2 border border-base-300 rounded-lg bg-base-200" />
                                    </div>
                                ))}
                            </div>
                             <div className="flex items-center">
                                <input type="checkbox" id="repeatWeekly" name="repeatWeekly" checked={prayerSettings.repeatWeekly} onChange={handleToggleChange} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"/>
                                <label htmlFor="repeatWeekly" className="ml-2 block text-sm">Repeat this schedule for the entire week</label>
                            </div>
                        </div>
                    )}
                </div>

                 {/* Notification Settings */}
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold border-b border-base-300 pb-2">Notifications</h3>
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-medium">Enable Prayer Notifications (15 mins prior)</span>
                         <label htmlFor="notifications" className="flex items-center cursor-pointer">
                            <div className="relative">
                            <input type="checkbox" id="notifications" name="notifications" className="sr-only" checked={prayerSettings.notifications} onChange={handleToggleChange}/>
                            <div className={`block ${prayerSettings.notifications ? 'bg-primary' : 'bg-gray-300'} w-14 h-8 rounded-full transition-colors`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${prayerSettings.notifications ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Data Management */}
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold border-b border-base-300 pb-2">Data Management</h3>
                    <p className="text-text-secondary">Save your tasks and settings to a file, or restore them from a backup.</p>
                    <div className="flex space-x-4">
                        <button onClick={handleExport} className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                            <DownloadIcon className="w-5 h-5 mr-2" />
                            Export Data
                        </button>
                        <button onClick={() => fileInputRef.current?.click()} className="flex-1 flex items-center justify-center px-4 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors">
                            <UploadIcon className="w-5 h-5 mr-2" />
                            Import Data
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPanel;