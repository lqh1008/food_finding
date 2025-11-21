import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Register from './pages/Register';
import LoginModal from './components/LoginModal';
import Dashboard from './pages/Dashboard';
import CreateEntry from './pages/CreateEntry';

function AppContent() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const handleShowLoginModal = () => {
      setShowModal(true);
    };

    window.addEventListener('show-login-modal', handleShowLoginModal);

    return () => {
      window.removeEventListener('show-login-modal', handleShowLoginModal);
    };
  }, []);

  const handleLoginSuccess = () => {
    setShowModal(false);
    window.dispatchEvent(new CustomEvent('login-success'));
  };

  const handleClose = () => {
    setShowModal(false);
    window.dispatchEvent(new CustomEvent('login-cancelled'));
  };

  return (
    <>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/create-entry" element={<CreateEntry />} />
      </Routes>

      <LoginModal
        isOpen={showModal}
        onClose={handleClose}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
