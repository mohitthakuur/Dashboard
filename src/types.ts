export type UserRole = 'Admin' | 'Member';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: any;
  updatedAt: any;
}

export interface ProjectMember {
  id: string; // User UID
  role: UserRole;
  email: string;
  joinedAt: any;
}

export type TaskStatus = 'Todo' | 'In Progress' | 'Review' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  dueDate?: any;
  createdAt: any;
  updatedAt: any;
}
