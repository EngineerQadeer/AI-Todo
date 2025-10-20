import React from 'react';
import type { Task } from '../types';
import { TaskStatus, TaskCategory } from '../types';
import { CheckCircleIcon, ClockIcon, RepeatIcon, PencilIcon, NextDayIcon, BellIcon } from './icons';

interface TaskCardProps {
  task: Task;
  onToggleStatus: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onRepeatTomorrow: (task: Task) => void;
}

const categoryColors: { [key in TaskCategory]: string } = {
  [TaskCategory.Work]: 'bg-blue-100 text-blue-800',
  [TaskCategory.Personal]: 'bg-green-100 text-green-800',
  [TaskCategory.Health]: 'bg-red-100 text-red-800',
  [TaskCategory.Finance]: 'bg-yellow-100 text-yellow-800',
  [TaskCategory.Home]: 'bg-purple-100 text-purple-800',
  [TaskCategory.Social]: 'bg-pink-100 text-pink-800',
  [TaskCategory.Other]: 'bg-gray-100 text-gray-800',
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggleStatus, onEdit, onRepeatTomorrow }) => {
  const isDone = task.status === TaskStatus.Done;

  return (
    <div className={`bg-base-100 rounded-xl shadow-md p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isDone ? 'opacity-60' : ''}`}>
      <div>
        <div className="flex justify-between items-start">
          <h3 className={`text-xl font-bold text-text-primary ${isDone ? 'line-through' : ''}`}>{task.title}</h3>
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${categoryColors[task.category]}`}>
            {task.category}
          </span>
        </div>
        <div className="flex items-center text-text-secondary mt-2">
          <ClockIcon className="w-5 h-5 mr-2" />
          <span>{task.time}</span>
        </div>
        {task.recurrence && (
          <div className="flex items-center text-indigo-600 mt-2 text-sm">
            <RepeatIcon className="w-4 h-4 mr-2" />
            <span>Repeats {task.recurrence.frequency}</span>
          </div>
        )}
        {task.reminder && (
          <div className="flex items-center text-text-secondary mt-2 text-sm">
            <BellIcon className="w-4 h-4 mr-2" />
            <span>Reminder: {task.reminder} mins before</span>
          </div>
        )}
      </div>
      <div className="mt-6 flex justify-end items-center space-x-2">
         <button
          onClick={() => onRepeatTomorrow(task)}
          title="Repeat Tomorrow"
          className="p-2 rounded-full text-text-secondary hover:bg-base-200 hover:text-primary transition-all duration-200 transform hover:scale-110"
        >
          <NextDayIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => onEdit(task)}
          className={`flex items-center px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-200 transform hover:scale-105 bg-base-200 text-text-secondary hover:bg-base-300 hover:text-text-primary`}
        >
          <PencilIcon className="w-4 h-4 mr-1" />
          Edit
        </button>
        <button
          onClick={() => onToggleStatus(task.id)}
          className={`flex items-center px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-200 transform hover:scale-105 ${
            isDone 
            ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500 hover:shadow-md'
            : 'bg-green-500 text-white hover:bg-green-600 hover:shadow-md'
          }`}
        >
          <CheckCircleIcon className="w-5 h-5 mr-2" />
          {isDone ? 'Undo' : 'Done'}
        </button>
      </div>
    </div>
  );
};

export default TaskCard;