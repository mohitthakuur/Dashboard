import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  MoreVertical, 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  UserPlus,
  ArrowLeft,
  X,
  Target
} from 'lucide-react';
import { auth } from '../services/firebase';
import { projectService } from '../services/projectService';
import { Project, Task, TaskStatus, TaskPriority, ProjectMember, UserRole } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export function ProjectView() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  
  // Task form state
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    status: 'Todo',
    priority: 'Medium'
  });

  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    if (!projectId || !auth.currentUser) return;

    const fetchProject = async () => {
      const p = await projectService.getProject(projectId);
      if (p) setProject(p);
      else navigate('/projects');
    };

    fetchProject();

    const unsubTasks = projectService.getTasks(projectId, (t) => {
      setTasks(t);
      setLoading(false);
    });

    const unsubMembers = projectService.getMembers(projectId, (m) => {
      setMembers(m);
      const currentMember = m.find(member => member.id === auth.currentUser?.uid);
      if (currentMember) setUserRole(currentMember.role);
    });

    return () => {
      if (typeof unsubTasks === 'function') unsubTasks();
      if (typeof unsubMembers === 'function') unsubMembers();
    };
  }, [projectId, navigate]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !newTask.title?.trim()) return;

    try {
      await projectService.createTask(projectId, newTask);
      setIsTaskModalOpen(false);
      setNewTask({ title: '', description: '', status: 'Todo', priority: 'Medium' });
    } catch (error) {
      console.error(error);
    }
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    if (!projectId) return;
    try {
      await projectService.updateTask(projectId, taskId, { status });
    } catch (error) {
      console.error(error);
    }
  };

  const statuses: TaskStatus[] = ['Todo', 'In Progress', 'Review', 'Done'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-medium">Loading project details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/projects')}
            className="p-2 text-slate-400 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-white transition-all shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{project?.name}</h1>
              {userRole && (
                <span className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest",
                  userRole === 'Admin' ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-600"
                )}>
                  {userRole}
                </span>
              )}
            </div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{project?.description || 'Product Development & Strategy'}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2 mr-2">
              {members.map((m) => (
                <div 
                  key={m.id} 
                  title={m.email}
                  className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600 ring-1 ring-slate-100 shadow-sm"
                >
                  {m.email.substring(0, 1).toUpperCase()}
                </div>
              ))}
              <button className="w-8 h-8 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors shadow-sm">
                <Plus size={14} />
              </button>
            </div>
            <div className="h-4 w-px bg-slate-200 mx-2"></div>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setViewMode('board')}
                className={cn("p-1.5 rounded-lg transition-all", viewMode === 'board' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={cn("p-1.5 rounded-lg transition-all", viewMode === 'list' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}
              >
                <List size={18} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsTaskModalOpen(true)}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-6 rounded-lg transition-all shadow-sm"
            >
              <Plus size={18} />
              Add Task
            </button>
            <button className="p-2.5 text-slate-500 border border-slate-200 rounded-lg hover:bg-white transition-all shadow-sm">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>
      </header>

      {viewMode === 'board' ? (
        <div className="flex gap-6 overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide">
          {statuses.map((status) => (
            <div key={status} className="shrink-0 w-80 space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  {status}
                  <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-md">
                    {tasks.filter(t => t.status === status).length}
                  </span>
                </h3>
                <button className="p-1 text-slate-400 hover:text-slate-900"><MoreVertical size={16} /></button>
              </div>

              <div className="space-y-4 min-h-[400px]">
                {tasks.filter(t => t.status === status).map((task) => (
                  <div key={task.id}>
                    <TaskCard task={task} />
                  </div>
                ))}
                
                <button 
                  onClick={() => {
                    setNewTask(n => ({ ...n, status }));
                    setIsTaskModalOpen(true);
                  }}
                  className="w-full py-3 border border-dashed border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 hover:border-slate-400 hover:bg-white transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest"
                >
                  <Plus size={16} />
                  Add Task
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm font-medium">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                <th className="px-6 py-4">Task Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.map(task => (
                <tr key={task.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded border-2 border-slate-200 group-hover:border-slate-900 transition-colors"></div>
                      <span className="font-bold text-slate-900 line-clamp-1">{task.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest shadow-sm",
                      task.status === 'Done' ? "bg-emerald-50 text-emerald-700" :
                      task.status === 'In Progress' ? "bg-indigo-50 text-indigo-700" :
                      task.status === 'Review' ? "bg-amber-50 text-amber-700" :
                      "bg-slate-100 text-slate-500"
                    )}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                    {task.priority || 'Medium'}
                  </td>
                  <td className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Task Modal */}
      <AnimatePresence>
        {isTaskModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTaskModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">New Task</h2>
                <button 
                  onClick={() => setIsTaskModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2">Title</label>
                  <input 
                    autoFocus
                    required
                    value={newTask.title}
                    onChange={e => setNewTask(n => ({ ...n, title: e.target.value }))}
                    type="text" 
                    placeholder="Task details..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:bg-white focus:border-slate-900 outline-none transition-all text-sm font-medium"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2">Status</label>
                    <select 
                      value={newTask.status}
                      onChange={e => setNewTask(n => ({ ...n, status: e.target.value as TaskStatus }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:bg-white focus:border-slate-900 outline-none transition-all text-sm font-bold appearance-none uppercase tracking-widest"
                    >
                      {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2">Priority</label>
                    <select 
                      value={newTask.priority}
                      onChange={e => setNewTask(n => ({ ...n, priority: e.target.value as TaskPriority }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:bg-white focus:border-slate-900 outline-none transition-all text-sm font-bold appearance-none uppercase tracking-widest"
                    >
                      {['Low', 'Medium', 'High', 'Critical'].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2">Description</label>
                  <textarea 
                    value={newTask.description}
                    onChange={e => setNewTask(n => ({ ...n, description: e.target.value }))}
                    rows={4}
                    placeholder="Context and notes..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:bg-white focus:border-slate-900 outline-none transition-all text-sm font-medium resize-none"
                  />
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <button 
                    type="submit"
                    className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition-all shadow-md"
                  >
                    Create Task
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsTaskModalOpen(false)}
                    className="w-full py-3 rounded-lg text-slate-500 font-bold hover:bg-slate-100 transition-all text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-400 transition-all flex flex-col gap-3 cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start justify-between">
        <label className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-5 h-5 rounded border-2 border-slate-200 group-hover:border-slate-300 transition-colors shrink-0"></div>
          <h4 className="text-sm font-bold text-slate-900 transition-colors uppercase tracking-tight leading-snug line-clamp-2">
            {task.title}
          </h4>
        </label>
        <button className="text-slate-300 hover:text-slate-900 p-1">
          <MoreVertical size={14} />
        </button>
      </div>
      
      {task.description && (
        <p className="text-[11px] text-slate-400 font-medium leading-relaxed ml-8 line-clamp-2 uppercase tracking-wide">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-100">
        <div className={cn(
          "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest",
          task.priority === 'Critical' ? "bg-rose-50 text-rose-700" :
          task.priority === 'High' ? "bg-amber-50 text-amber-700" :
          task.priority === 'Medium' ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-500"
        )}>
          {task.priority || 'Medium'}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{task.dueDate ? format(new Date(task.dueDate), 'MMM d') : 'Active'}</span>
          <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center text-[10px] font-extrabold text-white">
             {auth.currentUser?.email?.substring(0, 1).toUpperCase()}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
