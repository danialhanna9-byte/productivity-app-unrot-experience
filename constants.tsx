
import { AppState } from './types';

export const COLORS = {
  bg: '#F7F6F3',
  sidebar: '#FFFFFF',
  text: '#161617',
  muted: '#DAD9D4',
  border: '#EDECE9',
  hover: '#F1F0EC',
  accent: '#2383E2',
};

// Fixed: Added missing chatHistory property to satisfy AppState interface
export const INITIAL_DATA: AppState = {
  points: 0,
  pointHistory: [],
  tasks: [], // Empty as requested
  habits: [], // Empty as requested
  customCategories: ['Work', 'Health', 'Design', 'Finance', 'Personal'],
  chatHistory: [], // Added missing property to fix AppState assignment error
  rewards: [
    {
      id: 'r1',
      title: 'Gaming Time (30 Min)',
      cost: 15,
      description: 'Spend your points for guilt-free gaming.',
      icon: '🎮'
    },
    {
      id: 'r2',
      title: 'Coffee Treat',
      cost: 10,
      description: 'A special brew reward.',
      icon: '☕'
    }
  ],
  notes: [
    {
      id: 'n1',
      title: 'Getting Started',
      icon: '👋',
      createdAt: new Date().toISOString(),
      blocks: [
        { id: 'b1', type: 'h1' as any, content: 'Welcome to Unrot' },
        { id: 'b2', type: 'text' as any, content: 'This is your Notion-style productivity hub. Create tasks and habits to earn points.' }
      ]
    }
  ]
};
