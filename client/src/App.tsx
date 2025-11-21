import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import LoginModal from './components/LoginModal';



import Dashboard from './pages/Dashboard';
import CreateEntry from './pages/CreateEntry';

// 内部应用组件，需要在AuthProvider内部使用
function AppContent() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // 监听显示登录框事件
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
    // 触发登录成功事件，通知拦截器重试请求
    window.dispatchEvent(new CustomEvent('login-success'));
  };

  const handleClose = () => {
    setShowModal(false);
    // 触发登录取消事件
    window.dispatchEvent(new CustomEvent('login-cancelled'));
  };

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={<Dashboard />}
        />
        <Route
          path="/create-entry"
          element={<CreateEntry />}
        />
      </Routes>

      {/* 全局登录对话框 */}
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
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;

