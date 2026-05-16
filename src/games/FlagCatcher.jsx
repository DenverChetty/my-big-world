import React, { useState, useEffect, useRef, useCallback } from 'react';

// ============================================
// COUNTRY DATA FOR THE GAME
// ============================================
const countries = [
  { id: "japan", name: "Japan", flagEmoji: "🇯🇵", unlockedAt: 0 },
  { id: "france", name: "France", flagEmoji: "🇫🇷", unlockedAt: 0 },
  { id: "brazil", name: "Brazil", flagEmoji: "🇧🇷", unlockedAt: 0 },
  { id: "australia", name: "Australia", flagEmoji: "🇦🇺", unlockedAt: 30 },
  { id: "egypt", name: "Egypt", flagEmoji: "🇪🇬", unlockedAt: 60 },
  { id: "canada", name: "Canada", flagEmoji: "🇨🇦", unlockedAt: 100 },
  { id: "india", name: "India", flagEmoji: "🇮🇳", unlockedAt: 150 },
  { id: "italy", name: "Italy", flagEmoji: "🇮🇹", unlockedAt: 200 },
  { id: "mexico", name: "Mexico", flagEmoji: "🇲🇽", unlockedAt: 260 },
  { id: "germany", name: "Germany", flagEmoji: "🇩🇪", unlockedAt: 330 }
];

