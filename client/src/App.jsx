import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import useAuthStore from './store/useAuthStore';
import useThemeStore from './store/useThemeStore';

/* ---- Pages ---- */
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import HomePage from './pages/HomePage';
import PersonalChatPage from './pages/PersonalChatPage';
import WorkspacePage from './pages/WorkspacePage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

/* ---- Protected Route Wrapper ---- */
function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

/* ---- Guest-only Route Wrapper ---- */
function GuestRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
    style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
  >
    {children}
  </motion.div>
);

export default function App() {
  const applyTheme = useThemeStore((s) => s.applyTheme);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const location = useLocation();

  /* Apply saved theme and verify auth on mount */
  useEffect(() => {
    applyTheme();
    checkAuth();
  }, [applyTheme, checkAuth]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* ---- Auth Routes (guest-only) ---- */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <PageWrapper><LoginPage /></PageWrapper>
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <PageWrapper><RegisterPage /></PageWrapper>
            </GuestRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <GuestRoute>
              <PageWrapper><ForgotPasswordPage /></PageWrapper>
            </GuestRoute>
          }
        />

        {/* ---- Protected Routes ---- */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <PageWrapper><HomePage /></PageWrapper>
            </ProtectedRoute>
          }
        />

        {/* Personal Chat */}
        <Route
          path="/personal"
          element={
            <ProtectedRoute>
              <PageWrapper><PersonalChatPage /></PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/personal/:chatId"
          element={
            <ProtectedRoute>
              <PageWrapper><PersonalChatPage /></PageWrapper>
            </ProtectedRoute>
          }
        />

        {/* Workspace */}
        <Route
          path="/workspace"
          element={
            <ProtectedRoute>
              <PageWrapper><WorkspacePage /></PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/workspace/:wsId"
          element={
            <ProtectedRoute>
              <PageWrapper><WorkspacePage /></PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/workspace/:wsId/*"
          element={
            <ProtectedRoute>
              <PageWrapper><WorkspacePage /></PageWrapper>
            </ProtectedRoute>
          }
        />

        {/* Settings */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <PageWrapper><SettingsPage /></PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/:section"
          element={
            <ProtectedRoute>
              <PageWrapper><SettingsPage /></PageWrapper>
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<PageWrapper><NotFoundPage /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}
