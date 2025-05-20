import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Bookmark, Wrench, Info, Mail, User } from 'lucide-react';
import LoginModal from './loginModal';
import './App.css';

const Layout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const verifyUserAuthentication = async (): Promise<boolean> => {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    try {
      const response = await fetch('http://localhost/phpmyadmin/auth-project/verify_token.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
        credentials: 'include'
      });

      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      return false;
    }
  };

  const checkAuth = async () => {
    const isLoggedIn = await verifyUserAuthentication();

    const loginButton = document.getElementById('loginButton');
    const cwelIcon = document.getElementById('cwel');

    if (isLoggedIn) {
      loginButton?.classList.add('LoggedIn');
      loginButton?.classList.remove('login-button');
      cwelIcon?.classList.add('icon-login');
      cwelIcon?.classList.remove('off');
    } else {
      loginButton?.classList.remove('LoggedIn');
      loginButton?.classList.add('login-button');
      cwelIcon?.classList.remove('icon-login');
      cwelIcon?.classList.add('off');
    }

    return isLoggedIn;
  };

  const handleLogin = () => {
    checkAuth().then((isLoggedIn) => {
      if (!isLoggedIn) {
        setIsLoginModalOpen(true);
      } else {
        
        setIsLoginModalOpen(false);
      }
    });
  };

  const closeLoginModal = () => setIsLoginModalOpen(false);

  useEffect(() => {
    checkAuth();
  }, [location.pathname]);

  return (
    <div className="app">
      <div className="matrix-bg"></div>

      {/* HEADER */}
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <button className="burger-menu" onClick={toggleMenu} aria-label="Menu">
              <span></span><span></span><span></span>
            </button>
          </div>
          <div className="header-middle">
            <h1 className="header-title">
              <span className="tech-text">Journey</span>
              <span className="code-text">2Code</span>
            </h1>
          </div>
          <div className="header-right">
            <button id="loginButton" onClick={handleLogin} className="login-button">
              <span className="button-text">Login</span>
              <span className="button-icon">→</span>
              <span id="cwel"><User size={18} className="icon-login" /></span>
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <ul className="menu-items">
          <li className="menu-item">
            <Link to="/" className="menu-link">
              <span className="menu-icon"><Home size={18} /></span> Home
            </Link>
          </li>
          <li className="menu-item">
            <Link to="/Tutorials" className="menu-link">
              <span className="menu-icon"><Bookmark size={18} /></span> Tutorials
            </Link>
          </li>
          <li className="menu-item"><a href="#resources"><span className="menu-icon"><Wrench size={18} /></span> Resources</a></li>
          <li className="menu-item"><a href="#about"><span className="menu-icon"><Info size={18} /></span> About</a></li>
          <li className="menu-item"><a href="#contact"><span className="menu-icon"><Mail size={18} /></span> Contact</a></li>
        </ul>
      </div>

      {/* CONTENT */}
      <Outlet />

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <span className="tech-text">J</span><span className="code-text">2C</span>
          </div>
          <div className="footer-links">
            <a href="#terms">Terms</a>
            <a href="#privacy">Privacy</a>
            <a href="#cookies">Cookies</a>
          </div>
          <p className="copyright">&copy; 2025 Journey2Code. All rights reserved.</p>
        </div>
      </footer>

      {/* MODAL */}
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </div>
  );
};

export default Layout;
