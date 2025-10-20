import React from 'react';
import type { Task } from '../types';
import { TaskCategory } from '../types';
import { calculateDurationInMinutes } from '../utils/time';
import { SparklesIcon, ClockIcon } from './icons';

interface WorkableTimeProps {
    tasks: Task[];
}

const WorkableTime: React.FC<WorkableTimeProps> = ({ tasks }) => {
    const committedMinutes = tasks
        .filter(task => 
            task.id.startsWith('prayer-') || 
            task.category === TaskCategory.Health
        )
        .reduce((total, task) => {
            return total + calculateDurationInMinutes(task.time);
        }, 0);

    const hours = Math.floor(committedMinutes / 60);
    const minutes = committedMinutes % 60;

    return (
        <div className="bg-base-100 p-6 rounded-xl shadow-md border-l-4 border-primary">
            <div className="flex items-center mb-3">
                <SparklesIcon className="w-6 h-6 text-primary mr-3" />
                <h3 className="text-xl font-bold text-text-primary">AI Time Analysis</h3>
            </div>
            <p className="text-text-secondary mb-4">
                Based on your prayer and health schedule, here is an overview of your committed time today.
            </p>
            <div className="flex items-center text-2xl font-semibold text-text-primary bg-base-200 p-4 rounded-lg">
                <ClockIcon className="w-8 h-8 text-primary mr-4" />
                <div>
                    <span>Total Committed Time: </span>
                    <span className="text-primary">{hours}</span>
                    <span> hours, </span>
                    <span className="text-primary">{minutes}</span>
                    <span> minutes</span>
                </div>
            </div>
             <p className="text-text-secondary text-sm mt-3">
                Plan your work and other tasks around these core commitments to maintain a balanced day.
            </p>
        </div>
    );
};

export default WorkableTime;