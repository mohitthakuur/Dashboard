import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp, 
  onSnapshot,
  setDoc
} from 'firebase/firestore';
import { db, auth, OperationType, handleFirestoreError } from './firebase';
import { Project, ProjectMember, Task, TaskStatus, TaskPriority } from '../types';

const PROJECTS_COLLECTION = 'projects';

export const projectService = {
  async createProject(name: string, description: string) {
    if (!auth.currentUser) throw new Error('Not authenticated');
    
    const path = PROJECTS_COLLECTION;
    try {
      const projectData = {
        name,
        description,
        ownerId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, path), projectData);
      
      // Add creator as Admin member
      await setDoc(doc(db, `${path}/${docRef.id}/members`, auth.currentUser.uid), {
        role: 'Admin',
        email: auth.currentUser.email,
        joinedAt: serverTimestamp()
      });

      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  getProjects(callback: (projects: Project[]) => void) {
    if (!auth.currentUser) return () => {};
    
    // In a real app with subcollection members, we might use a collectionGroup query
    // or store memberIds array on the project.
    // For this demo, let's assume we fetch projects where ownerId or we'll simplify 
    // by fetching all projects for now and let security rules or a better query handle it.
    // Actually, let's try to query projects where ownerId == current user.
    const q = query(collection(db, PROJECTS_COLLECTION), where('ownerId', '==', auth.currentUser.uid));
    
    return onSnapshot(q, (snapshot) => {
      const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      callback(projects);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, PROJECTS_COLLECTION);
    });
  },

  async getProject(projectId: string) {
    const path = `${PROJECTS_COLLECTION}/${projectId}`;
    try {
      const docSnap = await getDoc(doc(db, PROJECTS_COLLECTION, projectId));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Project;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  getTasks(projectId: string, callback: (tasks: Task[]) => void) {
    const path = `${PROJECTS_COLLECTION}/${projectId}/tasks`;
    const q = query(collection(db, path));
    
    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      callback(tasks);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  },

  async createTask(projectId: string, task: Partial<Task>) {
    const path = `${PROJECTS_COLLECTION}/${projectId}/tasks`;
    try {
      const taskData = {
        ...task,
        projectId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, path), taskData);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateTask(projectId: string, taskId: string, updates: Partial<Task>) {
    const path = `${PROJECTS_COLLECTION}/${projectId}/tasks/${taskId}`;
    try {
      await updateDoc(doc(db, path), {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  getMembers(projectId: string, callback: (members: ProjectMember[]) => void) {
    const path = `${PROJECTS_COLLECTION}/${projectId}/members`;
    return onSnapshot(collection(db, path), (snapshot) => {
      const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectMember));
      callback(members);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  }
};
