import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TaskList from './components/TaskList';
import AddTaskModal from './components/AddTaskModal';
import AnalyticsPanel from './components/AnalyticsPanel';
import SettingsPanel from './components/SettingsPanel';
import PrayerTimesPanel from './components/PrayerTimesPanel';
import HealthPanel from './components/HealthPanel';
import AboutPanel from './components/AboutPanel';
import Toast from './components/Toast';
import { SAMPLE_TASKS } from './constants';
import type { Task, PrayerSettings, PrayerTimes, Notification, Theme, HealthSettings, RecurrenceRule } from './types';
import { Page, TaskStatus, TaskCategory, RecurrenceFrequency } from './types';
import { fetchPrayerTimes } from './services/prayerTimeService';
import { parseAmPmTime, createTimeRangeString, parseTimeRange, parseTaskStartTime, formatDateToAmPm } from './utils/time';
import { AppData, saveData, loadData } from './services/firestoreService';


const getTodaysDateString = () => new Date().toISOString().split('T')[0];

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

const App: React.FC = () => {
  const defaultPrayerSettings: PrayerSettings = {
    autoFetch: true,
    city: 'Minchinabad',
    country: 'Pakistan',
    juristic: 'Hanafi',
    highLatitudeMethod: 'AngleBased',
    notifications: true,
    manualTimes: {},
    repeatWeekly: false,
  };

  const defaultHealthSettings: HealthSettings = {
    gym: { enabled: false, startTime: '19:00', endTime: '20:00' },
    sleep: { enabled: false, startTime: '22:00', endTime: '06:00' },
    lunch: { enabled: false, startTime: '13:00', endTime: '13:30' },
    dinner: { enabled: false, startTime: '20:00', endTime: '20:30' },
    quranRecitation: { enabled: false, duration: 30, completionHistory: [] },
    repeatDaily: true,
  };

  const [tasks, setTasks] = useState<Task[]>(SAMPLE_TASKS);
  const [prayerSettings, setPrayerSettings] = useState<PrayerSettings>(defaultPrayerSettings);
  const [healthSettings, setHealthSettings] = useState<HealthSettings>(defaultHealthSettings);
  const [theme, setTheme] = useState<Theme>('light');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>(Page.Dashboard);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined);
  const [triggeredReminders, setTriggeredReminders] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string>('');
  const prayerNotificationTimers = useRef<number[]>([]);

  // --- Data Persistence ---
  // Load data from storage when the component mounts
  useEffect(() => {
    const data = loadData();

    if (data) {
        setTasks(data.tasks ?? SAMPLE_TASKS);
        setPrayerSettings(data.prayerSettings ?? defaultPrayerSettings);
        
        const loadedHealthSettings = data.healthSettings ?? defaultHealthSettings;
        if (!loadedHealthSettings.quranRecitation) {
            loadedHealthSettings.quranRecitation = defaultHealthSettings.quranRecitation;
        }
        setHealthSettings(loadedHealthSettings);
        
        setTheme(data.theme ?? 'light');
        setNotifications(data.notifications ?? []);
    }
  }, []); // This effect runs only once on mount

  // Save data to storage whenever it changes
  useEffect(() => {
    const appData: AppData = { tasks, prayerSettings, healthSettings, theme, notifications };
    saveData(appData);
  }, [tasks, prayerSettings, healthSettings, theme, notifications]); // This effect runs on any data change


  useEffect(() => {
    const body = document.body;
    body.classList.remove('theme-dark', 'theme-high-contrast');
    if (theme === 'dark') body.classList.add('theme-dark');
    if (theme === 'high-contrast') body.classList.add('theme-high-contrast');
  }, [theme]);


  useEffect(() => {
    const getPrayerTimes = async () => {
      if (prayerSettings.autoFetch && prayerSettings.city && prayerSettings.country) {
        const times = await fetchPrayerTimes(prayerSettings);
        setPrayerTimes(times);
      } else {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        let manual;
        if (prayerSettings.repeatWeekly) {
            manual = prayerSettings.manualTimes['Monday'] || prayerSettings.manualTimes[Object.keys(prayerSettings.manualTimes)[0]];
        } else {
            manual = prayerSettings.manualTimes[today];
        }
        
        if (manual && Object.keys(manual).length >= 5) {
            setPrayerTimes(manual as PrayerTimes);
        } else {
            setPrayerTimes(null);
        }
      }
    };
    getPrayerTimes();
  }, [prayerSettings]);

   useEffect(() => {
    const todayStr = getTodaysDateString();
    if (prayerTimes) {
        const prayerTaskUpdates: Task[] = Object.entries(prayerTimes).map(([name, time]) => {
            const taskId = `prayer-${name.toLowerCase()}`;
            const existingTask = tasks.find(t => t.id === taskId && t.date === todayStr);

            const prayerStartTime = parseAmPmTime(time as string);
            const timeString = prayerStartTime ? createTimeRangeString(prayerStartTime, 30) : (time as string);

            return {
                id: taskId,
                title: `${name} Prayer`,
                category: TaskCategory.Personal,
                time: timeString,
                status: existingTask ? existingTask.status : TaskStatus.Pending,
                date: todayStr,
                reminder: 15, // Auto set 15 min reminder
            };
        });

        setTasks(currentTasks => {
            const nonPrayerTasks = currentTasks.filter(task => !task.id.startsWith('prayer-') || task.date !== todayStr);
            const todaysTasks = [...nonPrayerTasks, ...prayerTaskUpdates].filter(t => t.date === todayStr);
            const otherDaysTasks = currentTasks.filter(t => t.date !== todayStr);
            
            return [...otherDaysTasks, ...todaysTasks.sort((a, b) => {
                const timeA = parseTaskStartTime(a.time);
                const timeB = parseTaskStartTime(b.time);
                if (!timeA || !timeB) return 0;
                return timeA.getTime() - timeB.getTime();
            })];
        });
    } else {
        setTasks(currentTasks => currentTasks.filter(task => !task.id.startsWith('prayer-') || task.date !== todayStr));
    }
   }, [prayerTimes]);
   
   useEffect(() => {
        const todayStr = getTodaysDateString();
        const quranSetting = healthSettings.quranRecitation;

        const quranTaskId = 'health-quran-recitation';

        if (quranSetting?.enabled && prayerTimes?.Fajr) {
            const fajrTime = parseAmPmTime(prayerTimes.Fajr);
            if (fajrTime) {
                const duration = quranSetting.duration || 30;
                const endTime = fajrTime;
                const startTime = new Date(endTime.getTime() - duration * 60 * 1000);
                
                const quranTask: Task = {
                    id: quranTaskId,
                    title: 'Daily Quran Recitation',
                    category: TaskCategory.Health,
                    time: `${formatDateToAmPm(startTime)} – ${formatDateToAmPm(endTime)}`,
                    status: TaskStatus.Pending,
                    date: todayStr,
                    recurrence: { frequency: RecurrenceFrequency.Daily },
                };

                setTasks(currentTasks => {
                    const otherTasks = currentTasks.filter(t => t.id !== quranTask.id || t.date !== todayStr);
                    const existingTask = currentTasks.find(t => t.id === quranTask.id && t.date === todayStr);
                    if(existingTask) {
                        quranTask.status = existingTask.status;
                        quranTask.time = existingTask.time; // Keep existing time if it was manually edited
                    }
                    return [...otherTasks, quranTask];
                });
            }
        } else {
            // Remove the task for today if setting is disabled
            setTasks(currentTasks => currentTasks.filter(t => t.id !== quranTaskId || t.date !== todayStr));
        }
    }, [healthSettings.quranRecitation, prayerTimes]);


  useEffect(() => {
    if ('Notification' in window && window.Notification.permission !== 'granted' && window.Notification.permission !== 'denied') {
        window.Notification.requestPermission();
    }
  }, []);
  
  const createNotification = (title: string, body: string) => {
    if(window.Notification.permission === 'granted') {
      new window.Notification(title, { body, icon: '/vite.svg' });
    }
    setNotifications(prev => [
        { id: `${Date.now()}`, title, body, timestamp: Date.now(), read: false },
        ...prev
    ]);
  };
  
  useEffect(() => {
    const checkReminders = () => {
        const now = new Date();
        tasks.forEach(task => {
            if (task.status === TaskStatus.Pending && task.reminder && !triggeredReminders.has(task.id) && task.date === getTodaysDateString()) {
                const taskStartTime = parseTaskStartTime(task.time);
                if (taskStartTime) {
                    const reminderTime = new Date(taskStartTime.getTime() - task.reminder * 60 * 1000);
                    
                    if (now >= reminderTime && now < taskStartTime) {
                        createNotification('Task Reminder', `${task.title} is starting in ${task.reminder} minutes.`);
                        setTriggeredReminders(prev => new Set(prev).add(task.id));
                    }
                }
            }
        });
    };

    const intervalId = setInterval(checkReminders, 60 * 1000);
    return () => clearInterval(intervalId);
  }, [tasks, triggeredReminders]);

  useEffect(() => {
    const autoCompletePrayers = () => {
        if (!prayerTimes) return;
        const now = new Date();
        const todayStr = getTodaysDateString();

        tasks.forEach(task => {
            if (task.id.startsWith('prayer-') && task.status === TaskStatus.Pending && task.date === todayStr) {
                const prayerTime = parseTaskStartTime(task.time);
                if (prayerTime) {
                    const autoCompleteTime = new Date(prayerTime.getTime() + 20 * 60 * 1000); // 20 minutes after
                    if (now > autoCompleteTime) {
                        toggleTaskStatus(task.id);
                        console.log(`Auto-completed ${task.title}`);
                    }
                }
            }
        });
    };

    const intervalId = setInterval(autoCompletePrayers, 60 * 1000 * 5);
    autoCompletePrayers();

    return () => clearInterval(intervalId);

  }, [tasks, prayerTimes]);

  useEffect(() => {
    prayerNotificationTimers.current.forEach(clearTimeout);
    prayerNotificationTimers.current = [];

    if (prayerTimes && prayerSettings.notifications && window.Notification.permission === 'granted') {
      const now = new Date();
      Object.entries(prayerTimes).forEach(([name, timeStr]) => {
        const prayerTime = parseAmPmTime(timeStr as string);
        if (prayerTime) {
          const reminderTime = new Date(prayerTime.getTime() - 15 * 60 * 1000);
          
          if (reminderTime > now) {
            const timeout = reminderTime.getTime() - now.getTime();
            const timerId = setTimeout(() => {
              createNotification('Prayer Time Reminder', `${name} prayer is in 15 minutes.`);
            }, timeout);
            prayerNotificationTimers.current.push(timerId as unknown as number);
          }
        }
      });
    }

    return () => {
      prayerNotificationTimers.current.forEach(clearTimeout);
    };
  }, [prayerTimes, prayerSettings.notifications]);


  const handleOpenEditModal = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTaskToEdit(undefined);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'status' | 'date'> | Task) => {
    const isEditing = 'id' in taskData && taskData.id;
    const taskDateStr = isEditing ? taskData.date : getTodaysDateString();
    
    // Time conflict check
    const newRange = parseTimeRange((taskData as Task).time, new Date(taskDateStr.replace(/-/g, '/')));
    if (!newRange) {
        console.error("Invalid time format for new task");
        return;
    }

    const tasksForDate = tasks.filter(t => t.date === taskDateStr);
    for (const existingTask of tasksForDate) {
        if (isEditing && existingTask.id === taskData.id) continue;

        const existingRange = parseTimeRange(existingTask.time, new Date(taskDateStr.replace(/-/g, '/')));
        if (existingRange) {
            if (newRange.start < existingRange.end && newRange.end > existingRange.start) {
                alert(`Time conflict detected with task: "${existingTask.title}" (${existingTask.time}). Please choose a different time.`);
                return;
            }
        }
    }

    if (isEditing) {
        setTasks(currentTasks => currentTasks.map(t => t.id === (taskData as Task).id ? { ...t, ...taskData } as Task : t));
    } else {
        const newTask: Task = {
            ...(taskData as Omit<Task, 'id' | 'status' | 'date'>),
            id: `${Date.now()}`,
            status: TaskStatus.Pending,
            date: getTodaysDateString(),
        };
        setTasks(prevTasks => [...prevTasks, newTask]);
    }
    handleCloseModal();
  };

  const handleRepeatTaskTomorrow = (task: Task) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const newTask: Task = {
        ...task,
        id: `${Date.now()}`,
        status: TaskStatus.Pending,
        date: tomorrowStr,
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
    setToastMessage(`"${task.title}" has been scheduled for tomorrow.`);
  };

  const handleImportData = (data: { tasks: Task[], prayerSettings: PrayerSettings, healthSettings: HealthSettings, theme: Theme }) => {
    setTasks(data.tasks);
    setPrayerSettings(data.prayerSettings);
    setHealthSettings(data.healthSettings);
    setTheme(data.theme);
  };

  const handleSaveHealthSettings = (newSettings: HealthSettings) => {
    setHealthSettings(newSettings);

    const todayStr = getTodaysDateString();
    
    const healthTasksToAdd: Task[] = [];
    
    const createHealthTask = (id: string, title: string, setting: { enabled: boolean, startTime: string, endTime: string }) => {
        if (setting.enabled) {
            const startTimeAmPm = convertToAmPm(setting.startTime);
            const endTimeAmPm = convertToAmPm(setting.endTime);
            const timeString = `${startTimeAmPm} – ${endTimeAmPm}`;
            
            const recurrenceRule: RecurrenceRule | undefined = newSettings.repeatDaily 
                ? { frequency: RecurrenceFrequency.Daily } 
                : undefined;
            
            healthTasksToAdd.push({
                id: `health-${id}`, // Use a consistent ID to prevent duplicates
                title: title,
                category: TaskCategory.Health,
                time: timeString,
                status: TaskStatus.Pending,
                date: todayStr,
                recurrence: recurrenceRule,
            });
        }
    };
    
    createHealthTask('gym', 'Gym Session', newSettings.gym);
    createHealthTask('sleep', 'Sleep', newSettings.sleep);
    createHealthTask('lunch', 'Lunch Break', newSettings.lunch);
    createHealthTask('dinner', 'Dinner', newSettings.dinner);

    setTasks(currentTasks => {
        // Remove existing health tasks for today before adding new ones
        const todaysNonHealthTasks = currentTasks.filter(t => t.date === todayStr && !t.id.startsWith('health-'));
        const otherDaysTasks = currentTasks.filter(t => t.date !== todayStr);
        return [...otherDaysTasks, ...todaysNonHealthTasks, ...healthTasksToAdd];
    });

    setToastMessage("Health plan updated! Tasks have been added for today.");
  };

  const toggleTaskStatus = (taskId: string) => {
    setTasks(currentTasks => 
        currentTasks.map(task => {
            if (task.id === taskId) {
                const newStatus = task.status === TaskStatus.Done ? TaskStatus.Pending : TaskStatus.Done;
                if (newStatus === TaskStatus.Pending) {
                    setTriggeredReminders(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(taskId);
                        return newSet;
                    });
                }
                
                if (taskId === 'health-quran-recitation') {
                    const todayStr = getTodaysDateString();
                    setHealthSettings(prev => {
                        const history = prev.quranRecitation.completionHistory || [];
                        let newHistory;
                        if (newStatus === TaskStatus.Done) {
                            newHistory = [...new Set([...history, todayStr])];
                        } else {
                            newHistory = history.filter(d => d !== todayStr);
                        }
                        return {
                            ...prev,
                            quranRecitation: {
                                ...prev.quranRecitation,
                                completionHistory: newHistory,
                            }
                        };
                    });
                }

                return { ...task, status: newStatus };
            }
            return task;
        })
    );
  };

  const handleClearNotifications = () => setNotifications([]);
  const handleMarkNotificationsAsRead = () => {
      setNotifications(prev => prev.map(n => ({...n, read: true})))
  };

  const renderContent = () => {
    const todaysTasks = tasks.filter(task => task.date === getTodaysDateString());
    switch (currentPage) {
      case Page.Dashboard:
        return <TaskList 
                    tasks={todaysTasks} 
                    healthSettings={healthSettings}
                    onToggleStatus={toggleTaskStatus} 
                    onEditTask={handleOpenEditModal} 
                    onRepeatTaskTomorrow={handleRepeatTaskTomorrow}
                />;
      case Page.Analytics:
        return <AnalyticsPanel tasks={tasks} />;
      case Page.PrayerTimes:
        return <PrayerTimesPanel prayerTimes={prayerTimes} prayerSettings={prayerSettings} />;
       case Page.Health:
        return <HealthPanel settings={healthSettings} onSave={handleSaveHealthSettings} />;
      case Page.Settings:
        return <SettingsPanel 
                    prayerSettings={prayerSettings}
                    healthSettings={healthSettings}
                    notifications={notifications}
                    onPrayerSettingsChange={setPrayerSettings} 
                    allTasks={tasks}
                    onImportData={handleImportData}
                    currentTheme={theme}
                    onThemeChange={setTheme}
                />;
      case Page.About:
        return <AboutPanel />;
      default:
        return <TaskList 
                    tasks={todaysTasks} 
                    healthSettings={healthSettings}
                    onToggleStatus={toggleTaskStatus} 
                    onEditTask={handleOpenEditModal} 
                    onRepeatTaskTomorrow={handleRepeatTaskTomorrow}
                />;
    }
  };

  return (
    <div className="flex h-screen bg-secondary font-sans">
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
        onAddTask={() => setIsModalOpen(true)} 
      />
      <div className="flex-1 flex flex-col">
        <Header notifications={notifications} onClearNotifications={handleClearNotifications} onMarkNotificationsAsRead={handleMarkNotificationsAsRead}/>
        <main className="flex-1 p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
      {isModalOpen && (
        <AddTaskModal 
          onClose={handleCloseModal} 
          onSave={handleSaveTask} 
          taskToEdit={taskToEdit} 
        />
      )}
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
    </div>
  );
};

export default App;
