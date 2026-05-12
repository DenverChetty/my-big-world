import React, { useState, useEffect, useRef } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';

// ============================================
// COUNTRY DATA (20 countries) — KEEP YOUR EXISTING DATA
// ============================================

// [YOUR EXISTING countriesData GOES HERE — DO NOT CHANGE]

const nameToId = {
  "Japan": "japan", "France": "france", "Brazil": "brazil", "Australia": "australia",
  "Egypt": "egypt", "Canada": "canada", "India": "india", "Kenya": "kenya",
  "Italy": "italy", "Mexico": "mexico", "Germany": "germany", "Spain": "spain",
  "South Africa": "southafrica", "Argentina": "argentina", "China": "china",
  "Thailand": "thailand", "Turkey": "turkey", "Sweden":  "sweden",
  "Norway": "norway", "New Zealand": "newzealand"
};

const supportedCountries = Object.keys(nameToId);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [stamps, setStamps] = useState([]);
  const [clickedCountries, setClickedCountries] = useState({});
  const [showParentGate, setShowParentGate] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState("");
  const [mapResetKey, setMapResetKey] = useState(0);
  const [showMathGate, setShowMathGate] = useState(false);
  const [mathQuestion, setMathQuestion] = useState({ text: "", answer: 0 });
  const [mathAnswer, setMathAnswer] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const celebrationTriggered = useRef(false);

  // Preload voices
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  // Load stamps from localStorage
  useEffect(() => {
    const savedStamps = localStorage.getItem('myBigWorldStamps');
    const savedClicked = localStorage.getItem('myBigWorldClicked');
    if (savedStamps) setStamps(JSON.parse(savedStamps));
    if (savedClicked) setClickedCountries(JSON.parse(savedClicked));
    setLoading(false);
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem('myBigWorldStamps', JSON.stringify(stamps));
    localStorage.setItem('myBigWorldClicked', JSON.stringify(clickedCountries));
  }, [stamps, clickedCountries]);

  // Badge milestones
  useEffect(() => {
    if (stamps.length === 10 && !celebrationTriggered.current) {
      celebrationTriggered.current = true;
      setCelebrationMessage("🏆 NOVICE EXPLORER! You've collected 10 stamps!");
      setShowCelebration(true);
      const utterance = new SpeechSynthesisUtterance("Amazing! You're a Novice Explorer!");
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
      setTimeout(() => setShowCelebration(false), 4000);
    } else if (stamps.length === 20 && !celebrationTriggered.current) {
      celebrationTriggered.current = true;
      setCelebrationMessage("🏆 EXPLORER! You've collected 20 stamps!");
      setShowCelebration(true);
      const utterance = new SpeechSynthesisUtterance("Fantastic! You're an Explorer!");
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
      setTimeout(() => setShowCelebration(false), 4000);
    }
  }, [stamps]);

  // ============================================
  // MAP FUNCTIONS
  // ============================================
  const handleCountryClick = (geo) => {
    const countryName = geo.properties?.name;
    const countryId = nameToId[countryName];
    if (countryId && countriesData[countryId]) {
      setSelectedCountry(countriesData[countryId]);
      setClickedCountries(prev => ({ ...prev, [countryId]: true }));
      if (!stamps.includes(countryId)) {
        setStamps(prev => [...prev, countryId]);
      }
    } else {
      setSelectedCountry({
        id: "unknown", name: countryName || "This country", flagEmoji: "🌍",
        funFact: "We're adding facts for this country soon!", capital: "Coming soon",
        population: "Coming soon", language: "Coming soon", hello: "Hello!",
        animal: "Unknown", animalEmoji: "🦄", food: "Unknown", foodEmoji: "🍽️"
      });
    }
  };

  const getCountryColor = (geo) => {
    const countryName = geo.properties?.name;
    const countryId = nameToId[countryName];
    if (!countryId) return "#d3d3d3";
    if (clickedCountries[countryId]) return "#ff9800";
    return "#4caf50";
  };

  const resetMapView = () => {
    setMapResetKey(prev => prev + 1);
    setClickedCountries({});
    setShowResetConfirm(false);
  };

  const resetAllProgress = () => {
    if (window.confirm("⚠️ Reset ALL progress? This will clear all stamps and badges. This cannot be undone.")) {
      setStamps([]);
      setClickedCountries({});
      celebrationTriggered.current = false;
    }
  };

  const getTierBadge = () => {
    if (stamps.length >= 10 && stamps.length < 20) return { name: "NOVICE EXPLORER", emoji: "🌱" };
    if (stamps.length >= 20) return { name: "EXPLORER", emoji: "🏆" };
    return null;
  };
  const tier = getTierBadge();

  // ============================================
  // MATH GATE FUNCTIONS
  // ============================================
  const generateMathQuestion = () => {
    const operations = [
      { type: '+', func: (a, b) => a + b },
      { type: '-', func: (a, b) => a - b },
      { type: '×', func: (a, b) => a * b }
    ];
    const op = operations[Math.floor(Math.random() * operations.length)];
    let a, b;
    if (op.type === '×') {
      a = Math.floor(Math.random() * 9) + 1;
      b = Math.floor(Math.random() * 9) + 1;
    } else {
      a = Math.floor(Math.random() * 20) + 1;
      b = Math.floor(Math.random() * a) + 1;
    }
    const text = `${a} ${op.type} ${b} = ?`;
    const answer = op.func(a, b);
    setMathQuestion({ text, answer });
  };

  const checkMathGate = (action) => {
    setPendingAction(action);
    generateMathQuestion();
    setShowMathGate(true);
  };

  const verifyMath = () => {
    if (parseInt(mathAnswer) === mathQuestion.answer) {
      setShowMathGate(false);
      setMathAnswer("");
      if (pendingAction === 'donate') {
        window.open('https://www.paypal.com/donate?hosted_button_id=JWKA5H7X7EL2Y', '_blank');
      } else if (pendingAction === 'parents') {
        setShowParentGate(true);
      }
      setPendingAction(null);
    } else {
      alert("Oops! That's not right. Ask a grown-up for help.");
      generateMathQuestion();
      setMathAnswer("");
    }
  };

  // ============================================
  // AUDIO FUNCTIONS
  // ============================================
  const getLanguageCode = (language) => {
    const codes = {
      'Japanese': 'ja-JP', 'French': 'fr-FR', 'Portuguese': 'pt-BR',
      'Arabic': 'ar-EG', 'Hindi': 'hi-IN', 'Swahili': 'sw-KE',
      'Italian': 'it-IT', 'Spanish': 'es-ES', 'German': 'de-DE',
      'Mandarin': 'zh-CN', 'Thai': 'th-TH', 'Turkish': 'tr-TR',
      'Swedish': 'sv-SE', 'Norwegian': 'nb-NO'
    };
    return codes[language] || 'en-US';
  };

  const selectBestVoice = (utterance) => {
    const voices = window.speechSynthesis.getVoices();
    const preferred = ['Google UK English Female', 'Google US English Female', 'Microsoft Jenny', 'Microsoft Susan', 'Samantha'];
    for (const p of preferred) {
      const voice = voices.find(v => v.name?.includes(p));
      if (voice) { utterance.voice = voice; return; }
    }
    const female = voices.find(v => v.lang?.startsWith('en') && v.name?.includes('Female'));
    if (female) utterance.voice = female;
  };

  const speakCountryInfo = (country) => {
    window.speechSynthesis.cancel();
    if (country.id === "unknown") {
      const u = new SpeechSynthesisUtterance(`${country.name} is coming soon.`);
      u.rate = 0.9; u.pitch = 1.0;
      selectBestVoice(u);
      window.speechSynthesis.speak(u);
      return;
    }
    const helloToSay = country.helloPhonetic || country.hello;
    const text = `${country.name}. The capital is ${country.capital}. ${country.name} has about ${country.population} people. The language is ${country.language}. To say hello, you say ${helloToSay}. The ${country.animal} lives here. People eat ${country.food}. Did you know? ${country.funFact}`;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9; u.pitch = 1.0;
    selectBestVoice(u);
    window.speechSynthesis.speak(u);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">🐼🐼</div>
        <p>Loading My Big World...</p>
      </div>
    );
  }

  if (showIntro) {
    return (
      <div className="intro-overlay">
        <div style={{ textAlign: 'center', padding: '2rem', width: '90%', maxWidth: '450px', margin: '0 auto' }}>
          <img src="/logo.png" alt="Penny & Peter Panda" style={{ width: '300px', height: 'auto', marginBottom: '1.5rem' }} />
          
          <div style={{ color: 'white', marginBottom: '1.5rem' }}>
            <p style={{ margin: '0.5rem 0', fontSize: '1rem' }}>✨ Hi! We're Penny and Peter! ✨</p>
            <p style={{ margin: '0.5rem 0', fontSize: '1rem' }}>We explore countries, collect stamps, and learn new languages!</p>
            <p style={{ margin: '0.5rem 0', fontSize: '1rem', fontWeight: 'bold' }}>Want to come with us?</p>
          </div>
          
          <button 
            onClick={() => setShowIntro(false)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '0.85rem',
              borderRadius: '60px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            Continue as Guest
          </button>
          
          <p style={{ color: '#ffd966', fontSize: '0.75rem', margin: '0.5rem 0 0.25rem' }}>
            🔐 Stamps save on this device
          </p>
        </div>
      </div>
    );
  }

  // Return your main app here (map, stamp shelf, footer, modals — same as before)
  // [The rest of your working App component JSX goes here]
}

export default App;
