import React, { useEffect } from 'react';
import useAuthStore from './store/authStore';
import AuthPage from './pages/AuthPage';
import ChatPage from './pages/ChatPage';

export function App() {
  const { isAuthenticated, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {isAuthenticated ? <ChatPage /> : <AuthPage />}
    </div>
  );
}

export default App;
