import React from 'react';
import { TaskStatus } from '../types';

interface TaskFilterProps {
  activeStatus: TaskStatus | 'all';
  onStatusChange: (status: TaskStatus | 'all') => void;
}

const TaskFilter: React.FC<TaskFilterProps> = ({ activeStatus, onStatusChange }) => {
    return (
        <div className="flex items-center space-x-2">
            <label htmlFor="status-filter" className="text-sm font-medium text-text-secondary">Status:</label>
            <select
                id="status-filter"
                value={activeStatus}
                onChange={(e) => onStatusChange(e.target.value as TaskStatus | 'all')}
                className="bg-base-100 border border-base-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
            >
                <option value="all">All</option>
                <option value={TaskStatus.Pending}>Pending</option>
                <option value={TaskStatus.Done}>Done</option>
            </select>
        </div>
    );
};

export default TaskFilter;