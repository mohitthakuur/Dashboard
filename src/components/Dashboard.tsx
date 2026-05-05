import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, ListTodo, AlertCircle, TrendingUp, Calendar } from 'lucide-react';
import { projectService } from '../services/projectService';
import { Project, Task } from '../types';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = projectService.getProjects((projs) => {
      setProjects(projs);
      // For simplicity in this demo, we'll just show project count correctly
      // Tasks would need a cross-project query or sequential fetch
      setLoading(false);
    });
    return unsub;
  }, []);

  const stats = [
    { label: 'Active Projects', value: projects.length, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Tasks Pending', value: 12, icon: ListTodo, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Completed', value: 45, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Overdue', value: 2, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Welcome back!</h1>
        <p className="text-slate-500 mt-1">Here's what's happening with your projects today.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1"
          >
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">{stat.label}</div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</div>
              <stat.icon size={20} className={stat.color} />
            </div>
            <div className="text-[10px] text-slate-400 mt-2 font-medium">Updated just now</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight uppercase tracking-widest">Active Tasks</h2>
              <button className="text-xs text-slate-400 font-bold hover:text-slate-900 transition-colors uppercase tracking-widest">View all</button>
            </div>
            
            <div className="space-y-3">
              {[
                { title: 'Finalize RBAC Middleware', type: 'Backend • API Security', priority: 'High', date: 'Today' },
                { title: 'User Acceptance Testing (Phase 1)', type: 'QA • Frontend', priority: 'Med', date: 'Jun 14' },
                { title: 'Refactor Railway Deployment Script', type: 'DevOps • Automation', priority: 'Low', date: 'Jun 16' },
                { title: 'SQL Database Migration Strategy', type: 'Backend • Persistence', priority: 'High', date: 'Tomorrow' }
              ].map((task, i) => (
                <div key={i} className="bg-white border border-slate-200 p-4 rounded-xl flex items-center gap-4 group hover:border-slate-300 transition-all">
                  <div className="w-5 h-5 rounded border-2 border-slate-200 group-hover:border-slate-300 transition-colors"></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">{task.title}</div>
                    <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{task.type}</div>
                  </div>
                  <div className={cn(
                    "px-2 py-0.5 text-[9px] font-bold uppercase rounded tracking-widest ring-1 ring-inset",
                    task.priority === 'High' ? "bg-amber-50 text-amber-700 ring-amber-100" :
                    task.priority === 'Med' ? "bg-blue-50 text-blue-700 ring-blue-100" :
                    "bg-slate-50 text-slate-500 ring-slate-100"
                  )}>
                    {task.priority}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest min-w-[60px] text-right">{task.date}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden">
            <h2 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-widest flex items-center gap-2">
              Progress
            </h2>
            <div className="space-y-6">
               <div className="relative h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                 <div className="absolute h-full w-[72%] bg-slate-900 rounded-full"></div>
               </div>
               
               <div className="space-y-4">
                 {[
                   { label: 'Development', value: 92 },
                   { label: 'QA/Testing', value: 45 },
                   { label: 'Documentation', value: 12 }
                 ].map(item => (
                   <div key={item.label} className="flex items-center justify-between">
                     <span className="text-xs text-slate-500 font-medium">{item.label}</span>
                     <span className="text-xs font-bold text-slate-900">{item.value}%</span>
                   </div>
                 ))}
               </div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden">
            <h2 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-widest">Deadlines</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                <span className="text-xs font-medium text-slate-700">Railway Deployment</span>
                <span className="ml-auto text-[10px] text-slate-400 font-bold uppercase tracking-widest">In 2 days</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                <span className="text-xs font-medium text-slate-700">Client Review</span>
                <span className="ml-auto text-[10px] text-slate-400 font-bold uppercase tracking-widest">In 5 days</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
