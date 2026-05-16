import React, { useState, useEffect, useRef, useCallback } from 'react';

// ============================================
// COUNTRY DATA FOR THE GAME
// ============================================
const countries = [
  { id: "japan", name: "Japan", flag: "🇯🇵", flagEmoji: "🇯🇵", unlockedAt: 0 },
  { id: "france", name: "France", flag: "🇫🇷", flagEmoji: "🇫🇷", unlockedAt: 0 },
  { id: "brazil", name: "Brazil", flag: "🇧🇷", flagEmoji: "🇧🇷", unlockedAt: 0 },
  { id: "australia", name: "Australia", flag: "🇦🇺", flagEmoji: "🇦🇺", unlockedAt: 50 },
  { id: "egypt", name: "Egypt", flag: "🇪🇬", flagEmoji: "🇪🇬", unlockedAt: 50 },
  { id: "canada", name: "Canada", flag: "🇨🇦", flagEmoji: "🇨🇦", unlockedAt: 100 },
  { id: "india", name: "India", flag: "🇮🇳", flagEmoji: "🇮🇳", unlockedAt: 100 },
  { id: "italy", name: "Italy", flag: "🇮🇹", flagEmoji: "🇮🇹", unlockedAt: 200 },
  { id: "mexico", name: "Mexico", flag: "🇲🇽", flagEmoji: "🇲🇽", unlockedAt: 200 },
  { id: "germany", name: "Germany", flag: "🇩🇪", flagEmoji: "🇩🇪", unlockedAt: 300 },
  { id: "spain", name: "Spain", flag: "🇪🇸", flagEmoji: "🇪🇸", unlockedAt: 300 },
  { id: "kenya", name: "Kenya", flag: "🇰🇪", flagEmoji: "🇰🇪", unlockedAt: 400 },
  { id: "argentina", name: "Argentina", flag: "🇦🇷", flagEmoji: "🇦🇷", unlockedAt: 400 },
  { id: "china", name: "China", flag: "🇨🇳", flagEmoji: "🇨🇳", unlockedAt: 500 },
  { id: "thailand", name: "Thailand", flag: "🇹🇭", flagEmoji: "🇹🇭", unlockedAt: 500 },
  { id: "turkey", name: "Turkey", flag: "🇹🇷", flagEmoji: "🇹🇷", unlockedAt: 600 },
  { id: "sweden", name: "Sweden", flag: "🇸🇪", flagEmoji: "🇸🇪", unlockedAt: 600 },
  { id: "norway", name: "Norway", flag: "🇳🇴", flagEmoji: "🇳🇴", unlockedAt: 700 },
  { id: "newzealand", name: "New Zealand", flag: "🇳🇿", flagEmoji: "🇳🇿", unlockedAt: 700 }
];

function FlagCatcher({ onClose, onEarnStamp, onEarnBadge, currentStamps = [] }) {
  // Game state
  const [gameState, setGameState] = useState('title'); // title, playing, gameOver
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [combo, setCombo] = useState(0);
  const [comboPulse, setComboPulse] = useState(0);
  const [fallingFlags, setFallingFlags] = useState([]);
  const [unlockedCountries, setUnlockedCountries] = useState([]);
  const [nextUnlockAt, setNextUnlockAt] = useState(50);
  const [streakMessage, setStreakMessage] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  
  // Refs for animation
  const animationRef = useRef(null);
  const lastTimestampRef = useRef(0);
  const spawnIntervalRef = useRef(0);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  // Dimensions
  const [dimensions, setDimensions] = useState({ width: 400, height: 600 });
  
  // Load high score from localStorage
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
    
    // Find next unlock threshold
    const next = countries.find(c => c.unlockedAt > score);
    setNextUnlockAt(next ? next.unlockedAt : null);
    
    // Check for new country unlock celebration
    const justUnlocked = newUnlocked.find(c => c.unlockedAt > 0 && c.unlockedAt <= score && !unlockedCountries.some(u => u.id === c.id));
    if (justUnlocked) {
      setCelebrationMessage(`🎉 NEW COUNTRY UNLOCKED: ${justUnlocked.name}! 🎉`);
      setShowCelebration(true);
      setTimeout(() => setShowCelebilation(false), 3000);
    }
  }, [score, unlockedCountries]);
  
  // Play sound effect (simple beep using Web Audio)
  const playSound = useCallback((type) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      switch(type) {
        case 'catch':
          oscillator.frequency.value = 880;
          gainNode.gain.value = 0.2;
          oscillator.start();
          gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.1);
          oscillator.stop(audioContext.currentTime + 0.1);
          break;
        case 'miss':
          oscillator.frequency.value = 440;
          gainNode.gain.value = 0.2;
          oscillator.start();
          gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.2);
          oscillator.stop(audioContext.currentTime + 0.2);
          break;
        case 'streak':
          oscillator.frequency.value = 1046.50;
          gainNode.gain.value = 0.15;
          oscillator.start();
          gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.08);
          oscillator.stop(audioContext.currentTime + 0.08);
          break;
        default:
          break;
      }
      
      setTimeout(() => audioContext.close(), 300);
    } catch(e) {
      console.log('Audio error:', e);
    }
  }, []);
  
  // Spawn a falling flag
  const spawnFlag = useCallback(() => {
    if (gameState !== 'playing') return;
    if (unlockedCountries.length === 0) return;
    
    const randomCountry = unlockedCountries[Math.floor(Math.random() * unlockedCountries.length)];
    const width = dimensions.width;
    
    setFallingFlags(prev => [...prev, {
      id: Date.now() + Math.random(),
      country: randomCountry,
      x: 30 + Math.random() * (width - 100),
      y: 30,
      speedY: 120 + (score / 50) * 20 // gets faster as score increases
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
    
    // Initial unlocked countries (score 0)
    const initialUnlocked = countries.filter(c => c.unlockedAt === 0);
    setUnlockedCountries(initialUnlocked);
    
    // Reset spawn interval
    spawnIntervalRef.current = setInterval(() => {
      spawnFlag();
    }, 1000);
  }, [spawnFlag]);
  
  // End game
  const endGame = useCallback(() => {
    setGameState('gameOver');
    if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
  }, []);
  
  // Catch a flag
  const catchFlag = useCallback((countryId, buttonCountry) => {
    if (gameState !== 'playing') return;
    
    // Find the closest flag of that country (lowest y position)
    const matchingFlags = fallingFlags.filter(f => f.country.id === buttonCountry.id);
    if (matchingFlags.length === 0) return;
    
    // Get the lowest (closest to bottom) flag
    const closestFlag = matchingFlags.reduce((lowest, current) => 
      current.y > lowest.y ? current : lowest, matchingFlags[0]);
    
    // Remove the caught flag
    setFallingFlags(prev => prev.filter(f => f.id !== closestFlag.id));
    
    // Update score and combo
    const pointsEarned = 10 + Math.floor(combo / 5) * 5;
    setScore(prev => prev + pointsEarned);
    setCombo(prev => prev + 1);
    setComboPulse(10);
    playSound('catch');
    
    // Vibrate on mobile
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(20);
    }
    
    // Check streak milestones
    if ((combo + 1) === 5) {
      setStreakMessage('🔥 5 in a row! +5 bonus! 🔥');
      setTimeout(() => setStreakMessage(null), 1000);
      playSound('streak');
    } else if ((combo + 1) === 10) {
      setStreakMessage('⭐ 10 streak! Extra life! ⭐');
      setLives(prev => prev + 1);
      setTimeout(() => setStreakMessage(null), 1500);
      playSound('streak');
    } else if ((combo + 1) === 20) {
      setStreakMessage('🏆 20 streak! Double points! 🏆');
      setTimeout(() => setStreakMessage(null), 1500);
      playSound('streak');
    }
    
    // Earn stamp for this country if not already earned
    if (onEarnStamp) {
      onEarnStamp(buttonCountry.id);
    }
  }, [gameState, fallingFlags, combo, playSound, onEarnStamp]);
  
  // Miss a flag (when it reaches bottom)
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
    playSound('miss');
    
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
  }, [endGame, playSound]);
  
  // Update flag positions (animation loop)
  const updateFlags = useCallback((deltaTime) => {
    setFallingFlags(prev => {
      const updated = prev.map(flag => ({
        ...flag,
        y: flag.y + flag.speedY * deltaTime
      }));
      
      // Check for missed flags (reached bottom)
      const missedFlags = updated.filter(f => f.y >= dimensions.height - 80);
      missedFlags.forEach(f => missFlag(f.id));
      
      return updated.filter(f => f.y < dimensions.height - 80);
    });
  }, [dimensions.height, missFlag]);
  
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
        updateFlags(deltaTime);
      }
      
      drawCanvas();
      requestAnimationFrame(animate);
    };
    
    const drawCanvas = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      
      // Draw background gradient
      const grad = ctx.createLinearGradient(0, 0, 0, dimensions.height);
      grad.addColorStop(0, '#1a4e6e');
      grad.addColorStop(1, '#0d2b4e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);
      
      // Draw subtle world map outline in background
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = 'white';
      ctx.font = 'bold 80px "Nunito", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🌍', dimensions.width / 2, dimensions.height / 2);
      ctx.globalAlpha = 1;
      
      // Draw falling flags
      for (const flag of fallingFlags) {
        // Draw flag circle background
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.arc(flag.x, flag.y, 30, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Draw flag emoji
        ctx.font = '36px "Segoe UI Emoji", "Apple Color Emoji"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(flag.country.flagEmoji, flag.x, flag.y);
      }
      
      // Draw combo effect
      if (comboPulse > 0 && combo >= 3) {
        setComboPulse(prev => prev - 1);
        ctx.font = `bold ${24 + comboPulse}px "Nunito", sans-serif`;
        ctx.fillStyle = '#ffd966';
        ctx.shadowBlur = 0;
        ctx.fillText(`⚡ ${combo}x COMBO`, dimensions.width - 100, 80);
      }
      
      // Draw streak message
      if (streakMessage) {
        ctx.font = 'bold 18px "Nunito", sans-serif';
        ctx.fillStyle = '#ffd966';
        ctx.textAlign = 'center';
        ctx.fillText(streakMessage, dimensions.width / 2, 100);
      }
      
      // Draw celebration message
      if (showCelebration && celebrationMessage) {
        ctx.font = 'bold 20px "Nunito", sans-serif';
        ctx.fillStyle = '#ffd966';
        ctx.textAlign = 'center';
        ctx.fillText(celebrationMessage, dimensions.width / 2, 150);
      }
      
      ctx.textAlign = 'left';
    };
    
    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [gameState, fallingFlags, combo, comboPulse, streakMessage, showCelebration, celebrationMessage, dimensions.width, dimensions.height, updateFlags]);
  
  // Set canvas dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = Math.min(500, containerRef.current.clientWidth - 32);
        setDimensions({ width, height: width * 1.5 });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  // Cleanup intervals
  useEffect(() => {
    return () => {
      if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
    };
  }, []);
  
  // Get available buttons (active countries in game)
  const activeButtons = gameState === 'playing' ? unlockedCountries : [];
  
  return (
    <div className="flag-catcher-overlay" ref={containerRef}>
      <div className="flag-catcher-container">
        {/* Close button */}
        <button className="flag-catcher-close" onClick={onClose}>✕</button>
        
        {/* Game canvas */}
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="flag-catcher-canvas"
        />
        
        {/* Score and lives display */}
        <div className="flag-catcher-stats">
          <div className="flag-catcher-score">
            <span className="score-label">SCORE</span>
            <span className="score-value">{score}</span>
            <span className="high-score-label">🏆 BEST: {highScore}</span>
          </div>
          <div className="flag-catcher-lives">
            {'❤️'.repeat(lives)}{'🤍'.repeat(5 - lives)}
          </div>
        </div>
        
        {/* Next unlock teaser */}
        {nextUnlockAt && gameState === 'playing' && (
          <div className="flag-catcher-next-unlock">
            {nextUnlockAt - score} points to unlock new country!
          </div>
        )}
        
        {/* Country buttons */}
        <div className="flag-catcher-buttons">
          {activeButtons.map(country => (
            <button
              key={country.id}
              className="flag-catcher-btn"
              onClick={() => catchFlag(country.id, country)}
            >
              <span className="flag-emoji">{country.flagEmoji}</span>
              <span className="country-name">{country.name}</span>
            </button>
          ))}
        </div>
        
        {/* Title screen */}
        {gameState === 'title' && (
          <div className="flag-catcher-title">
            <h2>🏆 FLAG CATCHER 🏆</h2>
            <p>Catch the falling flags!</p>
            <p>Tap the matching country button before they hit the bottom.</p>
            <p className="game-features">
              🔥 Streaks give bonus points<br />
              ⭐ 10 streak = extra life<br />
              🎁 Unlock new countries as you score
            </p>
            <button className="flag-catcher-start" onClick={startGame}>
              START GAME
            </button>
          </div>
        )}
        
        {/* Game over screen */}
        {gameState === 'gameOver' && (
          <div className="flag-catcher-gameover">
            <h2>🎮 GAME OVER 🎮</h2>
            <p className="final-score">Your score: {score}</p>
            <p className="best-score">Best: {highScore}</p>
            <button className="flag-catcher-play-again" onClick={startGame}>
              PLAY AGAIN
            </button>
            <button className="flag-catcher-menu" onClick={onClose}>
              MAIN MENU
            </button>
          </div>
        )}
        
        <style jsx>{`
          .flag-catcher-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
          }
          
          .flag-catcher-container {
            position: relative;
            background: #0d2b4e;
            border-radius: 32px;
            padding: 20px;
            max-width: 550px;
            width: 95%;
            box-shadow: 0 20px 40px rgba(0,0,0,0.4);
          }
          
          .flag-catcher-close {
            position: absolute;
            top: 10px;
            right: 15px;
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
          }
          
          .flag-catcher-canvas {
            display: block;
            margin: 0 auto;
            border-radius: 16px;
            background: #0d2b4e;
            cursor: pointer;
            width: 100%;
            height: auto;
          }
          
          .flag-catcher-stats {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 10px 0;
            padding: 10px;
            background: rgba(255,255,255,0.1);
            border-radius: 16px;
          }
          
          .flag-catcher-score {
            display: flex;
            flex-direction: column;
          }
          
          .score-label {
            font-size: 10px;
            color: rgba(255,255,255,0.6);
            letter-spacing: 1px;
          }
          
          .score-value {
            font-size: 28px;
            font-weight: bold;
            color: #ffd966;
          }
          
          .high-score-label {
            font-size: 10px;
            color: rgba(255,255,255,0.6);
          }
          
          .flag-catcher-lives {
            font-size: 20px;
            letter-spacing: 4px;
          }
          
          .flag-catcher-next-unlock {
            text-align: center;
            font-size: 11px;
            color: rgba(255,255,255,0.7);
            margin: 5px 0;
            padding: 5px;
            background: rgba(255,215,0,0.15);
            border-radius: 20px;
          }
          
          .flag-catcher-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            justify-content: center;
            margin-top: 15px;
            padding: 10px 0;
          }
          
          .flag-catcher-btn {
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
            transition: transform 0.1s, background 0.2s;
          }
          
          .flag-catcher-btn:active {
            transform: scale(0.95);
            background: #ff9800;
          }
          
          .flag-emoji {
            font-size: 20px;
          }
          
          .country-name {
            font-size: 12px;
          }
          
          .flag-catcher-title {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.85);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border-radius: 32px;
            text-align: center;
            padding: 20px;
            z-index: 5;
          }
          
          .flag-catcher-title h2 {
            font-size: 28px;
            color: #ffd966;
            margin-bottom: 15px;
          }
          
          .flag-catcher-title p {
            color: white;
            margin: 8px 0;
            font-size: 14px;
          }
          
          .game-features {
            margin: 15px 0;
            font-size: 12px;
            color: rgba(255,255,255,0.7);
            line-height: 1.6;
          }
          
          .flag-catcher-start {
            background: #4caf50;
            color: white;
            border: none;
            padding: 12px 32px;
            border-radius: 60px;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            margin-top: 20px;
            transition: transform 0.1s;
          }
          
          .flag-catcher-start:active {
            transform: scale(0.97);
          }
          
          .flag-catcher-gameover {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.9);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border-radius: 32px;
            text-align: center;
            padding: 20px;
            z-index: 5;
          }
          
          .flag-catcher-gameover h2 {
            font-size: 28px;
            color: #ff9800;
            margin-bottom: 15px;
          }
          
          .final-score {
            font-size: 36px;
            font-weight: bold;
            color: #ffd966;
            margin: 10px 0;
          }
          
          .best-score {
            font-size: 16px;
            color: rgba(255,255,255,0.7);
            margin-bottom: 20px;
          }
          
          .flag-catcher-play-again {
            background: #4caf50;
            color: white;
            border: none;
            padding: 12px 32px;
            border-radius: 60px;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            margin: 10px 0;
          }
          
          .flag-catcher-menu {
            background: rgba(255,255,255,0.2);
            color: white;
            border: none;
            padding: 10px 24px;
            border-radius: 60px;
            font-size: 14px;
            cursor: pointer;
          }
          
          @media (max-width: 500px) {
            .flag-catcher-btn {
              padding: 6px 12px;
            }
            .flag-emoji {
              font-size: 16px;
            }
            .country-name {
              font-size: 10px;
            }
          }
        `}</style>
      </div>
    </div>
  );
}

export default FlagCatcher;
