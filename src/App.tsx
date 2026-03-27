import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import KanbanPage from './pages/KanbanPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import NegotiationDetailPage from './pages/NegotiationDetailPage';
import ChatPage from './pages/ChatPage';
import FocusedChatPage from './pages/FocusedChatPage';

function App() {
  const { isAuthenticated, isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />
          <Route element={isAuthenticated ? <Layout /> : <Navigate to="/login" replace />}>
            <Route path="/kanban" element={<KanbanPage />} />
            <Route path="/negociacao/:id" element={<NegotiationDetailPage />} />
            <Route path="/usuarios" element={<UsersPage />} />
            <Route path="/configuracoes" element={<SettingsPage />} />
          </Route>
          <Route path="/chat" element={isAuthenticated ? <ChatPage /> : <Navigate to="/login" replace />} />
          <Route path="/chat-focado/:id" element={isAuthenticated ? <FocusedChatPage /> : <Navigate to="/login" replace />} />
          <Route path="/" element={<Navigate to="/kanban" replace />} />
        </Routes>
      </Router>
  );
}

const Root = () => (
  <AppProvider>
    <ToastProvider>
      <App />
    </ToastProvider>
  </AppProvider>
);

export default Root;
