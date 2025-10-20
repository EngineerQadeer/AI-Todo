import React from 'react';
import { Page } from '../types';
import { DashboardIcon, AnalyticsIcon, SettingsIcon, PlusIcon, MoonIcon, InfoIcon, HealthIcon } from './icons';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onAddTask: () => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: Page;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 text-left rounded-lg transition-all duration-300 transform hover:scale-105 ${
      isActive
        ? 'bg-primary text-white shadow-lg'
        : 'text-text-secondary hover:bg-base-300 hover:text-text-primary'
    }`}
  >
    {icon}
    <span className="ml-3 font-medium">{label}</span>
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, onAddTask }) => {
  return (
    <aside className="w-64 bg-base-100 p-6 flex flex-col shadow-lg text-text-primary">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-primary">Menu</h2>
      </div>
      <nav className="flex-1 space-y-2">
        <NavItem
          icon={<DashboardIcon className="w-6 h-6" />}
          label={Page.Dashboard}
          isActive={currentPage === Page.Dashboard}
          onClick={() => onNavigate(Page.Dashboard)}
        />
        <NavItem
          icon={<AnalyticsIcon className="w-6 h-6" />}
          label={Page.Analytics}
          isActive={currentPage === Page.Analytics}
          onClick={() => onNavigate(Page.Analytics)}
        />
        <NavItem
          icon={<MoonIcon className="w-6 h-6" />}
          label={Page.PrayerTimes}
          isActive={currentPage === Page.PrayerTimes}
          onClick={() => onNavigate(Page.PrayerTimes)}
        />
        <NavItem
          icon={<HealthIcon className="w-6 h-6" />}
          label={Page.Health}
          isActive={currentPage === Page.Health}
          onClick={() => onNavigate(Page.Health)}
        />
        <NavItem
          icon={<SettingsIcon className="w-6 h-6" />}
          label={Page.Settings}
          isActive={currentPage === Page.Settings}
          onClick={() => onNavigate(Page.Settings)}
        />
         <NavItem
          icon={<InfoIcon className="w-6 h-6" />}
          label={Page.About}
          isActive={currentPage === Page.About}
          onClick={() => onNavigate(Page.About)}
        />
      </nav>
      <div className="mt-auto">
        <button
          onClick={onAddTask}
          className="flex items-center justify-center w-full px-4 py-3 text-white bg-primary rounded-lg shadow-md hover:bg-indigo-700 transition-transform transform hover:scale-105 hover:shadow-lg"
        >
          <PlusIcon className="w-6 h-6" />
          <span className="ml-2 font-semibold">Add Task</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;