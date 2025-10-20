import React, { useState, useEffect, useRef } from 'react';
import { BellIcon } from './icons';
import type { Notification } from '../types';
import NotificationDropdown from './NotificationDropdown';

interface HeaderProps {
    notifications: Notification[];
    onClearNotifications: () => void;
    onMarkNotificationsAsRead: () => void;
}

const Header: React.FC<HeaderProps> = ({ notifications, onClearNotifications, onMarkNotificationsAsRead }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
            setIsDropdownOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBellClick = () => {
    setIsDropdownOpen(prev => !prev);
    if (!isDropdownOpen) {
        onMarkNotificationsAsRead();
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  return (
    <header className="bg-base-100 shadow-sm p-4 border-b border-base-300 flex justify-between items-center text-text-primary">
      <div>
        <h1 className="text-2xl font-semibold">{`AI To-Do Planner`}</h1>
        <p className="text-sm text-text-secondary">{formatDate(currentTime)}</p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="font-medium">{formatTime(currentTime)}</p>
        </div>
        <div className="relative" ref={notificationRef}>
            <button 
                onClick={handleBellClick}
                className="relative p-2 rounded-full hover:bg-base-200 text-text-secondary hover:text-text-primary transition-colors"
                aria-label="Toggle notifications"
            >
              <BellIcon className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
                    {unreadCount}
                </span>
              )}
            </button>
            {isDropdownOpen && (
                <NotificationDropdown 
                    notifications={notifications}
                    onClear={onClearNotifications}
                />
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;