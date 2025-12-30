
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
  H4 = 'h4',
  H5 = 'h5',
  H6 = 'h6',
  CHECKBOX = 'checkbox',
  BULLET = 'bullet',
  NUMBERED = 'numbered',
  QUOTE = 'quote',
  CALLOUT = 'callout',
  DIVIDER = 'divider',
  CODE = 'code',
  MATH = 'math',
  TASK = 'task',
  TABLE = 'table',
  FOOTNOTE = 'footnote'
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
  points: number; 
  dueDate: string;
  startTime?: string;
  duration?: number;
  tags: string[];
  category: string;
}

export interface Habit {
  id: string;
  title: string;
  streak: number;
  lastCompleted: string | null; 
  pointsPerDay: number; 
  frequency: 'Daily' | 'Weekly';
  limitPerWeek?: number;
  completionsThisWeek?: number;
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
  parentId?: string | null; 
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

export interface AppState {
  tasks: Task[];
  habits: Habit[];
  rewards: Reward[];
  notes: Note[];
  points: number;
  pointHistory: PointTransaction[];
  customCategories: string[];
  chatHistory: ChatMessage[];
}

export interface AIScheduleItem {
  taskId: string;
  startTime: string; // "HH:00"
}
