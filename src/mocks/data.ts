import { User, Team, DailyLog, Notification, MoodType, Task } from '../types';

// Helper function to generate random ID
const generateId = () => Math.random().toString(36).substring(2, 11);

// Helper function to generate a random date within the last 30 days
const generateRandomDate = (daysAgo = 30) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date.toISOString();
};

// Generate random tasks
const generateTasks = (count: number): Task[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: generateId(),
    description: `Task ${i + 1} - ${['Fixed bug', 'Implemented feature', 'Refactored code', 'Wrote tests', 'Code review'][Math.floor(Math.random() * 5)]}`,
    timeSpent: Math.floor(Math.random() * 120) + 30, // 30-150 minutes
    tags: [
      ['frontend', 'bugfix', 'ui', 'performance', 'testing'][Math.floor(Math.random() * 5)],
      ['critical', 'important', 'normal', 'low-priority'][Math.floor(Math.random() * 4)]
    ],
    completed: Math.random() > 0.2, // 80% chance of being completed
  }));
};

// Mock Users
export const users: User[] = [
  {
    id: 'user1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    role: 'developer',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    teamId: 'team1'
  },
  {
    id: 'user2',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    role: 'developer',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
    teamId: 'team1'
  },
  {
    id: 'user3',
    name: 'Michael Rodriguez',
    email: 'michael@example.com',
    role: 'manager',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150',
    teamId: 'team1'
  },
  {
    id: 'user4',
    name: 'Lisa Taylor',
    email: 'lisa@example.com',
    role: 'developer',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
    teamId: 'team2'
  },
  {
    id: 'user5',
    name: 'David Williams',
    email: 'david@example.com',
    role: 'manager',
    avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=150',
    teamId: 'team2'
  }
];

// Mock Teams
export const teams: Team[] = [
  {
    id: 'team1',
    name: 'Frontend Team',
    managerId: 'user3',
    members: ['user1', 'user2']
  },
  {
    id: 'team2',
    name: 'Backend Team',
    managerId: 'user5',
    members: ['user4']
  }
];

// Mood options
const moods: MoodType[] = ['great', 'good', 'neutral', 'bad', 'terrible'];

// Mock Daily Logs
export const dailyLogs: DailyLog[] = Array.from({ length: 20 }, (_, i) => {
  const userId = users.filter(u => u.role === 'developer')[Math.floor(Math.random() * 3)].id;
  const date = generateRandomDate();
  const taskCount = Math.floor(Math.random() * 5) + 1;
  const isReviewed = Math.random() > 0.5;
  const managerId = users.find(u => u.role === 'manager')?.id;

  return {
    id: generateId(),
    userId,
    date: date.split('T')[0],
    tasks: generateTasks(taskCount),
    mood: moods[Math.floor(Math.random() * moods.length)],
    blockers: Math.random() > 0.7 ? 'Waiting for API documentation from the backend team.' : undefined,
    summary: 'Made progress on assigned tasks and collaborated with team members on integration issues.',
    isReviewed,
    reviewedBy: isReviewed ? managerId : undefined,
    reviewNotes: isReviewed ? 'Good progress, keep it up!' : undefined,
    createdAt: date,
    updatedAt: date
  };
});

// Mock Notifications
export const notifications: Notification[] = Array.from({ length: 10 }, (_, i) => {
  const types = ['reminder', 'submission', 'review', 'feedback'];
  const userId = users[Math.floor(Math.random() * users.length)].id;
  const type = types[Math.floor(Math.random() * types.length)] as 'reminder' | 'submission' | 'review' | 'feedback';
  
  let message = '';
  switch (type) {
    case 'reminder':
      message = 'Remember to submit your daily log before 10 PM today.';
      break;
    case 'submission':
      message = 'Alex Johnson has submitted their daily log.';
      break;
    case 'review':
      message = 'Your daily log has been reviewed by Michael Rodriguez.';
      break;
    case 'feedback':
      message = 'You received feedback on your daily log from June 15.';
      break;
  }

  return {
    id: generateId(),
    userId,
    message,
    read: Math.random() > 0.5,
    type,
    createdAt: generateRandomDate(7)
  };
});

// Local Storage Helpers
export const saveToLocalStorage = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const getFromLocalStorage = (key: string) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

// Initialize local storage with mock data if not exists
export const initializeLocalStorage = () => {
  if (!localStorage.getItem('users')) {
    saveToLocalStorage('users', users);
  }
  
  if (!localStorage.getItem('teams')) {
    saveToLocalStorage('teams', teams);
  }
  
  if (!localStorage.getItem('dailyLogs')) {
    saveToLocalStorage('dailyLogs', dailyLogs);
  }
  
  if (!localStorage.getItem('notifications')) {
    saveToLocalStorage('notifications', notifications);
  }
};