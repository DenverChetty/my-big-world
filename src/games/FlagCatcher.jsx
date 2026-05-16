import React, { useState, useEffect, useRef, useCallback } from 'react';

// ============================================
// COUNTRY DATA FOR THE GAME
// ============================================
const countries = [
  { id: "japan", name: "Japan", flagEmoji: "🇯🇵", unlockedAt: 0 },
  { id: "france", name: "France", flagEmoji: "🇫🇷", unlockedAt: 0 },
  { id: "brazil", name: "Brazil", flagEmoji: "🇧🇷", unlockedAt: 0 },
  { id: "australia", name: "Australia", flagEmoji: "🇦🇺", unlockedAt: 50 },
  { id: "egypt", name: "Egypt", flagEmoji: "🇪🇬", unlockedAt: 50 },
  { id: "canada", name: "Canada", flagEmoji: "🇨🇦", unlockedAt: 100 },
  { id: "india", name: "India", flagEmoji: "🇮🇳", unlockedAt: 100 },
  { id: "italy", name: "Italy", flagEmoji: "🇮🇹", unlockedAt: 200 },
  { id: "mexico", name: "Mexico", flagEmoji: "🇲🇽", unlockedAt: 200 },
  { id: "germany", name: "Germany", flagEmoji: "🇩🇪", unlockedAt: 300 },
  { id: "spain", name: "Spain", flagEmoji: "🇪🇸", unlockedAt: 300 },
  { id: "kenya", name: "Kenya", flagEmoji: "🇰🇪", unlockedAt: 400 },
  { id: "argentina", name: "Argentina", flagEmoji: "🇦🇷", unlockedAt: 400 },
  { id: "china", name: "China", flagEmoji: "🇨🇳", unlockedAt: 500 },
  { id: "thailand", name: "Thailand", flagEmoji: "🇹🇭", unlockedAt: 500 },
  { id: "turkey", name: "Turkey", flagEmoji: "🇹🇷", unlockedAt: 600 },
  { id: "sweden", name: "Sweden", flagEmoji: "🇸🇪", unlockedAt: 600 },
  { id: "norway", name: "Norway", flagEmoji: "🇳🇴", unlockedAt: 700 },
  { id: "newzealand", name: "New Zealand", flagEmoji: "🇳🇿", unlockedAt: 700 }
];

