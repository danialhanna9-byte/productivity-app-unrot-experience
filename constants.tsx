
import { AppState, Priority } from './types';

export const COLORS = {
  bg: '#F7F6F3',
  sidebar: '#FFFFFF',
  text: '#161617',
  muted: '#DAD9D4',
  border: '#EDECE9',
  hover: '#F1F0EC',
  accent: '#2383E2',
};

export const INITIAL_DATA: AppState = {
  points: 0, // Requirements: Start with 0
  pointHistory: [],
  tasks: [], // Empty for user start
  habits: [], // Empty for user start
  customCategories: ['Work', 'Health', 'Design', 'Finance', 'Personal'],
  chatHistory: [],
  referralUsed: false,
  templates: [
    {
      id: 't1',
      name: 'Standard Workday',
      items: [
        { title: 'Morning Deep Work', startTime: '09:00', category: 'Work' },
        { title: 'Gym Session', startTime: '17:00', category: 'Health' }
      ]
    }
  ],
  rewards: [
    { id: 'r1', title: 'Gaming Time (30 Min)', cost: 15, description: 'Spend for guilt-free gaming.', icon: '🎮' },
    { id: 'r2', title: 'Coffee Treat', cost: 10, description: 'A special brew reward.', icon: '☕' }
  ],
  notes: [
    {
      id: 'root-1',
      title: 'Getting Started',
      icon: '👋',
      parentId: null,
      createdAt: new Date().toISOString(),
      blocks: [
        { id: 'b1', type: 'text' as any, content: 'Welcome to your hierarchical workspace.' }
      ]
    }
  ]
};
