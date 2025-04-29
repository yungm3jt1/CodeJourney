// LoginModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import './loginModal.css';
// Import ikon z Lucide
import { Mail, Lock, User, Eye, EyeOff, Github, CheckCircle, X } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  
  const tabIndicatorRef = useRef<HTMLDivElement>(null);
  const loginTabRef = useRef<HTMLButtonElement>(null);
  const registerTabRef = useRef<HTMLButtonElement>(null);

  // Move tab indicator based on active tab
  useEffect(() => {
    if (tabIndicatorRef.current && loginTabRef.current && registerTabRef.current) {
      if (activeTab === 'login') {
        const { offsetLeft, offsetWidth } = loginTabRef.current;
        tabIndicatorRef.current.style.left = `${offsetLeft}px`;
        tabIndicatorRef.current.style.width = `${offsetWidth}px`;
      } else {
        const { offsetLeft, offsetWidth } = registerTabRef.current;
        tabIndicatorRef.current.style.left = `${offsetLeft}px`;
        tabIndicatorRef.current.style.width = `${offsetWidth}px`;
      }
    }
  }, [activeTab]);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    
    if (activeTab === 'register' && formData.password !== formData.confirmPassword) {
      alert('Hasła nie są zgodne!');
      return;
    }
    
    console.log('Form submitted:', {
      type: activeTab,
      data: formData
    });
    
    // Add your authentication logic here
    
    // Optional: Close the modal after successful submission
    // onClose();
  };
  
  // Toggle between login and registration tabs
  const toggleTab = (tab: 'login' | 'register'): void => {
    setActiveTab(tab);
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = (): void => {
    setShowPassword(!showPassword);
  };
  
  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = (): void => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  // Handle animation timing
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
      setTimeout(() => {
        setIsVisible(true);
      }, 10); // Small delay for the animation to kick in
    } else {
      setIsVisible(false);
      // Allow scrolling again after modal is closed and animation completes
      const timer = setTimeout(() => {
        document.body.style.overflow = 'auto';
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  // Close modal when clicking outside
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  // If modal is not open, don't render anything
  if (!isOpen) return null;
  
  return (
    <div 
      className={`modal-backdrop ${isVisible ? 'visible' : ''}`}
      onClick={handleBackdropClick}
    >
      <div className={`modal-container ${isVisible ? 'visible' : ''}`}>
        <div className="modal-header">
          <div className="tab-container">
            <button 
              ref={loginTabRef}
              className={`tab-button ${activeTab === 'login' ? 'active' : ''}`} 
              onClick={() => toggleTab('login')}
            >
              <Lock size={18} className="tab-icon" />
              Logowanie
            </button>
            <button 
              ref={registerTabRef}
              className={`tab-button ${activeTab === 'register' ? 'active' : ''}`} 
              onClick={() => toggleTab('register')}
            >
              <User size={18} className="tab-icon" />
              Rejestracja
            </button>
            <div ref={tabIndicatorRef} className="tab-indicator"></div>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Zamknij">
            <X size={18} />
          </button>
        </div>
        
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-content">
              {/* Login Form */}
              <div className={`form-panel ${activeTab === 'login' ? 'active' : ''}`}>
                <div className="form-group">
                  <label htmlFor="login-email">
                    <Mail size={18} className="input-icon" />
                    Email
                  </label>
                  <input
                    type="email"
                    id="login-email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Wprowadź swój email"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="login-password">
                    <Lock size={18} className="input-icon" />
                    Hasło
                  </label>
                  <div className="password-input-container">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="login-password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Wprowadź swoje hasło"
                      required
                    />
                    <button 
                      type="button" 
                      className="toggle-password"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                
                <div className="form-options">
                  <label className="checkbox-container">
                    <input type="checkbox" name="remember" />
                    <span className="checkmark"></span>
                    Zapamiętaj mnie
                  </label>
                  <a href="#" className="forgot-password">Zapomniałeś hasła?</a>
                </div>
                
                <button type="submit" className="submit-button">
                  <span className="button-text">Zaloguj się</span>
                  <span className="button-icon">→</span>
                </button>
                
                <div className="social-login">
                  <p>lub kontynuuj przez</p>
                  <div className="social-buttons">
                    <button type="button" className="social-button google">
                      <svg className="social-icon" viewBox="0 0 24 24" width="18" height="18">
                        <path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
                      </svg>
                      <span>Google</span>
                    </button>
                    <button type="button" className="social-button github">
                      <Github className="social-icon" size={18} />
                      <span>GitHub</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Register Form */}
              <div className={`form-panel ${activeTab === 'register' ? 'active' : ''}`}>
                <div className="form-group">
                  <label htmlFor="register-name">
                    <User size={18} className="input-icon" />
                    Imię
                  </label>
                  <input
                    type="text"
                    id="register-name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Wprowadź swoje imię"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="register-email">
                    <Mail size={18} className="input-icon" />
                    Email
                  </label>
                  <input
                    type="email"
                    id="register-email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Wprowadź swój email"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="register-password">
                    <Lock size={18} className="input-icon" />
                    Hasło
                  </label>
                  <div className="password-input-container">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="register-password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Utwórz hasło"
                      required
                    />
                    <button 
                      type="button" 
                      className="toggle-password"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="register-confirm-password">
                    <CheckCircle size={18} className="input-icon" />
                    Potwierdź hasło
                  </label>
                  <div className="password-input-container">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="register-confirm-password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Potwierdź hasło"
                      required
                    />
                    <button 
                      type="button" 
                      className="toggle-password"
                      onClick={toggleConfirmPasswordVisibility}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                
                <div className="form-options">
                  <label className="checkbox-container">
                    <input type="checkbox" name="terms" required />
                    <span className="checkmark"></span>
                    Akceptuję <a href="#" className="terms-link">regulamin</a> i <a href="#" className="privacy-link">politykę prywatności</a>
                  </label>
                </div>
                
                <button type="submit" className="submit-button">
                  <span className="button-text">Utwórz konto</span>
                  <span className="button-icon">→</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;