function FlagCatcher({ onClose, onEarnStamp }) {
  const [gameState, setGameState] = useState('title');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [combo, setCombo] = useState(0);
  const [fallingFlags, setFallingFlags] = useState([]);
  const [unlockedCountries, setUnlockedCountries] = useState([]);
  const [nextUnlockAt, setNextUnlockAt] = useState(50);
  const [streakMessage, setStreakMessage] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  
  const spawnIntervalRef = useRef(null);
  const animationRef = useRef(null);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 500 });
  
  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem('flagCatcherHighScore');
    if (saved) setHighScore(parseInt(saved));
  }, []);
  
  // Save high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('flagCatcherHighScore', score);
    }
  }, [score, highScore]);
  
  // Update unlocked countries based on score
  useEffect(() => {
    const newUnlocked = countries.filter(c => c.unlockedAt <= score);
    setUnlockedCountries(newUnlocked);
    const next = countries.find(c => c.unlockedAt > score);
    setNextUnlockAt(next ? next.unlockedAt : null);
    
    const justUnlocked = newUnlocked.find(c => c.unlockedAt > 0 && c.unlockedAt <= score && !unlockedCountries.some(u => u.id === c.id));
    if (justUnlocked) {
      setCelebrationMessage(`🎉 NEW: ${justUnlocked.name}! 🎉`);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
    }
  }, [score, unlockedCountries]);
  
  // Spawn a flag
  const spawnFlag = useCallback(() => {
    if (gameState !== 'playing') return;
    if (unlockedCountries.length === 0) return;
    
    const randomCountry = unlockedCountries[Math.floor(Math.random() * unlockedCountries.length)];
    
    setFallingFlags(prev => [...prev, {
      id: Date.now() + Math.random(),
      country: randomCountry,
      x: 40 + Math.random() * (dimensions.width - 80),
      y: 30,
      speedY: 80 + Math.floor(score / 150) * 15
    }]);
  }, [gameState, unlockedCountries, dimensions.width, score]);
  
  // Start game
  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setLives(5);
    setCombo(0);
    setFallingFlags([]);
    setStreakMessage(null);
    setCelebrationMessage('');
    setShowCelebration(false);
    
    const initialUnlocked = countries.filter(c => c.unlockedAt === 0);
    setUnlockedCountries(initialUnlocked);
    
    if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
    spawnIntervalRef.current = setInterval(() => spawnFlag(), 1000);
  }, [spawnFlag]);
  
  // End game
  const endGame = useCallback(() => {
    setGameState('gameOver');
    if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
  }, []);
  
  // Catch a flag
  const catchFlag = useCallback((country) => {
    if (gameState !== 'playing') return;
    
    // Find the closest flag of this country (lowest y position)
    const matchingFlags = fallingFlags.filter(f => f.country.id === country.id);
    if (matchingFlags.length === 0) return;
    
    const closestFlag = matchingFlags.reduce((lowest, current) => 
      current.y > lowest.y ? current : lowest, matchingFlags[0]);
    
    setFallingFlags(prev => prev.filter(f => f.id !== closestFlag.id));
    
    const pointsEarned = 10 + Math.floor(combo / 5) * 5;
    setScore(prev => prev + pointsEarned);
    setCombo(prev => prev + 1);
    
    // Vibrate on mobile
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(20);
    }
    
    // Streak bonuses
    if (combo + 1 === 5) {
      setStreakMessage('🔥 5 in a row! +5 bonus! 🔥');
      setTimeout(() => setStreakMessage(null), 1000);
    } else if (combo + 1 === 10) {
      setStreakMessage('⭐ 10 streak! Extra life! ⭐');
      setLives(prev => prev + 1);
      setTimeout(() => setStreakMessage(null), 1500);
    } else if (combo + 1 === 20) {
      setStreakMessage('🏆 20 streak! Double points! 🏆');
      setTimeout(() => setStreakMessage(null), 1500);
    }
    
    // Earn stamp in main app
    if (onEarnStamp) {
      onEarnStamp(country.id);
    }
  }, [gameState, fallingFlags, combo, onEarnStamp]);
  
  // Miss a flag (hit bottom)
  const missFlag = useCallback((flagId) => {
    setFallingFlags(prev => prev.filter(f => f.id !== flagId));
    setLives(prev => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        endGame();
        return 0;
      }
      return newLives;
    });
    setCombo(0);
    
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
  }, [endGame]);
  
  // Draw canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);
    
    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, dimensions.height);
    grad.addColorStop(0, '#1a4e6e');
    grad.addColorStop(1, '#0d2b4e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);
    
    // Draw falling flags
    fallingFlags.forEach(flag => {
      // Draw circular background
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.arc(flag.x, flag.y, 28, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // Draw flag emoji
      ctx.font = '36px "Segoe UI Emoji"';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#000';
      ctx.fillText(flag.country.flagEmoji, flag.x, flag.y);
    });
    
    // Draw bottom danger zone indicator
    ctx.beginPath();
    ctx.rect(0, dimensions.height - 70, dimensions.width, 70);
    ctx.fillStyle = 'rgba(255, 59, 48, 0.15)';
    ctx.fill();
    
    ctx.font = '12px "Nunito"';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('DANGER ZONE', dimensions.width / 2, dimensions.height - 50);
    
  }, [dimensions, fallingFlags]);
  
  // Animation loop - update flag positions
  useEffect(() => {
    let lastTime = 0;
    
    const animate = (currentTime) => {
      if (lastTime === 0) {
        lastTime = currentTime;
        requestAnimationFrame(animate);
        return;
      }
      
      const deltaTime = Math.min(0.033, (currentTime - lastTime) / 1000);
      lastTime = currentTime;
      
      if (gameState === 'playing') {
        setFallingFlags(prev => {
          const updated = prev.map(flag => ({
            ...flag,
            y: flag.y + flag.speedY * deltaTime
          }));
          
          // Check for flags that hit the bottom (danger zone)
          const missed = updated.filter(f => f.y >= dimensions.height - 65);
          missed.forEach(f => missFlag(f.id));
          
          return updated.filter(f => f.y < dimensions.height - 65);
        });
      }
      
      drawCanvas();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [gameState, dimensions.height, missFlag, drawCanvas]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);
  
  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = Math.min(450, window.innerWidth - 40);
        setDimensions({ 
          width: width, 
          height: Math.min(550, window.innerHeight - 200)
        });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  const activeButtons = gameState === 'playing' ? unlockedCountries.slice(0, 8) : [];
  
  return (
    <div className="flag-catcher-overlay" ref={containerRef}>
      <div className="flag-catcher-container">
        {/* Exit Button */}
        <button className="exit-button" onClick={onClose}>✕</button>
        
        {/* Stats Bar */}
        <div className="stats-bar">
          <div className="score-section">
            <div className="score-label">SCORE</div>
            <div className="score-value">{score}</div>
            <div className="best-label">🏆 BEST: {highScore}</div>
          </div>
          <div className="lives-section">
            {'❤️'.repeat(lives)}{'🖤'.repeat(5 - lives)}
          </div>
        </div>
        
        {/* Next Unlock */}
        {nextUnlockAt && gameState === 'playing' && (
          <div className="next-unlock">
            {nextUnlockAt - score} more points to unlock a new flag!
          </div>
        )}
        
        {/* Streak Message Popup */}
        {streakMessage && (
          <div className="streak-popup">{streakMessage}</div>
        )}
        
        {/* Celebration Popup */}
        {showCelebration && celebrationMessage && (
          <div className="celebration-popup">{celebrationMessage}</div>
        )}
        
        {/* Game Canvas */}
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="game-canvas"
        />
        
        {/* Country Buttons (with flags) */}
        <div className="button-grid">
          {activeButtons.map(country => (
            <button
              key={country.id}
              className="country-button"
              onClick={() => catchFlag(country)}
            >
              <span className="button-flag">{country.flagEmoji}</span>
              <span className="button-name">{country.name}</span>
            </button>
          ))}
        </div>
        
        {/* Title Overlay */}
        {gameState === 'title' && (
          <div className="overlay">
            <h2>🏆 FLAG CATCHER 🏆</h2>
            <p>Catch the falling flags!</p>
            <p>Tap the matching country button before they hit the bottom</p>
            <div className="features">
              <p>🔥 5 in a row = bonus points</p>
              <p>⭐ 10 in a row = extra life</p>
              <p>🎁 Score points to unlock new flags</p>
            </div>
            <button className="start-button" onClick={startGame}>START GAME</button>
          </div>
        )}
        
        {/* Game Over Overlay */}
        {gameState === 'gameOver' && (
          <div className="overlay">
            <h2>🎮 GAME OVER 🎮</h2>
            <p className="final-score">YOUR SCORE: {score}</p>
            <p className="best-score">BEST SCORE: {highScore}</p>
            <button className="start-button" onClick={startGame}>PLAY AGAIN</button>
            <button className="exit-button-overlay" onClick={onClose}>EXIT TO MAP</button>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .flag-catcher-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 10px;
        }
        
        .flag-catcher-container {
          position: relative;
          background: #0d2b4e;
          border-radius: 28px;
          padding: 16px;
          max-width: 500px;
          width: 100%;
          max-height: 95vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px rgba(0,0,0,0.5);
        }
        
        .exit-button {
          position: absolute;
          top: 12px;
          right: 16px;
          background: rgba(255,255,255,0.15);
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 20;
          transition: all 0.2s;
        }
        
        .exit-button:hover {
          background: rgba(255,255,255,0.3);
        }
        
        .stats-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding: 10px 15px;
          background: rgba(255,255,255,0.08);
          border-radius: 20px;
        }
        
        .score-section {
          display: flex;
          flex-direction: column;
        }
        
        .score-label {
          font-size: 10px;
          color: rgba(255,255,255,0.5);
          letter-spacing: 1px;
        }
        
        .score-value {
          font-size: 32px;
          font-weight: 800;
          color: #ffd966;
          line-height: 1;
        }
        
        .best-label {
          font-size: 9px;
          color: rgba(255,255,255,0.4);
        }
        
        .lives-section {
          font-size: 20px;
          letter-spacing: 3px;
        }
        
        .next-unlock {
          text-align: center;
          font-size: 11px;
          color: rgba(255,255,255,0.8);
          margin-bottom: 10px;
          padding: 6px;
          background: rgba(255,215,0,0.15);
          border-radius: 40px;
        }
        
        .streak-popup {
          position: absolute;
          top: 30%;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          font-size: 16px;
          font-weight: bold;
          color: #ffd966;
          background: rgba(0,0,0,0.85);
          padding: 8px 20px;
          border-radius: 40px;
          white-space: nowrap;
          z-index: 25;
          pointer-events: none;
          animation: fadeOut 1s ease-out forwards;
        }
        
        .celebration-popup {
          position: absolute;
          top: 25%;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          color: #ff9800;
          background: rgba(0,0,0,0.85);
          padding: 12px 24px;
          border-radius: 50px;
          white-space: nowrap;
          z-index: 25;
          pointer-events: none;
          animation: fadeOut 1.5s ease-out forwards;
        }
        
        @keyframes fadeOut {
          0% { opacity: 1; transform: translateX(-50%) scale(1); }
          70% { opacity: 1; transform: translateX(-50%) scale(1.05); }
          100% { opacity: 0; transform: translateX(-50%) scale(1.1); }
        }
        
        .game-canvas {
          display: block;
          margin: 0 auto;
          border-radius: 16px;
          background: #0d2b4e;
          cursor: pointer;
          width: 100%;
          height: auto;
        }
        
        .button-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
          margin-top: 15px;
          padding: 8px 0;
        }
        
        .country-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #1e6f5c;
          border: none;
          border-radius: 60px;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.05s linear;
        }
        
        .country-button:active {
          transform: scale(0.94);
          background: #ff9800;
        }
        
        .button-flag {
          font-size: 18px;
        }
        
        .button-name {
          font-size: 12px;
        }
        
        .overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.92);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 28px;
          text-align: center;
          padding: 25px;
          z-index: 30;
        }
        
        .overlay h2 {
          font-size: 26px;
          color: #ffd966;
          margin-bottom: 15px;
        }
        
        .overlay p {
          color: white;
          margin: 6px 0;
          font-size: 13px;
        }
        
        .features {
          margin: 15px 0;
          padding: 10px;
          background: rgba(255,255,255,0.1);
          border-radius: 20px;
        }
        
        .final-score {
          font-size: 36px;
          font-weight: 800;
          color: #ffd966;
          margin: 15px 0 5px;
        }
        
        .best-score {
          font-size: 14px;
          color: rgba(255,255,255,0.6);
          margin-bottom: 25px;
        }
        
        .start-button {
          background: #4caf50;
          color: white;
          border: none;
          padding: 12px 32px;
          border-radius: 60px;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          margin: 8px 0;
          transition: transform 0.1s;
        }
        
        .start-button:active {
          transform: scale(0.96);
        }
        
        .exit-button-overlay {
          background: rgba(255,255,255,0.15);
          color: white;
          border: none;
          padding: 8px 24px;
          border-radius: 60px;
          font-size: 13px;
          cursor: pointer;
          margin-top: 8px;
        }
        
        @media (max-width: 480px) {
          .button-grid {
            gap: 5px;
          }
          .country-button {
            padding: 5px 10px;
          }
          .button-flag {
            font-size: 14px;
          }
          .button-name {
            font-size: 9px;
          }
          .stats-bar {
            padding: 6px 12px;
          }
          .score-value {
            font-size: 24px;
          }
          .lives-section {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
}

export default FlagCatcher;
