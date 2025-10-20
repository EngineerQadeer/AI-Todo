import React, { useState, useMemo } from 'react';
import type { Task, HealthSettings } from '../types';
import TaskCard from './TaskCard';
import WorkableTime from './WorkableTime';
import TaskFilter from './TaskFilter';
import QuranTracker from './QuranTracker';
import { TaskStatus } from '../types';
import { parseTaskStartTime } from '../utils/time';

interface TaskListProps {
  tasks: Task[];
  healthSettings: HealthSettings;
  onToggleStatus: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onRepeatTaskTomorrow: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, healthSettings, onToggleStatus, onEditTask, onRepeatTaskTomorrow }) => {
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  
  const filteredAndSortedTasks = useMemo(() => {
    return tasks
      .filter(task => {
        const statusMatch = statusFilter === 'all' || task.status === statusFilter;
        return statusMatch;
      })
      .sort((a, b) => {
        // Rule 1: Completed tasks go to the bottom
        if (a.status === TaskStatus.Done && b.status !== TaskStatus.Done) return 1;
        if (a.status !== TaskStatus.Done && b.status === TaskStatus.Done) return -1;

        // Rule 2: For tasks with the same status, sort by time
        const timeA = parseTaskStartTime(a.time);
        const timeB = parseTaskStartTime(b.time);

        if (timeA && timeB) {
          return timeA.getTime() - timeB.getTime();
        }
        // Fallback for tasks without parseable times
        if (timeA) return -1;
        if (timeB) return 1;
        return 0;
      });
  }, [tasks, statusFilter]);

  return (
    <div className="space-y-8">
      <WorkableTime tasks={tasks} />
      
      {healthSettings.quranRecitation.enabled && (
        <QuranTracker healthSettings={healthSettings} />
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-text-primary">Today's Tasks</h2>
        <TaskFilter
          activeStatus={statusFilter}
          onStatusChange={setStatusFilter}
        />
      </div>

      {filteredAndSortedTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleStatus={onToggleStatus}
              onEdit={onEditTask}
              onRepeatTomorrow={onRepeatTaskTomorrow}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-base-100 rounded-xl shadow-md">
          <h3 className="text-2xl font-semibold text-text-primary">No tasks for today.</h3>
          <p className="text-text-secondary mt-2">Click "Add Task" to get started.</p>
        </div>
      )}
    </div>
  );
};

export default TaskList;