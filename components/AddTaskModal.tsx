import React, { useState, useEffect } from 'react';
import type { Task, RecurrenceRule } from '../types';
import { TaskCategory, RecurrenceFrequency } from '../types';
import { generateTaskFromPrompt } from '../services/geminiService';
import { XIcon, SparklesIcon } from './icons';

interface AddTaskModalProps {
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'status' | 'date'> | Task) => void;
  taskToEdit?: Task;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ onClose, onSave, taskToEdit }) => {
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>(TaskCategory.Work);
  const [startTime, setStartTime] = useState(''); // HH:mm format
  const [endTime, setEndTime] = useState(''); // HH:mm format
  const [reminder, setReminder] = useState<number | undefined>(undefined);
  const [recurrence, setRecurrence] = useState<RecurrenceFrequency | 'none'>('none');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convertTo24Hour = (timeStr: string): string => {
    if (!timeStr) return '';
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return timeStr; // Return as is if not AM/PM, might be 24h already
    
    let [_, hours, minutes, ampm] = match;
    let hours24 = parseInt(hours, 10);

    if (ampm.toLowerCase() === 'pm' && hours24 < 12) {
      hours24 += 12;
    }
    if (ampm.toLowerCase() === 'am' && hours24 === 12) { // Midnight case
      hours24 = 0;
    }
    
    return `${String(hours24).padStart(2, '0')}:${minutes}`;
  };

  const convertToAmPm = (timeStr: string): string => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    if (!hours || !minutes) return '';
    const hoursNum = parseInt(hours, 10);
    const ampm = hoursNum >= 12 ? 'PM' : 'AM';
    let hours12 = hoursNum % 12;
    if (hours12 === 0) {
      hours12 = 12;
    }
    return `${String(hours12).padStart(2, '0')}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    if (taskToEdit) {
        setTitle(taskToEdit.title);
        setCategory(taskToEdit.category);
        
        const times = taskToEdit.time.split('–').map(t => t.trim());
        setStartTime(convertTo24Hour(times[0]));
        setEndTime(convertTo24Hour(times[1] || times[0]));

        setReminder(taskToEdit.reminder);
        setRecurrence(taskToEdit.recurrence?.frequency || 'none');
    }
  }, [taskToEdit]);
  
  const handleGenerateWithAI = async () => {
    if (!prompt) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateTaskFromPrompt(prompt);
      if (result) {
        setTitle(result.title);
        if (Object.values(TaskCategory).includes(result.category as TaskCategory)) {
          setCategory(result.category as TaskCategory);
        }
        setStartTime(convertTo24Hour(result.startTime));
        setEndTime(convertTo24Hour(result.endTime));
        setReminder(result.reminder);
        if (result.recurrence && Object.values(RecurrenceFrequency).includes(result.recurrence as RecurrenceFrequency)) {
            setRecurrence(result.recurrence as RecurrenceFrequency);
        } else {
            setRecurrence('none');
        }

      } else {
        setError("AI couldn't understand the request. Please try rephrasing or enter details manually.");
      }
    } catch (err) {
      setError("Failed to generate task with AI. Please check your API key and network connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startTime || !endTime) {
      setError("Title, start time, and end time are required.");
      return;
    }

    const startTimeAmPm = convertToAmPm(startTime);
    const endTimeAmPm = convertToAmPm(endTime);

    const timeString = startTimeAmPm === endTimeAmPm ? startTimeAmPm : `${startTimeAmPm} – ${endTimeAmPm}`;

    const recurrenceRule: RecurrenceRule | undefined = recurrence !== 'none'
      ? { frequency: recurrence }
      : undefined;

    const taskData = {
      title,
      category,
      time: timeString,
      reminder: reminder ? Number(reminder) : undefined,
      recurrence: recurrenceRule,
    };
    
    if (taskToEdit) {
        onSave({ ...taskToEdit, ...taskData });
    } else {
        onSave(taskData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-base-100 rounded-2xl shadow-xl p-8 w-full max-w-2xl transform transition-all text-text-primary">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{taskToEdit ? 'Edit Task' : 'Add a New Task'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-base-200">
            <XIcon className="w-6 h-6 text-text-secondary" />
          </button>
        </div>
        
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

        <div className="relative mb-4">
            <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your task and let AI handle the details..."
                className="w-full p-3 pr-40 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-base-100"
            />
            <button
                onClick={handleGenerateWithAI}
                disabled={isLoading || !prompt}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center px-4 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
                <SparklesIcon className="w-5 h-5 mr-2" />
                {isLoading ? 'Generating...' : 'Generate'}
            </button>
        </div>
        
        <div className="text-center my-4 text-text-secondary">OR</div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-text-secondary">Task Title</label>
            <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 w-full p-3 border border-gray-300 rounded-lg bg-base-100" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-text-secondary">Category</label>
              <select id="category" value={category} onChange={e => setCategory(e.target.value as TaskCategory)} className="mt-1 w-full p-3 border border-gray-300 rounded-lg bg-base-100">
                {Object.values(TaskCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="recurrence" className="block text-sm font-medium text-text-secondary">Recurrence</label>
              <select id="recurrence" value={recurrence} onChange={e => setRecurrence(e.target.value as RecurrenceFrequency | 'none')} className="mt-1 w-full p-3 border border-gray-300 rounded-lg bg-base-100">
                  <option value="none">None</option>
                  <option value={RecurrenceFrequency.Daily}>Daily</option>
                  <option value={RecurrenceFrequency.Weekly}>Weekly</option>
                  <option value={RecurrenceFrequency.Monthly}>Monthly</option>
              </select>
            </div>
             <div>
              <label htmlFor="reminder" className="block text-sm font-medium text-text-secondary">Reminder (minutes before)</label>
              <input type="number" id="reminder" value={reminder || ''} onChange={e => setReminder(e.target.value ? parseInt(e.target.value, 10) : undefined)} className="mt-1 w-full p-3 border border-gray-300 rounded-lg bg-base-100" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-text-secondary">Start Time</label>
                <input type="time" id="startTime" value={startTime} onChange={e => setStartTime(e.target.value)} required className="mt-1 w-full p-3 border border-gray-300 rounded-lg bg-base-100" />
            </div>
            <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-text-secondary">End Time</label>
                <input type="time" id="endTime" value={endTime} onChange={e => setEndTime(e.target.value)} required className="mt-1 w-full p-3 border border-gray-300 rounded-lg bg-base-100" />
            </div>
          </div>
          
          <div className="flex justify-end pt-4 space-x-4">
            <button type="button" onClick={onClose} className="px-6 py-2 text-text-primary bg-base-200 rounded-lg hover:bg-base-300">Cancel</button>
            <button type="submit" className="px-6 py-2 text-white bg-primary rounded-lg hover:bg-indigo-700">Save Task</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;
