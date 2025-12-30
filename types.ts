
export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export enum TaskStatus {
  TODO = 'To-do',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done'
}

export enum BlockType {
  TEXT = 'text',
  H1 = 'h1',
  H2 = 'h2',
  H3 = 'h3',
  QUOTE = 'quote',
  CALLOUT = 'callout',
  DIVIDER = 'divider',
  CODE = 'code',
  CHECKBOX = 'checkbox',
  BULLET = 'bullet',
  NUMBERED = 'numbered'
}

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  difficulty: number;
  points: number; // Enforced 1-5
  dueDate: string;
  startTime?: string;
  category: string;
}

export interface Habit {
  id: string;
  title: string;
  streak: number;
  lastCompleted: string | null; 
  pointsPerDay: number; // Enforced 1-2
  frequency: 'Daily' | 'Weekly';
}

export interface Reward {
  id: string;
  title: string;
  cost: number;
  description: string;
  icon: string;
}

export interface Note {
  id: string;
  title: string;
  icon: string;
  blocks: Block[];
  parentId: string | null; 
  createdAt: string;
}

export interface PointTransaction {
  id: string;
  amount: number;
  type: 'earned' | 'spent';
  reason: string;
  date: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ScheduleTemplate {
  id: string;
  name: string;
  items: { title: string, startTime: string, category: string }[];
}

export interface AppState {
  tasks: Task[];
  habits: Habit[];
  rewards: Reward[];
  notes: Note[];
  points: number;
  pointHistory: PointTransaction[];
  customCategories: string[];
  chatHistory: ChatMessage[];
  referralUsed: boolean;
  templates: ScheduleTemplate[];
}

export interface AIScheduleItem {
  taskId: string;
  startTime: string; 
}
