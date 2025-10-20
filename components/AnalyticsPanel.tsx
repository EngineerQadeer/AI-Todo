import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import type { Task } from '../types';
import { TaskStatus, TaskCategory } from '../types';

interface AnalyticsPanelProps {
  tasks: Task[];
}

const COLORS = ['#10b981', '#ef4444']; // Green for Done, Red for Pending

const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ tasks }) => {
  const completedTasks = tasks.filter(t => t.status === TaskStatus.Done).length;
  const pendingTasks = tasks.filter(t => t.status === TaskStatus.Pending).length;

  const pieData = [
    { name: 'Completed', value: completedTasks },
    { name: 'Pending', value: pendingTasks },
  ];
  
  const categoryData = Object.values(TaskCategory).map(category => ({
    name: category,
    count: tasks.filter(t => t.category === category).length,
  }));
  
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return {
        date: d.toISOString().split('T')[0],
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
    };
  }).reverse();

  const productivityData = last7Days.map(({ date, day }) => ({
    day,
    tasks: tasks.filter(t => t.date === date && t.status === TaskStatus.Done).length,
  }));

  const mostFrequentCategory = categoryData.reduce((prev, current) => (prev.count > current.count) ? prev : current).name;
  const totalTasks = tasks.length;

  return (
    <div>
      <h2 className="text-3xl font-bold text-text-primary mb-6">Analytics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-base-100 p-6 rounded-xl shadow-md flex flex-col items-center">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Task Completion</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              {/* Fix: The `percent` prop from recharts can be undefined if the total value is 0. Using `?? 0` provides a safe default, preventing an arithmetic error on an undefined value. */}
              <Pie data={pieData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'var(--color-base-100)', color: 'var(--color-text-primary)' }}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-base-100 p-6 rounded-xl shadow-md text-center">
            <h3 className="text-lg font-semibold text-text-primary">Total Tasks</h3>
            <p className="text-5xl font-bold text-primary mt-4">{totalTasks}</p>
        </div>
        <div className="bg-base-100 p-6 rounded-xl shadow-md text-center">
            <h3 className="text-lg font-semibold text-text-primary">Most Frequent Category</h3>
            <p className="text-3xl font-bold text-accent mt-4">{totalTasks > 0 ? mostFrequentCategory : 'N/A'}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6">
         <div className="bg-base-100 p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Completed Tasks This Week</h3>
             <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--color-base-100)', color: 'var(--color-text-primary)' }}/>
                    <Legend />
                    <Bar dataKey="tasks" fill="var(--color-primary)" name="Completed Tasks" />
                </BarChart>
            </ResponsiveContainer>
         </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;