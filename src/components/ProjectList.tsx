import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Layers, X, Briefcase, Calendar, ChevronRight } from 'lucide-react';
import { projectService } from '../services/projectService';
import { Project } from '../types';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');

  useEffect(() => {
    const unsub = projectService.getProjects((projs) => {
      setProjects(projs);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    
    try {
      await projectService.createProject(projectName, projectDesc);
      setIsModalOpen(false);
      setProjectName('');
      setProjectDesc('');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Projects</h1>
          <p className="text-slate-500 mt-1">Manage and track your team's initiatives.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-6 rounded-lg transition-all shadow-sm"
        >
          <Plus size={18} />
          New Project
        </button>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-44 bg-slate-100 animate-pulse rounded-xl border border-slate-200"></div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Layers size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">No projects yet</h3>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto text-sm leading-relaxed">Create your first project to start organizing tasks and collaborating with your team.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-slate-900 font-bold hover:underline underline-offset-4"
          >
            Get started now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/projects/${project.id}`}
                className="group block bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 bg-slate-50 text-slate-900 border border-slate-200 rounded-lg flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                    <Briefcase size={22} />
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                </div>
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1.5">Project</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 truncate tracking-tight">{project.name}</h3>
                <p className="text-slate-500 text-sm line-clamp-2 mb-6 h-10 leading-normal">{project.description || 'Strategic planning and initiative tracking.'}</p>
                
                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    <Calendar size={14} />
                    <span>{project.createdAt?.seconds ? format(new Date(project.createdAt.seconds * 1000), 'MMM d, yyyy') : 'Recently'}</span>
                  </div>
                  <div className="flex -space-x-1.5">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[9px] font-bold text-slate-500 ring-1 ring-slate-100">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">New Project</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2">Project Name</label>
                  <input 
                    autoFocus
                    required
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    type="text" 
                    placeholder="e.g. Website Redesign" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:bg-white focus:border-slate-900 outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2">Description</label>
                  <textarea 
                    value={projectDesc}
                    onChange={(e) => setProjectDesc(e.target.value)}
                    rows={4}
                    placeholder="Briefly describe the goals..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:bg-white focus:border-slate-900 outline-none transition-all text-sm resize-none h-24"
                  />
                </div>
                
                <div className="flex flex-col gap-3 pt-4">
                  <button 
                    type="submit"
                    className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition-all shadow-md"
                  >
                    Create Project
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-full py-3 rounded-lg text-slate-500 font-bold hover:bg-slate-50 transition-all text-sm"
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
