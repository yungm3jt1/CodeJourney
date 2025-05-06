import React, { useState, useEffect, useRef } from 'react';
import './loginModal.css';
// Import icons from Lucide
import { Mail, Lock, User, Eye, EyeOff, Github, CheckCircle, X, AlertCircle, ArrowLeft } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (userData: any) => void;
}

interface FormData {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  token?: string;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgotpassword'>('login');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const tabIndicatorRef = useRef<HTMLDivElement>(null);
  const loginTabRef = useRef<HTMLButtonElement>(null);
  const registerTabRef = useRef<HTMLButtonElement>(null);

  // API URL - update this to your PHP server location
  const API_URL = 'http://localhost/phpmyadmin/auth-project/login.php';

  // Move tab indicator based on active tab
  useEffect(() => {
    if (tabIndicatorRef.current && loginTabRef.current && registerTabRef.current) {
      if (activeTab === 'login') {
        const { offsetLeft, offsetWidth } = loginTabRef.current;
        tabIndicatorRef.current.style.left = `${offsetLeft}px`;
        tabIndicatorRef.current.style.width = `${offsetWidth}px`;
      } else if (activeTab === 'register') {
        const { offsetLeft, offsetWidth } = registerTabRef.current;
        tabIndicatorRef.current.style.left = `${offsetLeft}px`;
        tabIndicatorRef.current.style.width = `${offsetWidth}px`;
      } else {
        // Hide the indicator for forgotpassword tab
        tabIndicatorRef.current.style.width = '0px';
      }
    }
  }, [activeTab]);
  
  // Reset form when changing tabs
  useEffect(() => {
    setFormData({
      email: '',
      password: '',
      name: '',
      confirmPassword: ''
    });
    setError(null);
    setSuccessMessage(null);
  }, [activeTab]);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear previous errors when user types
    setError(null);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    
    // Validate form
    if (activeTab === 'register') {
      if (formData.password !== formData.confirmPassword) {
        setError('Hasła nie są zgodne!');
        return;
      }
      
      if (formData.password.length < 8) {
        setError('Hasło musi mieć co najmniej 8 znaków');
        return;
      }
    }
    
    // Validate email for forgot password
    if (activeTab === 'forgotpassword' && !formData.email) {
      setError('Wprowadź adres email');
      return;
    }
    
