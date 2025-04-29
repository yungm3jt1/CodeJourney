// App.tsx
import React, { useState, useEffect } from 'react';
import './App.css';
import LoginModal from './loginModal';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [animationState, setAnimationState] = useState({
    heading: '',
    command: '',
    output: '',
    showOutput: false,
    animationComplete: false,
    currentStep: 'command'
  });

  const fullText = 'Begin Your Coding Journey Today';
  const fullCommand = './welcome.sh';
  const fullOutput = 'echo "Learn, build, and grow with our coding resources"';

  // Handle login button click
  const handleLogin = () => {
    setIsLoginModalOpen(true);
  };

  // Close login modal
  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  useEffect(() => {
    setIsLoaded(true);
    
    // Step 1
    const typeCommand = () => {
      let index = 0;
      const commandInterval = setInterval(() => {
        if (index < fullCommand.length) {
          setAnimationState(prev => ({
            ...prev,
            command: fullCommand.substring(0, index + 1)
          }));
          index++;
        } else {
          clearInterval(commandInterval);
          setTimeout(() => {
            setAnimationState(prev => ({
              ...prev,
              currentStep: 'heading' 
            }));
            typeHeading();
          }, 400); 
        }
      }, 100);
    };
    
    // Step 2
    const typeHeading = () => {
      let index = 0;
      const headingInterval = setInterval(() => {
        if (index < fullText.length) {
          setAnimationState(prev => ({
            ...prev,
            heading: fullText.substring(0, index + 1)
          }));
          index++;
        } else {
          clearInterval(headingInterval);
          setTimeout(() => {
            setAnimationState(prev => ({
              ...prev,
              currentStep: 'output' 
            }));
            typeOutput();
          }, 400); 
        }
      }, 80);
    };
    
    // Step 3 
    const typeOutput = () => {
      let index = 0;
      const outputInterval = setInterval(() => {
        if (index < fullOutput.length) {
          setAnimationState(prev => ({
            ...prev,
            output: fullOutput.substring(0, index + 1)
          }));
          index++;
        } else {
          clearInterval(outputInterval);
          setTimeout(() => {
            setAnimationState(prev => ({
              ...prev,
              showOutput: true,
              animationComplete: true,
              currentStep: 'done' 
            }));
          }, 300);
        }
      }, 50);
    };

    // Start with the command now
    typeCommand();
    
    return () => {
      // Cleanup function if needed
    };
  }, []);

  return (
    <div className="app">
      <div className="matrix-bg"></div>
      
      <header className="header">
        <div className="header-content">
          {/* header left */}
          <div className="header-left">
            <button className="burger-menu" onClick={toggleMenu} aria-label="Menu">
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
          {/* header middle */}
          <div className="header-middle">
            <h1 className="header-title">
              <span className="tech-text">Journey</span>
              <span className="code-text">2Code</span>
            </h1>
          </div>
          {/* header right */}
          <div className="header-right">
            <button onClick={handleLogin} className="login-button">
              <span className="button-text">Login</span>
              <span className="button-icon">→</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <ul className="menu-items">
          <li className="menu-item"><a href="#home"><span className="menu-icon">⌂</span> Home</a></li>
          <li className="menu-item"><a href="#tutorials"><span className="menu-icon">📚</span> Tutorials</a></li>
          <li className="menu-item"><a href="#resources"><span className="menu-icon">🔧</span> Resources</a></li>
          <li className="menu-item"><a href="#about"><span className="menu-icon">ℹ️</span> About</a></li>
          <li className="menu-item"><a href="#contact"><span className="menu-icon">✉️</span> Contact</a></li>
        </ul>
      </div>

      {/* Main content area */}
      <div className={`main-content ${isLoaded ? 'loaded' : ''}`}>
        <div className="hero-section">
          <div className="terminal">
            <div className="terminal-header">
              <div className="terminal-button red"></div>
              <div className="terminal-button yellow"></div>
              <div className="terminal-button green"></div>
              <div className="terminal-title">journey2code.sh</div>
            </div>
            <div className="terminal-body">
              {/* Command line with prompt - now first */}
              <div className="terminal-line">
                <span className="prompt">$</span> <span className="command">{animationState.command}</span>
                {animationState.currentStep === 'command' && <span className="cursor"></span>}
              </div>
              
              {/* Heading with blinking cursor - now second */}
              {animationState.command.length === fullCommand.length && (
                <div className="terminal-line">
                  <h2 className="typewriter">
                    {animationState.heading}
                    {animationState.currentStep === 'heading' && <span className="cursor"></span>}
                  </h2>
                </div>
              )}
              
              {/* Output command */}
              {animationState.heading.length === fullText.length && (
                <div className="terminal-line">
                  <span className="prompt">$</span> <span className="command">{animationState.output}</span>
                  {animationState.currentStep === 'output' && <span className="cursor"></span>}
                </div>
              )}
              
              {/* Output result */}
              {animationState.showOutput && (
                <p className="terminal-output">Learn, build, and grow with our coding resources</p>
              )}
              
              {/* Final blinking cursor */}
              {animationState.currentStep === 'done' && (
                <div className="terminal-line">
                  <span className="prompt">$</span> <span className="blink-cursor"></span>
                </div>
              )}
            </div>
          </div>
          <button className="cta-button">
            <span className="button-text">Get Started</span>
            <span className="button-icon">→</span>
          </button>
        </div>

        <div className="features-section">
          <div className="feature-card">
            <div className="feature-icon">
              <div className="icon-container">
                <span className="code-icon">&lt;/&gt;</span>
              </div>
            </div>
            <h3>Learn to Code</h3>
            <p>Access comprehensive tutorials for beginners and advanced developers</p>
            <div className="card-footer">
              <a href="#learn" className="learn-more">Explore tutorials</a>
            </div>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <div className="icon-container">
                <span className="code-icon">{ }</span>
              </div>
            </div>
            <h3>Build Projects</h3>
            <p>Apply your knowledge with hands-on coding exercises and projects</p>
            <div className="card-footer">
              <a href="#projects" className="learn-more">View projects</a>
            </div>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <div className="icon-container">
                <span className="code-icon">^_^</span>
              </div>
            </div>
            <h3>Join Community</h3>
            <p>Connect with other developers, share knowledge, and grow together</p>
            <div className="card-footer">
              <a href="#community" className="learn-more">Join now</a>
            </div>
          </div>
        </div>
      </div>

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

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={closeLoginModal} 
      />
    </div>
  );
}

export default App;