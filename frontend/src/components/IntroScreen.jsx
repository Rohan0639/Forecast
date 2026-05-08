import React, { useEffect, useState } from 'react';
import './IntroScreen.css';

const IntroScreen = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 4500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  const titleText = "Air Quality Prediction System";
  
  return (
    <div id="intro-screen">
      <div className="intro-content">
        <h1 className="stagger-title">
          {titleText.split('').map((char, i) => (
            <span key={i} style={{ animationDelay: `${0.3 + i * 0.03}s` }}>
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h1>
        <p id="animated-subtitle">Designed for Hyderabad</p>
        <div className="loader-container">
          <div className="loader-bar"></div>
        </div>
      </div>
    </div>
  );
};

export default IntroScreen;
