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

function FlagCatcher({ onClose, onEarnStamp, onEarnBadge, currentStamps = [] }) {
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
  const [dimensions, setDimensions] = useState({ width: 350, height: 500 });
  
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
      x: 30 + Math.random() * (dimensions.width - 70),
      y: 30,
      speedY: 70 + Math.floor(score / 100) * 8
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
    } else if (combo + 1 === 20) {
      setStreakMessage('🏆 20 streak! Double points! 🏆');
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
    ctx.fillStyle = '#0d2b4e';
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);
    
    // Draw falling flags
    fallingFlags.forEach(flag => {
      ctx.font = '38px "Segoe UI Emoji"';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.fillText(flag.country.flagEmoji, flag.x, flag.y);
      ctx.shadowBlur = 0;
    });
  }, [dimensions, fallingFlags]);
  
  // Animation loop
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
          
          const missed = updated.filter(f => f.y >= dimensions.height - 85);
          missed.forEach(f => missFlag(f.id));
          
          return updated.filter(f => f.y < dimensions.height - 85);
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
  
  // Cleanup
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
        const maxWidth = Math.min(420, window.innerWidth - 40);
        const maxHeight = window.innerHeight - 80;
        setDimensions({ 
          width: maxWidth, 
          height: Math.min(maxHeight * 0.6, 450)
        });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  const activeButtons = gameState === 'playing' ? unlockedCountries : [];
  
  return (
    <div className="flag-catcher-overlay" ref={containerRef}>
      <div className="flag-catcher-container">
        {/* Exit Button */}
        <button className="exit-button" onClick={onClose}>✕</button>
        
        {/* Stats */}
        <div className="game-stats">
          <div className="score-box">
            <div className="score-label">SCORE</div>
            <div className="score-value">{score}</div>
            <div className="high-score">🏆 {highScore}</div>
          </div>
          <div className="lives-box">
            {'❤️'.repeat(lives)}{'🤍'.repeat(5 - lives)}
          </div>
        </div>
        
        {/* Next unlock */}
        {nextUnlockAt && gameState === 'playing' && (
          <div className="next-unlock">
            {nextUnlockAt - score} pts to next country
          </div>
        )}
        
        {/* Streak message */}
        {streakMessage && (
          <div className="streak-message">{streakMessage}</div>
        )}
        
        {/* Celebration */}
        {showCelebration && celebrationMessage && (
          <div className="celebration-message">{celebrationMessage}</div>
        )}
        
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="game-canvas"
          style={{ width: '100%', height: 'auto', borderRadius: '16px', background: '#0d2b4e' }}
        />
        
        {/* Buttons */}
        <div className="flag-buttons">
          {activeButtons.slice(0, 6).map(country => (
            <button
              key={country.id}
              className="flag-btn"
              onClick={() => catchFlag(country)}
            >
              <span className="flag-emoji">{country.flagEmoji}</span>
              <span className="country-name">{country.name}</span>
            </button>
          ))}
        </div>
        
        {/* Title Screen */}
        {gameState === 'title' && (
          <div className="overlay-screen">
            <h2>🏆 FLAG CATCHER 🏆</h2>
            <p>Catch the falling flags!</p>
            <p>🔥 Streaks = bonus points</p>
            <p>⭐ 10 streak = extra life</p>
            <p>🎁 Unlock new countries</p>
            <button className="start-btn" onClick={startGame}>START</button>
          </div>
        )}
        
        {/* Game Over Screen */}
        {gameState === 'gameOver' && (
          <div className="overlay-screen">
            <h2>🎮 GAME OVER 🎮</h2>
            <p className="final-score">Score: {score}</p>
            <p className="best-score">Best: {highScore}</p>
            <button className="start-btn" onClick={startGame}>PLAY AGAIN</button>
            <button className="menu-btn" onClick={onClose}>EXIT</button>
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
          border-radius: 24px;
          padding: 15px;
          max-width: 450px;
          width: 100%;
          max-height: 95vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
        
        .exit-button {
          position: absolute;
          top: 8px;
          right: 12px;
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }
        
        .game-stats {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          padding: 8px 12px;
          background: rgba(255,255,255,0.1);
          border-radius: 16px;
        }
        
        .score-box {
          display: flex;
          flex-direction: column;
        }
        
        .score-label {
          font-size: 9px;
          color: rgba(255,255,255,0.6);
        }
        
        .score-value {
          font-size: 24px;
          font-weight: bold;
          color: #ffd966;
        }
        
        .high-score {
          font-size: 9px;
          color: rgba(255,255,255,0.6);
        }
        
        .lives-box {
          font-size: 18px;
          letter-spacing: 3px;
        }
        
        .next-unlock {
          text-align: center;
          font-size: 10px;
          color: rgba(255,255,255,0.7);
          margin-bottom: 8px;
          padding: 4px;
          background: rgba(255,215,0,0.15);
          border-radius: 20px;
        }
        
        .streak-message {
          position: absolute;
          top: 35%;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 14px;
          font-weight: bold;
          color: #ffd966;
          background: rgba(0,0,0,0.8);
          padding: 8px;
          border-radius: 30px;
          width: 80%;
          margin: 0 auto;
          z-index: 5;
          pointer-events: none;
        }
        
        .celebration-message {
          position: absolute;
          top: 30%;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 16px;
          font-weight: bold;
          color: #ff9800;
          background: rgba(0,0,0,0.8);
          padding: 10px;
          border-radius: 40px;
          width: 80%;
          margin: 0 auto;
          z-index: 5;
          pointer-events: none;
        }
        
        .game-canvas {
          display: block;
          margin: 0 auto;
          cursor: pointer;
        }
        
        .flag-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          justify-content: center;
          margin-top: 12px;
          padding: 8px 0;
        }
        
        .flag-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #1e6f5c;
          border: none;
          border-radius: 60px;
          color: white;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.1s;
        }
        
        .flag-btn:active {
          transform: scale(0.95);
          background: #ff9800;
        }
        
        .flag-emoji {
          font-size: 14px;
        }
        
        .country-name {
          font-size: 10px;
        }
        
        .overlay-screen {
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
          z-index: 15;
        }
        
        .overlay-screen h2 {
          font-size: 22px;
          color: #ffd966;
          margin-bottom: 15px;
        }
        
        .overlay-screen p {
          color: white;
          margin: 5px 0;
          font-size: 12px;
        }
        
        .final-score {
          font-size: 28px;
          font-weight: bold;
          color: #ffd966;
          margin: 10px 0;
        }
        
        .best-score {
          font-size: 14px;
          color: rgba(255,255,255,0.7);
          margin-bottom: 20px;
        }
        
        .start-btn {
          background: #4caf50;
          color: white;
          border: none;
          padding: 10px 28px;
          border-radius: 60px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          margin: 8px 0;
        }
        
        .menu-btn {
          background: rgba(255,255,255,0.2);
          color: white;
          border: none;
          padding: 8px 20px;
          border-radius: 60px;
          font-size: 12px;
          cursor: pointer;
        }
        
        @media (max-width: 450px) {
          .flag-btn {
            padding: 5px 8px;
          }
          .flag-emoji {
            font-size: 12px;
          }
          .country-name {
            font-size: 8px;
          }
        }
      `}</style>
    </div>
  );
}

export default FlagCatcher;