    try {
      setIsLoading(true);
      
      let apiPayload: any = {
        action: activeTab,
        email: formData.email
      };
      
      // Add additional fields based on action
      if (activeTab === 'login') {
        apiPayload.password = formData.password;
      } else if (activeTab === 'register') {
        apiPayload.password = formData.password;
        apiPayload.name = formData.name;
      }
      
      console.log('Sending payload:', apiPayload);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiPayload),
        credentials: 'include'
      });
      
      const data: ApiResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Wystąpił błąd podczas przetwarzania żądania');
      }
      
      // Success
      setSuccessMessage(data.message || (activeTab === 'forgotpassword' ? 'Wysłano link do resetowania hasła na podany adres email' : 'Operacja zakończona pomyślnie'));
      
      // For login/register, handle token
      if (data.token && (activeTab === 'login' || activeTab === 'register')) {
        localStorage.setItem('authToken', data.token);
        
        // If user data is returned, store it as well
        if (data.user) {
          localStorage.setItem('userData', JSON.stringify(data.user));
        }
        
        // Call success callback if provided
        if (onLoginSuccess && data.user) {
          onLoginSuccess(data.user);
        }
        
        // Close modal after short delay
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1500);
      }
      
      // For forgot password, go back to login after delay
      if (activeTab === 'forgotpassword') {
        setTimeout(() => {
          setActiveTab('login');
        }, 3000);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Wystąpił nieznany błąd');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Toggle between login and registration tabs
  const toggleTab = (tab: 'login' | 'register' | 'forgotpassword'): void => {
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
  
  function handleForgotPasswordButton() {
    setActiveTab('forgotpassword');
  }

  // Go back to login from forgot password
  function handleBackToLogin() {
    setActiveTab('login');
  }

  return (
    <div 
      className={`modal-backdrop ${isVisible ? 'visible' : ''}`}
      onClick={handleBackdropClick}
    >
      <div className={`modal-container ${isVisible ? 'visible' : ''}`}>
        <div className="modal-header">
          {activeTab !== 'forgotpassword' ? (
            <div className="tab-container">
              <button 
                ref={loginTabRef}
                className={`tab-button ${activeTab === 'login' ? 'active' : ''}`} 
                onClick={() => toggleTab('login')}
                disabled={isLoading}
              >
                <Lock size={18} className="tab-icon" />
                Logowanie
              </button>
              <button 
                ref={registerTabRef}
                className={`tab-button ${activeTab === 'register' ? 'active' : ''}`} 
                onClick={() => toggleTab('register')}
                disabled={isLoading}
              >
                <User size={18} className="tab-icon" />
                Rejestracja
              </button>
              <div ref={tabIndicatorRef} className="tab-indicator"></div>
            </div>
          ) : (
            <div className="forgot-password-header">
              <button 
                className="back-button" 
                onClick={handleBackToLogin}
                disabled={isLoading}
              >
                <ArrowLeft size={18} />
                <span>Powrót do logowania</span>
              </button>
              <h2>Resetowanie hasła</h2>
            </div>
          )}
          <button 
            className="close-button" 
            onClick={onClose} 
            aria-label="Zamknij"
            disabled={isLoading}
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="modal-body">
          {/* Status Messages */}
          {error && (
            <div className="status-message error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}
          
          {successMessage && (
            <div className="status-message success">
              <CheckCircle size={18} />
              <span>{successMessage}</span>
            </div>
          )}
          
          <div className="form-content">
            {/* Login Form */}
            <div className={`form-panel ${activeTab === 'login' ? 'active' : ''}`}>
              {activeTab === 'login' && (
                <form onSubmit={handleSubmit}>
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
                      disabled={isLoading}
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
                        disabled={isLoading}
                      />
                      <button 
                        type="button" 
                        className="toggle-password"
                        onClick={togglePasswordVisibility}
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="form-options">
                    <label className="checkbox-container">
                      <input 
                        type="checkbox" 
                        name="remember" 
                        disabled={isLoading}
                      />
                      <span className="checkmark"></span>
                      Zapamiętaj mnie
                    </label>
                    <button 
                      type="button" 
                      className="forgot-password-button" 
                      onClick={handleForgotPasswordButton}
                      disabled={isLoading}
                    >
                      <span className="forgot-password">Zapomniałeś hasła?</span>
                    </button>
                  </div>
                  
                  <button 
                    type="submit" 
                    className={`submit-button ${isLoading ? 'loading' : ''}`}
                    disabled={isLoading}
                  >
                    <span className="button-text">
                      {isLoading ? 'Logowanie...' : 'Zaloguj się'}
                    </span>
                    <span className="button-icon">→</span>
                  </button>
                </form>
              )}
            </div>

            {/* Register Form */}
            <div className={`form-panel ${activeTab === 'register' ? 'active' : ''}`}>
              {activeTab === 'register' && (
                <form onSubmit={handleSubmit}>
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
                      disabled={isLoading}
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
                      disabled={isLoading}
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
                        disabled={isLoading}
                        minLength={8}
                      />
                      <button 
                        type="button" 
                        className="toggle-password"
                        onClick={togglePasswordVisibility}
                        disabled={isLoading}
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
                        disabled={isLoading}
                        minLength={8}
                      />
                      <button 
                        type="button" 
                        className="toggle-password"
                        onClick={toggleConfirmPasswordVisibility}
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="form-options">
                    <label className="checkbox-container">
                      <input 
                        type="checkbox" 
                        name="terms" 
                        required
                        disabled={isLoading} 
                      />
                      <span className="checkmark"></span>
                      Akceptuję&nbsp;<a href="#" target="_blank" className="terms-link" >regulamin</a>&nbsp;i&nbsp;<a href="#" target="_blank" className="privacy-link">politykę prywatności</a>
                    </label>
                  </div>
                  
                  <button 
                    type="submit" 
                    className={`submit-button ${isLoading ? 'loading' : ''}`}
                    disabled={isLoading}
                  >
                    <span className="button-text">
                      {isLoading ? 'Tworzenie konta...' : 'Utwórz konto'}
                    </span>
                    <span className="button-icon">→</span>
                  </button>
                </form>
              )}
            </div>

            {/* Forgot Password Form */}
            <div className={`form-panel ${activeTab === 'forgotpassword' ? 'active' : ''}`}>
              {activeTab === 'forgotpassword' && (
                <form onSubmit={handleSubmit}>
                  <div className="forgot-password-description">
                    <p>Wprowadź swój adres email, a wyślemy Ci link umożliwiający zresetowanie hasła.</p>
                  </div>
                  <div className="form-group">
                    <label htmlFor="forgot-email">
                      <Mail size={18} className="input-icon" />
                      Email
                    </label>
                    <input
                      type="email"
                      id="forgot-email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Wprowadź swój email"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    className={`submit-button ${isLoading ? 'loading' : ''}`}
                    disabled={isLoading}
                  >
                    <span className="button-text">
                      {isLoading ? 'Wysyłanie...' : 'Wyślij link resetujący'}
                    </span>
                    <span className="button-icon">→</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;