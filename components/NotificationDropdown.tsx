import React from 'react';
import type { Notification } from '../types';
import { TrashIcon, BellIcon } from './icons';

interface NotificationDropdownProps {
    notifications: Notification[];
    onClear: () => void;
}

const timeSince = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " mins ago";
    return Math.floor(seconds) + " secs ago";
};

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ notifications, onClear }) => {
    return (
        <div className="absolute right-0 mt-2 w-80 bg-base-100 rounded-lg shadow-xl border border-base-300 z-50">
            <div className="p-4 flex justify-between items-center border-b border-base-300">
                <h3 className="font-semibold text-text-primary">Notifications</h3>
                <button 
                    onClick={onClear} 
                    className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center"
                    disabled={notifications.length === 0}
                >
                    <TrashIcon className="w-4 h-4 mr-1"/>
                    Clear All
                </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                    notifications.map(n => (
                        <div key={n.id} className="p-4 border-b border-base-300 hover:bg-base-200">
                            <p className="font-semibold text-text-primary">{n.title}</p>
                            <p className="text-sm text-text-secondary">{n.body}</p>
                            <p className="text-xs text-text-secondary mt-1">{timeSince(n.timestamp)}</p>
                        </div>
                    ))
                ) : (
                    <div className="p-10 text-center text-text-secondary">
                        <BellIcon className="w-10 h-10 mx-auto mb-2"/>
                        <p>You have no notifications.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationDropdown;