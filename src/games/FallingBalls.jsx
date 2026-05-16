import React, { useState, useEffect, useRef, useCallback } from 'react';

// Colors for the balls
const colors = [
  { id: 'red', name: 'Red', color: '#ff3b30', emoji: '🔴', unlockedAt: 0 },
  { id: 'blue', name: 'Blue', color: '#007aff', emoji: '🔵', unlockedAt: 0 },
  { id: 'green', name: 'Green', color: '#34c759', emoji: '🟢', unlockedAt: 0 },
  { id: 'yellow', name: 'Yellow', color: '#ffcc00', emoji: '🟡', unlockedAt: 30 },
  { id: 'purple', name: 'Purple', color: '#af52de', emoji: '🟣', unlockedAt: 70 },
  { id: 'orange', name: 'Orange', color: '#ff9500', emoji: '🟠', unlockedAt: 120 }
];

function FallingBalls({ onClose }) {
  const [gameState, setGameState] = useState('title');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [combo, setCombo] = useState(0);
  const [balls, setBalls] = useState([]);
  const [unlockedColors, setUnlockedColors] = useState([]);
  const [streakMessage, setStreakMessage] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  
  const spawnIntervalRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 380, height: 400 });
  
  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem('fallingBallsHighScore');
    if (saved) setHighScore(parseInt(saved));
  }, []);
  
  // Save high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('fallingBallsHighScore', score);
    }
  }, [score, highScore]);
  
  // Update unlocked colors
  useEffect(() => {
    const newUnlocked = colors.filter(c => c.unlockedAt <= score);
    setUnlockedColors(newUnlocked);
    
    const justUnlocked = newUnlocked.find(c => c.unlockedAt > 0 && c.unlockedAt <= score && !unlockedColors.some(u => u.id === c.id));
    if (justUnlocked) {
      setCelebrationMessage(`🎉 NEW: ${justUnlocked.name}! 🎉`);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
    }
  }, [score, unlockedColors]);
  
  // Spawn a ball
  const spawnBall = useCallback(() => {
    if (gameState !== 'playing') return;
    if (unlockedColors.length === 0) return;
    
    const randomColor = unlockedColors[Math.floor(Math.random() * unlockedColors.length)];
    
    setBalls(prev => [...prev, {
      id: Date.now() + Math.random(),
      color: randomColor,
      x: 20 + Math.random() * (dimensions.width - 70),
      y: 0,
      speedY: 60 + Math.floor(score / 200) * 10
    }]);
  }, [gameState, unlockedColors, dimensions.width, score]);
  
  // Start game
  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setLives(5);
    setCombo(0);
    setBalls([]);
    setStreakMessage(null);
    
    const initialUnlocked = colors.filter(c => c.unlockedAt === 0);
    setUnlockedColors(initialUnlocked);
    
    if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
    spawnIntervalRef.current = setInterval(() => spawnBall(), 1000);
  }, [spawnBall]);
  
  // End game
  const endGame = useCallback(() => {
    setGameState('gameOver');
    if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
  }, []);
  
  // Catch a ball
  const catchBall = useCallback((color) => {
    if (gameState !== 'playing') return;
    
    const matchingBalls = balls.filter(b => b.color.id === color.id);
    if (matchingBalls.length === 0) return;
    
    const closestBall = matchingBalls.reduce((lowest, current) => 
      current.y > lowest.y ? current : lowest, matchingBalls[0]);
    
    setBalls(prev => prev.filter(b => b.id !== closestBall.id));
    
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
  }, [gameState, balls, combo]);
  
  // Miss a ball
  const missBall = useCallback((ballId) => {
    setBalls(prev => prev.filter(b => b.id !== ballId));
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
  
  // Update ball positions
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
        setBalls(prev => {
          const updated = prev.map(ball => ({
            ...ball,
            y: ball.y + ball.speedY * deltaTime
          }));
          
          const missed = updated.filter(b => b.y >= dimensions.height - 50);
          missed.forEach(b => missBall(b.id));
          
          return updated.filter(b => b.y < dimensions.height - 50);
        });
      }
    };
    
    animate();
    return () => {};
  }, [gameState, dimensions.height, missBall]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
    };
  }, []);
  
  // Set dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({ 
          width: containerRef.current.clientWidth - 24, 
          height: 380 
        });
      }
    };
    updateDimensions();
  }, []);
  
  const activeButtons = gameState === 'playing' ? unlockedColors.slice(0, 6) : [];
  
  return (
    <div className="falling-balls-overlay">
      <div className="falling-balls-container" ref={containerRef}>
        {/* Exit Button */}
        <button className="exit-btn" onClick={onClose}>✕</button>
        
        {/* Stats */}
        <div className="stats">
          <div className="score">
            <div>SCORE</div>
            <div className="score-value">{score}</div>
            <div className="best">🏆 {highScore}</div>
          </div>
          <div className="lives">
            {'❤️'.repeat(lives)}{'🖤'.repeat(5 - lives)}
          </div>
        </div>
        
        {/* Next Unlock */}
        {(() => {
          const next = colors.find(c => c.unlockedAt > score);
          return next && gameState === 'playing' ? (
            <div className="next-unlock">
              {next.unlockedAt - score} points to unlock {next.name}!
            </div>
          ) : null;
        })()}
        
        {/* Messages */}
        {streakMessage && <div className="streak-msg">{streakMessage}</div>}
        {showCelebration && celebrationMessage && (
          <div className="celebration-msg">{celebrationMessage}</div>
        )}
        
        {/* Game Area */}
        <div 
          className="game-area"
          style={{ height: dimensions.height, position: 'relative', background: '#0d2b4e', borderRadius: '16px', overflow: 'hidden' }}
        >
          {balls.map(ball => (
            <div
              key={ball.id}
              className="ball"
              style={{
                position: 'absolute',
                left: ball.x,
                top: ball.y,
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: ball.color.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                transition: 'top 0.02s linear'
              }}
            >
              {ball.color.emoji}
            </div>
          ))}
          <div className="danger-zone">
            DANGER ZONE
          </div>
        </div>
        
        {/* Color Buttons */}
        <div className="buttons">
          {activeButtons.map(color => (
            <button
              key={color.id}
              className="color-btn"
              style={{ background: color.color }}
              onClick={() => catchBall(color)}
            >
              <span>{color.emoji}</span>
              <span>{color.name}</span>
            </button>
          ))}
        </div>
        
        {/* Title Overlay */}
        {gameState === 'title' && (
          <div className="overlay">
            <h2>🎨 COLOR CATCHER 🎨</h2>
            <p>Catch the falling balls!</p>
            <p>Tap the matching color button</p>
            <div className="features">
              <p>🔥 5 in a row = bonus points</p>
              <p>⭐ 10 in a row = extra life</p>
              <p>🎁 Unlock new colors</p>
            </div>
            <button className="start-btn" onClick={startGame}>START</button>
          </div>
        )}
        
        {/* Game Over Overlay */}
        {gameState === 'gameOver' && (
          <div className="overlay">
            <h2>🎮 GAME OVER 🎮</h2>
            <p className="final-score">{score}</p>
            <p className="best-score">BEST: {highScore}</p>
            <button className="start-btn" onClick={startGame}>PLAY AGAIN</button>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .falling-balls-overlay {
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
        
        .falling-balls-container {
          position: relative;
          background: #0d2b4e;
          border-radius: 24px;
          padding: 12px;
          width: 420px;
          max-width: 90vw;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
        
        .exit-btn {
          position: absolute;
          top: 8px;
          right: 12px;
          background: rgba(255,255,255,0.15);
          border: none;
          color: white;
          font-size: 16px;
          cursor: pointer;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          z-index: 20;
        }
        
        .stats {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          padding: 6px 12px;
          background: rgba(255,255,255,0.08);
          border-radius: 16px;
        }
        
        .score {
          font-size: 10px;
          color: rgba(255,255,255,0.6);
        }
        
        .score-value {
          font-size: 24px;
          font-weight: bold;
          color: #ffd966;
          line-height: 1;
        }
        
        .best {
          font-size: 9px;
        }
        
        .lives {
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
        
        .streak-msg {
          position: absolute;
          top: 30%;
          left: 50%;
          transform: translateX(-50%);
          font-size: 14px;
          font-weight: bold;
          color: #ffd966;
          background: rgba(0,0,0,0.85);
          padding: 6px 16px;
          border-radius: 30px;
          white-space: nowrap;
          z-index: 25;
          animation: fadeOut 1s ease-out forwards;
        }
        
        .celebration-msg {
          position: absolute;
          top: 25%;
          left: 50%;
          transform: translateX(-50%);
          font-size: 14px;
          font-weight: bold;
          color: #ff9800;
          background: rgba(0,0,0,0.85);
          padding: 8px 20px;
          border-radius: 40px;
          white-space: nowrap;
          z-index: 25;
          animation: fadeOut 1.5s ease-out forwards;
        }
        
        @keyframes fadeOut {
          0% { opacity: 1; transform: translateX(-50%) scale(1); }
          70% { opacity: 1; }
          100% { opacity: 0; transform: translateX(-50%) scale(1.1); }
        }
        
        .game-area {
          position: relative;
          margin: 8px 0;
          border-radius: 16px;
          overflow: hidden;
        }
        
        .danger-zone {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 45px;
          background: rgba(255, 59, 48, 0.2);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 8px;
          font-size: 10px;
          color: rgba(255,255,255,0.4);
        }
        
        .buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          justify-content: center;
          margin-top: 10px;
        }
        
        .color-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 12px;
          border: none;
          border-radius: 50px;
          color: white;
          font-size: 12px;
          font-weight: bold;
          cursor: pointer;
          transition: 0.05s linear;
          text-shadow: 0 1px 1px rgba(0,0,0,0.3);
        }
        
        .color-btn:active {
          transform: scale(0.93);
          filter: brightness(0.9);
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
          font-weight: bold;
          color: #ffd966;
          margin: 10px 0 5px;
        }
        
        .best-score {
          font-size: 12px;
          color: rgba(255,255,255,0.6);
          margin-bottom: 15px;
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
          margin-top: 8px;
        }
        
        .start-btn:active {
          transform: scale(0.96);
        }
      `}</style>
    </div>
  );
}

export default FallingBalls;
