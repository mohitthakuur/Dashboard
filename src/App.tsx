/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, Outlet } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db, signInWithGoogle } from './services/firebase';
import { 
  LayoutDashboard, 
  Layers, 
  CheckSquare, 
  Users, 
  Settings, 
  LogOut, 
  Plus, 
  Search,
  Bell,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './lib/utils';

// Components
import { Dashboard } from './components/Dashboard';
import { ProjectView } from './components/ProjectView';
import { ProjectList } from './components/ProjectList';

function Login() {
  const [loading, setLoading] = useState(false);
  
  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-slate-200">
           <div className="text-3xl font-bold text-white">S</div>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tighter italic">Syncro.</h1>
        <p className="text-slate-400 mb-12 font-medium max-w-xs mx-auto leading-relaxed">The high-performance workspace for elite product teams.</p>
        
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-900 font-bold py-4 px-6 rounded-xl hover:bg-slate-50 transition-all duration-200 shadow-sm disabled:opacity-50"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5 grayscale" alt="Google" />
          {loading ? 'Authenticating...' : 'Sign in with Google'}
        </button>

        <p className="mt-12 text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">Ready for Launch • v1.0.0</p>
      </motion.div>
    </div>
  );
}

function Sidebar({ mobile, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const navigate = useNavigate();
  const currentPath = window.location.pathname;
  const user = auth.currentUser;

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Layers, label: 'Projects', path: '/projects' },
    { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
    { icon: Users, label: 'Team', path: '/team' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className={cn(
      "flex flex-col h-full bg-white border-r border-slate-200",
      mobile ? "w-72" : "w-64"
    )}>
      <div className="p-6 flex items-center justify-between mb-4">
        <Link to="/" className="flex items-center gap-3" onClick={onClose}>
          <div className="w-8 h-8 bg-slate-900 rounded-md flex items-center justify-center text-white font-bold text-lg">
            S
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">Syncro.</span>
        </Link>
        {mobile && (
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-1">
        <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mb-2 px-3">Menu</div>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
              currentPath === item.path 
                ? "bg-slate-100 text-slate-900" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto border-t border-slate-100 p-6">
        <div className="flex items-center gap-3 px-2">
          <img 
            src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} 
            alt="Avatar" 
            className="w-10 h-10 rounded-full bg-slate-200 object-cover"
          />
          <div className="overflow-hidden">
            <div className="text-sm font-semibold truncate text-slate-900">{user?.displayName || 'User'}</div>
            <div className="text-xs text-slate-400 truncate">Project Admin</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const user = auth.currentUser;
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await auth.signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50/50 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          >
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute left-0 top-0 bottom-0 z-50"
            >
              <Sidebar mobile onClose={() => setIsSidebarOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 z-10 transition-all">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <div className="flex flex-col"> 
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">Syncro Workspace</h1>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Project Management & Strategy</p>
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            <div className="relative group hidden sm:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 w-48 focus:w-64 focus:bg-white focus:border-slate-400 transition-all outline-none text-xs"
              />
            </div>
            
            <button className="relative p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-slate-900 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="flex items-center gap-3">
              <button onClick={handleSignOut} className="group relative">
                <img 
                  src={user?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'} 
                  alt="Avatar" 
                  className="w-10 h-10 rounded-full object-cover bg-slate-100 border border-slate-200"
                />
                <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-sm border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                  <LogOut size={10} className="text-slate-500" />
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-auto bg-slate-50/30">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (u) {
        // Sync user profile
        const userRef = doc(db, 'users', u.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            displayName: u.displayName,
            email: u.email,
            photoURL: u.photoURL,
            lastLogin: serverTimestamp()
          });
        } else {
          await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
        }
      }
      setUser(u);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium">Syncing data...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {!user ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<ProjectList />} />
            <Route path="projects/:projectId" element={<ProjectView />} />
            <Route path="tasks" element={<div className="p-8"><CheckSquare className="mb-4 text-blue-500" size={48} /> <h2 className="text-2xl font-bold">My Tasks</h2><p className="text-gray-500">Coming soon in the next sprint.</p></div>} />
            <Route path="team" element={<div className="p-8 font-bold">Manage your team members across projects.</div>} />
            <Route path="settings" element={<div className="p-8">Customize your Syncro experience.</div>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
}
