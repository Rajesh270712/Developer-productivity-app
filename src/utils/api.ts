import { User, DailyLog, Team, Notification, Task, MoodType } from '../types';
import { getFromLocalStorage, saveToLocalStorage } from '../mocks/data';

// Mock API delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// User API
export const loginUser = async (email: string, password: string): Promise<User> => {
  await delay(500); // Simulate API delay
  
  const users = getFromLocalStorage('users') as User[];
  const user = users.find(u => u.email === email);
  
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  // In a real app, we would verify the password here
  // For demo purposes, any password is accepted
  
  return user;
};

export const getCurrentUser = (): User | null => {
  return getFromLocalStorage('currentUser');
};

export const logoutUser = (): void => {
  localStorage.removeItem('currentUser');
};

// Daily Log API
export const getDailyLogs = async (userId?: string): Promise<DailyLog[]> => {
  await delay(300);
  
  const logs = getFromLocalStorage('dailyLogs') as DailyLog[];
  
  if (userId) {
    return logs.filter(log => log.userId === userId);
  }
  
  return logs;
};

export const getDailyLog = async (logId: string): Promise<DailyLog | null> => {
  await delay(200);
  
  const logs = getFromLocalStorage('dailyLogs') as DailyLog[];
  return logs.find(log => log.id === logId) || null;
};

export const createDailyLog = async (logData: Omit<DailyLog, 'id' | 'createdAt' | 'updatedAt' | 'isReviewed' | 'reviewedBy' | 'reviewNotes'>): Promise<DailyLog> => {
  await delay(400);
  
  const logs = getFromLocalStorage('dailyLogs') as DailyLog[];
  
  const newLog: DailyLog = {
    ...logData,
    id: Math.random().toString(36).substring(2, 11),
    isReviewed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  logs.push(newLog);
  saveToLocalStorage('dailyLogs', logs);
  
  return newLog;
};

export const updateDailyLog = async (logId: string, updates: Partial<DailyLog>): Promise<DailyLog> => {
  await delay(300);
  
  const logs = getFromLocalStorage('dailyLogs') as DailyLog[];
  const index = logs.findIndex(log => log.id === logId);
  
  if (index === -1) {
    throw new Error('Log not found');
  }
  
  const updatedLog = {
    ...logs[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  logs[index] = updatedLog;
  saveToLocalStorage('dailyLogs', logs);
  
  return updatedLog;
};

export const deleteDailyLog = async (logId: string): Promise<void> => {
  await delay(300);
  
  const logs = getFromLocalStorage('dailyLogs') as DailyLog[];
  const filteredLogs = logs.filter(log => log.id !== logId);
  
  saveToLocalStorage('dailyLogs', filteredLogs);
};

// Team API
export const getTeams = async (): Promise<Team[]> => {
  await delay(300);
  
  return getFromLocalStorage('teams') as Team[];
};

export const getTeam = async (teamId: string): Promise<Team | null> => {
  await delay(200);
  
  const teams = getFromLocalStorage('teams') as Team[];
  return teams.find(team => team.id === teamId) || null;
};

export const getTeamMembers = async (teamId: string): Promise<User[]> => {
  await delay(300);
  
  const teams = getFromLocalStorage('teams') as Team[];
  const users = getFromLocalStorage('users') as User[];
  
  const team = teams.find(t => t.id === teamId);
  
  if (!team) {
    throw new Error('Team not found');
  }
  
  return users.filter(user => team.members.includes(user.id));
};

// Notification API
export const getNotifications = async (userId: string): Promise<Notification[]> => {
  await delay(200);
  
  const notifications = getFromLocalStorage('notifications') as Notification[];
  return notifications.filter(n => n.userId === userId);
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  await delay(100);
  
  const notifications = getFromLocalStorage('notifications') as Notification[];
  const index = notifications.findIndex(n => n.id === notificationId);
  
  if (index !== -1) {
    notifications[index].read = true;
    saveToLocalStorage('notifications', notifications);
  }
};

// Analytics API
export const getProductivityData = async (userId: string, startDate: string, endDate: string): Promise<any> => {
  await delay(500);
  
  const logs = getFromLocalStorage('dailyLogs') as DailyLog[];
  const userLogs = logs.filter(log => 
    log.userId === userId && 
    log.date >= startDate && 
    log.date <= endDate
  );
  
  return userLogs.map(log => {
    const completedTasks = log.tasks.filter(task => task.completed).length;
    const totalTimeSpent = log.tasks.reduce((total, task) => total + task.timeSpent, 0);
    
    return {
      date: log.date,
      tasksCompleted: completedTasks,
      totalTimeSpent,
      mood: log.mood
    };
  });
};

// Task API
export const getTasks = async (logId: string): Promise<Task[]> => {
  await delay(200);
  
  const logs = getFromLocalStorage('dailyLogs') as DailyLog[];
  const log = logs.find(l => l.id === logId);
  
  if (!log) {
    throw new Error('Log not found');
  }
  
  return log.tasks;
};

export const addTask = async (logId: string, task: Omit<Task, 'id'>): Promise<Task> => {
  await delay(300);
  
  const logs = getFromLocalStorage('dailyLogs') as DailyLog[];
  const index = logs.findIndex(l => l.id === logId);
  
  if (index === -1) {
    throw new Error('Log not found');
  }
  
  const newTask: Task = {
    ...task,
    id: Math.random().toString(36).substring(2, 11)
  };
  
  logs[index].tasks.push(newTask);
  logs[index].updatedAt = new Date().toISOString();
  
  saveToLocalStorage('dailyLogs', logs);
  
  return newTask;
};

export const updateTask = async (logId: string, taskId: string, updates: Partial<Task>): Promise<Task> => {
  await delay(200);
  
  const logs = getFromLocalStorage('dailyLogs') as DailyLog[];
  const logIndex = logs.findIndex(l => l.id === logId);
  
  if (logIndex === -1) {
    throw new Error('Log not found');
  }
  
  const taskIndex = logs[logIndex].tasks.findIndex(t => t.id === taskId);
  
  if (taskIndex === -1) {
    throw new Error('Task not found');
  }
  
  const updatedTask = {
    ...logs[logIndex].tasks[taskIndex],
    ...updates
  };
  
  logs[logIndex].tasks[taskIndex] = updatedTask;
  logs[logIndex].updatedAt = new Date().toISOString();
  
  saveToLocalStorage('dailyLogs', logs);
  
  return updatedTask;
};

export const deleteTask = async (logId: string, taskId: string): Promise<void> => {
  await delay(200);
  
  const logs = getFromLocalStorage('dailyLogs') as DailyLog[];
  const logIndex = logs.findIndex(l => l.id === logId);
  
  if (logIndex === -1) {
    throw new Error('Log not found');
  }
  
  logs[logIndex].tasks = logs[logIndex].tasks.filter(t => t.id !== taskId);
  logs[logIndex].updatedAt = new Date().toISOString();
  
  saveToLocalStorage('dailyLogs', logs);
};