function FlagCatcher({ onClose, onEarnStamp }) {
  const [gameState, setGameState] = useState('title');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [combo, setCombo] = useState(0);
  const [fallingFlags, setFallingFlags] = useState([]);
  const [unlockedCountries, setUnlockedCountries] = useState([]);
  const [nextUnlockAt, setNextUnlockAt] = useState(30);
  const [streakMessage, setStreakMessage] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  
  const spawnIntervalRef = useRef(null);
  const animationRef = useRef(null);
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 380, height: 420 });
  
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
  
  // Update unlocked countries
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
      y: 20,
      speedY: 70 + Math.floor(score / 100) * 10
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
    spawnIntervalRef.current = setInterval(() => spawnFlag(), 1100);
  }, [spawnFlag]);
  
  // End game
  const endGame = useCallback(() => {
    setGameState('gameOver');
    if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
  }, []);
  
  // Catch a flag
  const catchFlag = useCallback((country) => {
    if (gameState !== 'playing') return;
    
    const matchingFlags = fallingFlags.filter(f => f.country.id === country.id);
    if (matchingFlags.length === 0) return;
    
    const closestFlag = matchingFlags.reduce((lowest, current) => 
      current.y > lowest.y ? current : lowest, matchingFlags[0]);
    
    setFallingFlags(prev => prev.filter(f => f.id !== closestFlag.id));
    
    const pointsEarned = 10 + Math.floor(combo / 5) * 5;
    setScore(prev => prev + pointsEarned);
    setCombo(prev => prev + 1);
    
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(20);
    }
    
    if (combo + 1 === 5) {
      setStreakMessage('🔥 5 in a row! +5 bonus! 🔥');
      setTimeout(() => setStreakMessage(null), 1000);
    } else if (combo + 1 === 10) {
      setStreakMessage('⭐ 10 streak! Extra life! ⭐');
      setLives(prev => prev + 1);
      setTimeout(() => setStreakMessage(null), 1500);
    }
    
    if (onEarnStamp) {
      onEarnStamp(country.id);
    }
  }, [gameState, fallingFlags, combo, onEarnStamp]);
  
  // Miss a flag
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
    
    // Background
    const grad = ctx.createLinearGradient(0, 0, 0, dimensions.height);
    grad.addColorStop(0, '#1a4e6e');
    grad.addColorStop(1, '#0d2b4e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);
    
    // Draw falling flags
    fallingFlags.forEach(flag => {
      ctx.beginPath();
      ctx.arc(flag.x, flag.y, 25, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fill();
      ctx.font = '32px "Segoe UI Emoji"';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#000';
      ctx.fillText(flag.country.flagEmoji, flag.x, flag.y);
    });
    
    // Bottom danger zone
    ctx.beginPath();
    ctx.rect(0, dimensions.height - 55, dimensions.width, 55);
    ctx.fillStyle = 'rgba(255, 59, 48, 0.2)';
    ctx.fill();
    
    ctx.font = '10px "Nunito"';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.textAlign = 'center';
    ctx.fillText('DANGER ZONE', dimensions.width / 2, dimensions.height - 35);
    
  }, [dimensions, fallingFlags]);
  
  // Animation loop
  useEffect(() => {
    let lastTime = 0;
    
    const animate = (currentTime) => {
      requestAnimationFrame(animate);
      
      if (lastTime === 0) {
        lastTime = currentTime;
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
          
          const missed = updated.filter(f => f.y >= dimensions.height - 50);
          missed.forEach(f => missFlag(f.id));
          
          return updated.filter(f => f.y < dimensions.height - 50);
        });
      }
      
      drawCanvas();
    };
    
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [gameState, dimensions.height, missFlag, drawCanvas]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);
  
  // Set dimensions
  useEffect(() => {
    setDimensions({ width: 380, height: 420 });
  }, []);
  
  const activeButtons = gameState === 'playing' ? unlockedCountries.slice(0, 6) : [];
  
  return (
    <div className="flag-catcher-overlay">
      <div className="flag-catcher-container">
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
        
        {/* Streak Message */}
        {streakMessage && (
          <div className="streak-popup">{streakMessage}</div>
        )}
        
        {/* Celebration */}
        {showCelebration && celebrationMessage && (
          <div className="celebration-popup">{celebrationMessage}</div>
        )}
        
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="game-canvas"
        />
        
        {/* Country Buttons */}
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
            <button className="close-btn-overlay" onClick={onClose}>✕</button>
            <h2>🏆 FLAG CATCHER 🏆</h2>
            <p>Catch the falling flags!</p>
            <p>Tap the matching country button</p>
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
            <button className="close-btn-overlay" onClick={onClose}>✕</button>
            <h2>🎮 GAME OVER 🎮</h2>
            <p className="final-score">{score}</p>
            <p className="best-score">BEST: {highScore}</p>
            <button className="start-button" onClick={startGame}>PLAY AGAIN</button>
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
        }
        
        .flag-catcher-container {
          position: relative;
          background: #0d2b4e;
          border-radius: 24px;
          padding: 12px;
          width: 420px;
          max-width: 90vw;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
        
        .stats-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          padding: 6px 12px;
          background: rgba(255,255,255,0.08);
          border-radius: 16px;
        }
        
        .score-section {
          display: flex;
          flex-direction: column;
        }
        
        .score-label {
          font-size: 8px;
          color: rgba(255,255,255,0.5);
        }
        
        .score-value {
          font-size: 24px;
          font-weight: 800;
          color: #ffd966;
          line-height: 1;
        }
        
        .best-label {
          font-size: 8px;
          color: rgba(255,255,255,0.4);
        }
        
        .lives-section {
          font-size: 16px;
          letter-spacing: 2px;
        }
        
        .next-unlock {
          text-align: center;
          font-size: 10px;
          color: rgba(255,255,255,0.7);
          margin-bottom: 6px;
          padding: 4px;
          background: rgba(255,215,0,0.15);
          border-radius: 20px;
        }
        
        .streak-popup {
          position: absolute;
          top: 30%;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          font-size: 14px;
          font-weight: bold;
          color: #ffd966;
          background: rgba(0,0,0,0.85);
          padding: 6px 16px;
          border-radius: 30px;
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
          font-size: 14px;
          font-weight: bold;
          color: #ff9800;
          background: rgba(0,0,0,0.85);
          padding: 8px 20px;
          border-radius: 40px;
          white-space: nowrap;
          z-index: 25;
          pointer-events: none;
          animation: fadeOut 1.5s ease-out forwards;
        }
        
        @keyframes fadeOut {
          0% { opacity: 1; transform: translateX(-50%) scale(1); }
          70% { opacity: 1; }
          100% { opacity: 0; transform: translateX(-50%) scale(1.1); }
        }
        
        .game-canvas {
          display: block;
          margin: 0 auto;
          border-radius: 12px;
          background: #0d2b4e;
          width: 100%;
          height: auto;
        }
        
        .button-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          justify-content: center;
          margin-top: 10px;
          padding: 4px 0;
        }
        
        .country-button {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 5px 10px;
          background: #1e6f5c;
          border: none;
          border-radius: 50px;
          color: white;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.05s linear;
        }
        
        .country-button:active {
          transform: scale(0.93);
          background: #ff9800;
        }
        
        .button-flag {
          font-size: 14px;
        }
        
        .button-name {
          font-size: 10px;
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
          border-radius: 24px;
          text-align: center;
          padding: 20px;
          z-index: 30;
        }
        
        .close-btn-overlay {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(255,255,255,0.15);
          border: none;
          color: white;
          font-size: 16px;
          cursor: pointer;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .overlay h2 {
          font-size: 22px;
          color: #ffd966;
          margin-bottom: 10px;
        }
        
        .overlay p {
          color: white;
          margin: 4px 0;
          font-size: 12px;
        }
        
        .features {
          margin: 10px 0;
          padding: 8px;
          background: rgba(255,255,255,0.1);
          border-radius: 16px;
        }
        
        .final-score {
          font-size: 32px;
          font-weight: 800;
          color: #ffd966;
          margin: 10px 0 5px;
        }
        
        .best-score {
          font-size: 12px;
          color: rgba(255,255,255,0.6);
          margin-bottom: 15px;
        }
        
        .start-button {
          background: #4caf50;
          color: white;
          border: none;
          padding: 10px 28px;
          border-radius: 60px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          margin-top: 8px;
        }
        
        .start-button:active {
          transform: scale(0.96);
        }
      `}</style>
    </div>
  );
}

export default FlagCatcher;
