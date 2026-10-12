import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { PageView } from './types';
import { ThreeSceneBackground } from './components/3d/ThreeSceneBackground';
import { ToastContainer } from './components/common/Toast';
import { SupabaseModal } from './components/common/SupabaseModal';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { TasksPage } from './pages/TasksPage';
import { NotesPage } from './pages/NotesPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { Zap } from 'lucide-react';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageView>('landing');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Global Quick Add Modal States
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isNewExpenseModalOpen, setIsNewExpenseModalOpen] = useState(false);
  const [isNewNoteModalOpen, setIsNewNoteModalOpen] = useState(false);

  // Auto-route to dashboard when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      if (['landing', 'login', 'register', 'forgot-password'].includes(currentPage)) {
        setCurrentPage('dashboard');
      }
    } else {
      if (!['landing', 'login', 'register', 'forgot-password'].includes(currentPage)) {
        setCurrentPage('login');
      }
    }
  }, [isAuthenticated, currentPage]);

  // Loading Screen while verifying session with Supabase or storage
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <ThreeSceneBackground className="absolute inset-0 pointer-events-none z-0" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 animate-pulse mb-4">
            <Zap className="w-6 h-6 fill-white" />
          </div>
          <p className="text-sm font-semibold text-slate-200 tracking-wide">
            Securing your LifeDesk AI workspace...
          </p>
          <p className="text-xs text-slate-400 mt-1">Verifying Supabase session & RLS credentials</p>
        </div>
      </div>
    );
  }

  // Public & Unauthenticated Pages
  if (!isAuthenticated) {
    if (currentPage === 'login') {
      return (
        <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
          <ThreeSceneBackground className="fixed inset-0 pointer-events-none z-0" />
          <div className="relative z-10">
            <LoginPage onNavigate={setCurrentPage} />
            <SupabaseModal
              isOpen={isSupabaseModalOpen}
              onClose={() => setIsSupabaseModalOpen(false)}
            />
            <ToastContainer />
          </div>
        </div>
      );
    }

    if (currentPage === 'register') {
      return (
        <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
          <ThreeSceneBackground className="fixed inset-0 pointer-events-none z-0" />
          <div className="relative z-10">
            <RegisterPage onNavigate={setCurrentPage} />
            <SupabaseModal
              isOpen={isSupabaseModalOpen}
              onClose={() => setIsSupabaseModalOpen(false)}
            />
            <ToastContainer />
          </div>
        </div>
      );
    }

    if (currentPage === 'forgot-password') {
      return (
        <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
          <ThreeSceneBackground className="fixed inset-0 pointer-events-none z-0" />
          <div className="relative z-10">
            <ForgotPasswordPage onNavigate={setCurrentPage} />
            <ToastContainer />
          </div>
        </div>
      );
    }

    // Default unauthenticated is landing
    return (
      <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
        <ThreeSceneBackground className="fixed inset-0 pointer-events-none z-0" />
        <div className="relative z-10">
          <LandingPage
            onNavigate={setCurrentPage}
            onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
          />
          <SupabaseModal
            isOpen={isSupabaseModalOpen}
            onClose={() => setIsSupabaseModalOpen(false)}
          />
          <ToastContainer />
        </div>
      </div>
    );
  }

  // Authenticated Main Workspace Layout (Strict Protected Routes)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex transition-colors relative overflow-hidden">
      {/* 3D Global Ambient Particle Matrix */}
      <ThreeSceneBackground className="fixed inset-0 pointer-events-none z-0" />

      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isMobileOpen={isMobileSidebarOpen}
        closeMobileSidebar={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Navbar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          toggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          openNewTaskModal={() => {
            setCurrentPage('tasks');
            setIsNewTaskModalOpen(true);
          }}
          openNewExpenseModal={() => {
            setCurrentPage('expenses');
            setIsNewExpenseModalOpen(true);
          }}
          openNewNoteModal={() => {
            setCurrentPage('notes');
            setIsNewNoteModalOpen(true);
          }}
          openSupabaseModal={() => setIsSupabaseModalOpen(true)}
        />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-6 overflow-x-hidden">
          {currentPage === 'dashboard' && (
            <DashboardPage
              onNavigate={setCurrentPage}
              openNewTaskModal={() => {
                setCurrentPage('tasks');
                setIsNewTaskModalOpen(true);
              }}
              openNewExpenseModal={() => {
                setCurrentPage('expenses');
                setIsNewExpenseModalOpen(true);
              }}
            />
          )}

          {currentPage === 'tasks' && (
            <TasksPage
              isNewTaskModalOpen={isNewTaskModalOpen}
              setIsNewTaskModalOpen={setIsNewTaskModalOpen}
            />
          )}

          {currentPage === 'notes' && (
            <NotesPage
              isNewNoteModalOpen={isNewNoteModalOpen}
              setIsNewNoteModalOpen={setIsNewNoteModalOpen}
            />
          )}

          {currentPage === 'expenses' && (
            <ExpensesPage
              isNewExpenseModalOpen={isNewExpenseModalOpen}
              setIsNewExpenseModalOpen={setIsNewExpenseModalOpen}
            />
          )}

          {currentPage === 'documents' && <DocumentsPage />}

          {currentPage === 'ai-assistant' && <AIAssistantPage />}

          {currentPage === 'profile' && <ProfilePage />}

          {currentPage === 'settings' && <SettingsPage />}
        </main>
      </div>

      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}
