import React from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';

const Tutorials: React.FC = () => {
  const navigate = useNavigate();

  const languages = [
    {
      name: 'JavaScript',
      symbol: '{;}',
      description: 'Poznaj nowoczesny JavaScript i buduj dynamiczne strony internetowe.',
      path: '/tutorials/javascript'
    },
    {
      name: 'PHP',
      symbol: '.php',
      description: 'Twórz backendowe aplikacje webowe i zarządzaj danymi na serwerze.',
      path: '/tutorials/php'
    },
    {
      name: 'Python',
      symbol: '.py',
      description: 'Zacznij programować w Pythonie – języku sztucznej inteligencji i automatyzacji.',
      path: '/tutorials/python'
    },
    {
      name: 'HTML',
      symbol: '</>',
      description: 'Naucz się budować strukturę stron internetowych w HTML5.',
      path: '/tutorials/html'
    }
  ];

  const handleSelect = (path: string) => {
    navigate(path);
  };

  return (
    <div className="app">
      <div className="matrix-bg"></div>

      {/* HEADER & FOOTER są wspólne – są w App.tsx/index.tsx (Router Layout) */}

      <div className="main-content loaded">
        <h1 style={{ marginBottom: '1rem', textAlign: 'center', fontSize: '2rem' }}>
          Wybierz język programowania
        </h1>
        <p style={{ marginBottom: '2rem', textAlign: 'center', color: 'var(--text-dark)' }}>
          Kliknij w jedną z poniższych opcji, aby rozpocząć naukę
        </p>

        <div className="features-section">
          {languages.map((lang) => (
            <div
              className="feature-card"
              key={lang.name}
              onClick={() => handleSelect(lang.path)}
              style={{ cursor: 'pointer' }}
            >
              <div className="feature-icon">
                <div className="icon-container">
                  <span className="code-icon language-symbol">{lang.symbol}</span>
                </div>
              </div>
              <h3>{lang.name}</h3>
              <p>{lang.description}</p>
              <div className="card-footer">
                <span className="learn-more">Rozpocznij</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tutorials;
