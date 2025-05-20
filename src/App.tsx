import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
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

  useEffect(() => {
    setIsLoaded(true);

    const typeCommand = () => {
      let index = 0;
      const interval = setInterval(() => {
        if (index < fullCommand.length) {
          setAnimationState((prev) => ({
            ...prev,
            command: fullCommand.substring(0, index + 1)
          }));
          index++;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            setAnimationState((prev) => ({ ...prev, currentStep: 'heading' }));
            typeHeading();
          }, 400);
        }
      }, 100);
    };

    const typeHeading = () => {
      let index = 0;
      const interval = setInterval(() => {
        if (index < fullText.length) {
          setAnimationState((prev) => ({
            ...prev,
            heading: fullText.substring(0, index + 1)
          }));
          index++;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            setAnimationState((prev) => ({ ...prev, currentStep: 'output' }));
            typeOutput();
          }, 400);
        }
      }, 80);
    };

    const typeOutput = () => {
      let index = 0;
      const interval = setInterval(() => {
        if (index < fullOutput.length) {
          setAnimationState((prev) => ({
            ...prev,
            output: fullOutput.substring(0, index + 1)
          }));
          index++;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            setAnimationState((prev) => ({
              ...prev,
              showOutput: true,
              animationComplete: true,
              currentStep: 'done'
            }));
          }, 300);
        }
      }, 50);
    };

    typeCommand();
  }, []);

  return (
    <div className={`main-content ${isLoaded ? 'loaded' : ''}`}>
      <div className="hero-section">
        <div className="terminal">
          <div className="terminal-header">
            <div className="terminal-button red"></div>
            <div className="terminal-button yellow"></div>
            <div className="terminal-button green"></div>
            <div className="terminal-title">Terminal</div>
          </div>
          <div className="terminal-body">
            <div className="terminal-line">
              <span className="prompt">$</span>
              <span className="command">{animationState.command}</span>
              {animationState.currentStep === 'command' && <span className="cursor"></span>}
            </div>

            {animationState.command.length === fullCommand.length && (
              <div className="terminal-line">
                <h2 className="typewriter">
                  {animationState.heading}
                  {animationState.currentStep === 'heading' && <span className="cursor"></span>}
                </h2>
              </div>
            )}

            {animationState.heading.length === fullText.length && (
              <div className="terminal-line">
                <span className="prompt">$</span>
                <span className="command">{animationState.output}</span>
                {animationState.currentStep === 'output' && <span className="cursor"></span>}
              </div>
            )}

            {animationState.showOutput && (
              <p className="terminal-output">Learn, build, and grow with our coding resources</p>
            )}

            {animationState.currentStep === 'done' && (
              <div className="terminal-line">
                <span className="prompt">$</span>
                <span className="blink-cursor"></span>
              </div>
            )}
          </div>
        </div>
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
              <span className="code-icon">{'{ }'}</span>
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
  );
}

export default App;
