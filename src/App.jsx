import React, { useState, useEffect, useRef } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { auth, db, googleProvider, doc, getDoc, setDoc, updateDoc } from './firebase-config';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

// ============================================
// COUNTRY DATA (20 countries)
// ============================================
const countriesData = {
  "japan": { id: "japan", name: "Japan", capital: "Tokyo", population: "125 million", language: "Japanese", hello: "Konnichiwa", helloPhonetic: "Kohn-nee-chee-wah", animal: "Snow Monkey", animalEmoji: "🐒", food: "Sushi", foodEmoji: "🍣", funFact: "Japan has sooooo many islands — over 6,800! You couldn't visit them all in a whole year.", flagEmoji: "🇯🇵", continent: "Asia" },
  "france": { id: "france", name: "France", capital: "Paris", population: "68 million", language: "French", hello: "Bonjour", helloPhonetic: "Bohn-zhoor", animal: "Gallic Rooster", animalEmoji: "🐓", food: "Baguette", foodEmoji: "🥖", funFact: "France makes over 1,000 kinds of cheese! That's a different cheese for every day of the year, plus more.", flagEmoji: "🇫🇷", continent: "Europe" },
  "brazil": { id: "brazil", name: "Brazil", capital: "Brasília", population: "213 million", language: "Portuguese", hello: "Olá", helloPhonetic: "Oh-lah", animal: "Jaguar", animalEmoji: "🐆", food: "Feijoada", foodEmoji: "🍲", funFact: "Brazil has the most animals and plants of any country. The Amazon rainforest is like a giant treasure chest full of surprises!", flagEmoji: "🇧🇷", continent: "South America" },
  "australia": { id: "australia", name: "Australia", capital: "Canberra", population: "25 million", language: "English", hello: "G'day", helloPhonetic: "Guh-day", animal: "Kangaroo", animalEmoji: "🦘", food: "Vegemite", foodEmoji: "🍞", funFact: "Australia is both a country AND a continent — the only one in the whole world!", flagEmoji: "🇦🇺", continent: "Oceania" },
  "egypt": { id: "egypt", name: "Egypt", capital: "Cairo", population: "109 million", language: "Arabic", hello: "Marhaba", helloPhonetic: "Mar-hah-bah", animal: "Mau Cat", animalEmoji: "🐱", food: "Koshari", foodEmoji: "🍚", funFact: "The Great Pyramid was the tallest thing on Earth for over 3,800 years! That's older than your grandparents' grandparents.", flagEmoji: "🇪🇬", continent: "Africa" },
  "canada": { id: "canada", name: "Canada", capital: "Ottawa", population: "38 million", language: "English/French", hello: "Hello/Bonjour", helloPhonetic: "Heh-loh / Bohn-zhoor", animal: "Beaver", animalEmoji: "🦫", food: "Poutine", foodEmoji: "🍟", funFact: "Canada has so many lakes — over 2 million! You could splash in a new one every single day for years.", flagEmoji: "🇨🇦", continent: "North America" },
  "india": { id: "india", name: "India", capital: "New Delhi", population: "1.4 billion", language: "Hindi", hello: "Namaste", helloPhonetic: "Nah-mah-stay", animal: "Bengal Tiger", animalEmoji: "🐅", food: "Biryani", foodEmoji: "🍛", funFact: "India has 22 official languages! So many different ways to say hello.", flagEmoji: "🇮🇳", continent: "Asia" },
  "kenya": { id: "kenya", name: "Kenya", capital: "Nairobi", population: "54 million", language: "Swahili", hello: "Jambo", helloPhonetic: "Jahm-boh", animal: "Lion", animalEmoji: "🦁", food: "Nyama Choma", foodEmoji: "🍖", funFact: "Every year, over 1.5 million animals march across Kenya's plains — the biggest animal parade on Earth!", flagEmoji: "🇰🇪", continent: "Africa" },
  "italy": { id: "italy", name: "Italy", capital: "Rome", population: "60 million", language: "Italian", hello: "Ciao", helloPhonetic: "Chow", animal: "Wolf", animalEmoji: "🐺", food: "Pizza", foodEmoji: "🍕", funFact: "Italy has more cool old places than any other country — over 50! Castles, towers, and ancient buildings everywhere.", flagEmoji: "🇮🇹", continent: "Europe" },
  "mexico": { id: "mexico", name: "Mexico", capital: "Mexico City", population: "126 million", language: "Spanish", hello: "Hola", helloPhonetic: "Oh-lah", animal: "Golden Eagle", animalEmoji: "🦅", food: "Tacos", foodEmoji: "🌮", funFact: "Mexico has 68 official languages! Spanish is just one of them.", flagEmoji: "🇲🇽", continent: "North America" },
  "germany": { id: "germany", name: "Germany", capital: "Berlin", population: "83 million", language: "German", hello: "Hallo", helloPhonetic: "Hah-loh", animal: "Eagle", animalEmoji: "🦅", food: "Bratwurst", foodEmoji: "🌭", funFact: "Germany has over 1,500 kinds of sausages! That's more sausages than you could ever eat.", flagEmoji: "🇩🇪", continent: "Europe" },
  "spain": { id: "spain", name: "Spain", capital: "Madrid", population: "47 million", language: "Spanish", hello: "Hola", helloPhonetic: "Oh-lah", animal: "Bull", animalEmoji: "🐂", food: "Paella", foodEmoji: "🥘", funFact: "Spain makes more olive oil than any other country. That's a whole lot of olives!", flagEmoji: "🇪🇸", continent: "Europe" },
  "southafrica": { id: "southafrica", name: "South Africa", capital: "Pretoria", population: "60 million", language: "11 official", hello: "Sawubona", helloPhonetic: "Sah-woo-boh-nah", animal: "Springbok", animalEmoji: "🦌", food: "Biltong", foodEmoji: "🥩", funFact: "South Africa has three capital cities! Pretoria, Cape Town, and Bloemfontein. That's more than any other country!", flagEmoji: "🇿🇦", continent: "Africa" },
  "argentina": { id: "argentina", name: "Argentina", capital: "Buenos Aires", population: "45 million", language: "Spanish", hello: "Hola", helloPhonetic: "Oh-lah", animal: "Jaguar", animalEmoji: "🐆", food: "Asado", foodEmoji: "🥩", funFact: "Argentina has the widest river in the world — so wide you can't see the other side!", flagEmoji: "🇦🇷", continent: "South America" },
  "china": { id: "china", name: "China", capital: "Beijing", population: "1.4 billion", language: "Mandarin", hello: "Nǐ hǎo", helloPhonetic: "Nee how", animal: "Giant Panda", animalEmoji: "🐼", food: "Dumplings", foodEmoji: "🥟", funFact: "China has more people than any other country — over 1.4 billion! That's a whole lot of friends to make.", flagEmoji: "🇨🇳", continent: "Asia" },
  "thailand": { id: "thailand", name: "Thailand", capital: "Bangkok", population: "70 million", language: "Thai", hello: "Sawasdee", helloPhonetic: "Sah-wah-dee", animal: "Elephant", animalEmoji: "🐘", food: "Pad Thai", foodEmoji: "🍜", funFact: "Thailand is called the 'Land of Smiles' because everyone is so friendly there!", flagEmoji: "🇹🇭", continent: "Asia" },
  "turkey": { id: "turkey", name: "Turkey", capital: "Ankara", population: "84 million", language: "Turkish", hello: "Merhaba", helloPhonetic: "Mehr-hah-bah", animal: "Wolf", animalEmoji: "🐺", food: "Kebab", foodEmoji: "🍖", funFact: "Istanbul is the only city in the world that sits on two continents — Europe and Asia!", flagEmoji: "🇹🇷", continent: "Europe/Asia" },
  "sweden": { id: "sweden", name: "Sweden", capital: "Stockholm", population: "10 million", language: "Swedish", hello: "Hej", helloPhonetic: "Hay", animal: "Moose", animalEmoji: "🦌", food: "Meatballs", foodEmoji: "🍝", funFact: "Sweden has over 100,000 lakes! That's more lakes than you could ever visit.", flagEmoji: "🇸🇪", continent: "Europe" },
  "norway": { id: "norway", name: "Norway", capital: "Oslo", population: "5 million", language: "Norwegian", hello: "Hei", helloPhonetic: "Hay", animal: "Moose", animalEmoji: "🦌", food: "Salmon", foodEmoji: "🐟", funFact: "Norway has the longest coastline in Europe — so long you could walk for months and never reach the end!", flagEmoji: "🇳🇴", continent: "Europe" },
  "newzealand": { id: "newzealand", name: "New Zealand", capital: "Wellington", population: "5 million", language: "English/Maori", hello: "Kia ora", helloPhonetic: "Kee-ah oh-rah", animal: "Kiwi", animalEmoji: "🐦", food: "Fish and chips", foodEmoji: "🐟", funFact: "New Zealand has more sheep than people! For every person, there are about five sheep. Baa!", flagEmoji: "🇳🇿", continent: "Oceania" }
};

const nameToId = {
  "Japan": "japan", "France": "france", "Brazil": "brazil", "Australia": "australia",
  "Egypt": "egypt", "Canada": "canada", "India": "india", "Kenya": "kenya",
  "Italy": "italy", "Mexico": "mexico", "Germany": "germany", "Spain": "spain",
  "South Africa": "southafrica", "Argentina": "argentina", "China": "china",
  "Thailand": "thailand", "Turkey": "turkey", "Sweden": "sweden",
  "Norway": "norway", "New Zealand": "newzealand"
};

const supportedCountries = Object.keys(nameToId);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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

  // Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setStamps(data.stamps || []);
          setClickedCountries(data.clickedCountries || {});
        }
      } else {
        const savedStamps = localStorage.getItem('myBigWorldStamps');
        const savedClicked = localStorage.getItem('myBigWorldClicked');
        if (savedStamps) setStamps(JSON.parse(savedStamps));
        if (savedClicked) setClickedCountries(JSON.parse(savedClicked));
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Save progress
  useEffect(() => {
    if (user) {
      setDoc(doc(db, "users", user.uid), {
        stamps: stamps,
        clickedCountries: clickedCountries,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
    } else {
      localStorage.setItem('myBigWorldStamps', JSON.stringify(stamps));
      localStorage.setItem('myBigWorldClicked', JSON.stringify(clickedCountries));
    }
  }, [stamps, clickedCountries, user]);

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

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
    } catch (error) {
      console.error("Google sign in failed:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
    setStamps([]);
    setClickedCountries({});
  };

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
        <img src="/logo.png" alt="Penny & Peter Panda" style={{ width: '120px', height: 'auto', marginBottom: '1.5rem' }} />
        
        <div style={{ color: 'white', marginBottom: '1.5rem' }}>
          <p style={{ margin: '0.5rem 0', fontSize: '1rem' }}>✨ Hi! We're Penny and Peter! ✨</p>
          <p style={{ margin: '0.5rem 0', fontSize: '1rem' }}>We explore countries, collect stamps, and learn new languages!</p>
          <p style={{ margin: '0.5rem 0', fontSize: '1rem', fontWeight: 'bold' }}>Want to come with us?</p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <button 
            onClick={handleGoogleSignIn}
            style={{
              background: '#4285f4',
              color: 'white',
              border: 'none',
              padding: '0.85rem',
              borderRadius: '60px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}
          >
            <span style={{ background: 'white', color: '#4285f4', width: '24px', height: '24px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>G</span>
            Sign in with Google
          </button>
          
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
        </div>
        
        <p style={{ color: '#ffd966', fontSize: '0.75rem', margin: '0.5rem 0 0.25rem' }}>
          🔐 Sign in to save your stamps on any device
        </p>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', margin: '0' }}>
          Guest mode saves progress on this device only
        </p>
      </div>
    </div>
  );
}

  return (
    <div className="app">
      {showCelebration && (
        <div className="celebration-overlay">
          <div className="celebration-content">
            <div className="celebration-badge">{celebrationMessage.includes("NOVICE") ? "🌱" : "🏆"} {celebrationMessage}</div>
            <button className="celebration-btn" onClick={() => setShowCelebration(false)}>Continue Exploring →</button>
          </div>
        </div>
      )}

      {showResetConfirm && (
        <div className="modal-overlay">
          <div className="modal reset-modal">
            <button className="modal-close" onClick={() => setShowResetConfirm(false)}>✕</button>
            <div className="reset-icon">🗺️</div>
            <h3>Reset Map View?</h3>
            <p>This returns the map and resets explored countries back to green.</p>
            <p className="reset-note">Your stamps and badges will NOT be affected.</p>
            <div className="reset-buttons">
              <button className="reset-cancel" onClick={() => setShowResetConfirm(false)}>Cancel</button>
              <button className="reset-confirm" onClick={resetMapView}>Yes, Reset Map</button>
            </div>
          </div>
        </div>
      )}

      {showMathGate && (
        <div className="modal-overlay">
          <div className="modal math-modal">
            <button className="modal-close" onClick={() => setShowMathGate(false)}>✕</button>
            <div className="math-icon">🔒</div>
            <h3>Are you a grown-up?</h3>
            <p className="math-question">{mathQuestion.text}</p>
            <input
              type="number"
              className="math-input"
              value={mathAnswer}
              onChange={(e) => setMathAnswer(e.target.value)}
              placeholder="Enter your answer"
              onKeyPress={(e) => e.key === 'Enter' && verifyMath()}
              autoFocus
            />
            <button className="math-verify-btn" onClick={verifyMath}>Verify</button>
            <p className="math-note">This helps us make sure only grown-ups donate.</p>
            <p className="math-note">If you can't donate, that's okay. My Big World is free forever.</p>
          </div>
        </div>
      )}

     <header className="header">
  <img src="/logo.png" alt="Penny & Peter Panda" className="header-logo" />
</header>

      <div className="main-container">
        <section className="map-section">
          <div className="map-container">
            <div className="map-header">
              <div className="map-title">🗺️ World Map</div>
              <button className="map-reset-btn" onClick={() => setShowResetConfirm(true)}>🔄 Reset View</button>
            </div>
            <ComposableMap key={mapResetKey} projection="geoMercator" projectionConfig={{ scale: 100, center: [0, 20] }}>
              <ZoomableGroup zoom={1} minZoom={0.8} maxZoom={4} center={[0, 20]}>
                <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json">
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const countryName = geo.properties?.name;
                      const isSupported = supportedCountries.includes(countryName);
                      const fillColor = isSupported ? getCountryColor(geo) : "#d3d3d3";
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          onClick={() => handleCountryClick(geo)}
                          style={{
                            default: { fill: fillColor, stroke: "#fff", strokeWidth: 0.5, cursor: isSupported ? "pointer" : "default" },
                            hover: { fill: isSupported ? "#ffd966" : "#e0e0e0" },
                            pressed: { fill: isSupported ? "#ff9800" : "#d3d3d3" }
                          }}
                        />
                      );
                    })
                  }
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>
            <div className="map-legend">
              <div className="legend-item"><div className="legend-color green"></div><span>Available</span></div>
              <div className="legend-item"><div className="legend-color orange"></div><span>Explored</span></div>
              <div className="legend-item"><div className="legend-color gray"></div><span>Coming Soon</span></div>
            </div>
          </div>
        </section>

        <section className="right-panel">
          {selectedCountry ? (
            <div className="info-card">
              <div className="card-header">
                <span className="card-flag">{selectedCountry.flagEmoji}</span>
                <h2>{selectedCountry.name}</h2>
                <div className="audio-buttons">
                  <button className="play-btn" onClick={() => speakCountryInfo(selectedCountry)} title="Listen">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  </button>
                  <button className="stop-btn" onClick={stopSpeaking} title="Stop">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><rect x="6" y="6" width="12" height="12" /></svg>
                  </button>
                </div>
              </div>
              <div className="card-details">
                <p><strong>🏛️ Capital:</strong> {selectedCountry.capital}</p>
                <p><strong>👥 Population:</strong> ~{selectedCountry.population}</p>
                <p><strong>🗣️ Language:</strong> {selectedCountry.language} (<em>{selectedCountry.hello}</em> means hello!)</p>
                <p><strong>🐾 Animal:</strong> {selectedCountry.animalEmoji} {selectedCountry.animal}</p>
                <p><strong>🍽️ Food:</strong> {selectedCountry.foodEmoji} {selectedCountry.food}</p>
                <p><strong>✨ Fun Fact:</strong> {selectedCountry.funFact}</p>
              </div>
            </div>
          ) : (
            <div className="info-card empty">
              <div className="empty-state">
                <span className="empty-emoji">🗺️</span>
                <h3>Click a green country</h3>
                <p>Find a GREEN country on the map and click it to learn with Penny & Peter!</p>
              </div>
            </div>
          )}

          <div className="stamp-shelf">
            <div className="stamp-header"><h3>📮 Your Passport Stamps</h3></div>
            {tier && <div className="tier-badge"><span className="tier-emoji">{tier.emoji}</span><span className="tier-name">{tier.name}</span></div>}
            <div className="stamps-grid">
              {Object.values(countriesData).map((country) => (
                <div key={country.id} className={`stamp ${stamps.includes(country.id) ? 'collected' : 'empty'}`}>
                  <span className="stamp-flag">{stamps.includes(country.id) ? country.flagEmoji : '⬜'}</span>
                  <span className="stamp-name">{country.name}</span>
                </div>
              ))}
            </div>
            <p className="stamp-count">{stamps.length} / {Object.keys(countriesData).length} countries explored!</p>
          </div>
        </section>
      </div>

      <footer className="footer">
       <div className="footer-pandas">
  <img src="/logo-small.png" alt="Penny & Peter Panda" className="footer-logo" />
</div>
        <div className="footer-message">My Big World — Ad-free. Forever.</div>
        
        <div className="donate-message">
          💝 Donate if you can. No problem if you can't.<br />
          My Big World stays free and ad-free either way.
        </div>
        
        <button className="donate-footer-btn" onClick={() => checkMathGate('donate')}>
          Donate Now
        </button>
        
        <div className="footer-links">
          <button className="about-btn" onClick={() => setShowAbout(true)}>ℹ️ About / Legal</button>
          <span className="separator">|</span>
          <button className="about-btn" onClick={() => checkMathGate('parents')}>🔒 Parents</button>
        </div>
      </footer>

      {showParentGate && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="modal-close" onClick={() => setShowParentGate(false)}>✕</button>
            <div className="parent-header">🔒 PARENTS & TEACHERS</div>
            {user && <p className="signed-in">Signed in as: {user.displayName || user.email}</p>}
            <p className="no-pressure-message">There's no pressure to donate. My Big World is free and ad-free for every family, no matter what.</p>
            <div className="donation-section">
              <form action="https://www.paypal.com/donate" method="post" target="_top">
                <input type="hidden" name="hosted_button_id" value="JWKA5H7X7EL2Y" />
                <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif" border="0" name="submit" alt="Donate" className="donate-img" />
              </form>
              <p className="donate-note">Thank you for keeping My Big World ad-free! 🌍</p>
            </div>
            <hr />
            <div className="premium-section">
              <h4>⭐ Premium (Coming Soon)</h4>
              <ul><li>✓ All 195 countries</li><li>✓ Deep facts & quizzes</li><li>✓ 1,000+ workbook pages</li><li>✓ Multiple profiles</li></ul>
            </div>
            <hr />
            <div className="account-section">
              <button className="signout-btn" onClick={handleSignOut}>🔑 Sign Out</button>
              <button className="reset-progress-btn" onClick={resetAllProgress}>⚠️ Reset All Progress</button>
            </div>
          </div>
        </div>
      )}

      {showAbout && (
        <div className="modal-overlay">
          <div className="modal about-modal">
            <button className="modal-close" onClick={() => setShowAbout(false)}>✕</button>
            <div className="about-header"><img src="/logo-small.png" alt="Logo" className="about-logo" /><h2>My Big World</h2><p className="version">Version 1.0 — 2026</p></div>
            <div className="about-section"><h3>📧 Contact</h3><p><a href="mailto:info@mybigworld.online">info@mybigworld.online</a></p></div>
            <div className="about-section"><h3>🔒 Privacy</h3><ul><li>✓ No personal data collected (guest mode)</li><li>✓ Google sign-in optional</li><li>✓ No tracking or cookies</li><li>✓ No ads ever</li></ul></div>
            <div className="about-section"><h3>📜 Terms</h3><ul><li>✓ Free for personal and classroom use</li><li>✓ May not be sold or redistributed</li><li>✓ Content for educational purposes only</li></ul></div>
            <div className="about-section"><h3>👶 Age Rating</h3><p>Designed for ages 4-10</p></div>
            <div className="about-footer"><p>© 2026 Denver C (PTY) Ltd. All rights reserved.</p><p>🐼 Penny & Peter Panda</p></div>
            <button className="close-btn-large" onClick={() => setShowAbout(false)}>Close</button>
          </div>
        </div>
      )}

    <style jsx>{`
  /* INTRO SCREEN STYLES */
  .intro-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #0d2b4e 0%, #1a4e6e 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  }
  .intro-card {
    background: rgba(0, 0, 0, 0.75);
    border-radius: 48px;
    padding: 2rem;
    max-width: 420px;
    width: 90%;
    text-align: center;
    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  }
  .intro-logo {
    width: 100px;
    height: auto;
    margin-bottom: 1rem;
    display: block;
    margin-left: auto;
    margin-right: auto;
  }
  .intro-message p {
    margin: 0.75rem 0;
    color: white;
    font-size: 1rem;
    text-align: center;
  }
  .intro-message p:first-child {
    font-weight: bold;
    color: #ffd966;
  }
  .intro-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin: 1.5rem 0;
  }
  .intro-btn {
    padding: 0.85rem;
    border-radius: 60px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    border: none;
    width: 100%;
    transition: transform 0.2s;
  }
  .intro-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  .google-btn {
    background: #4285f4;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }
  .google-icon {
    background: white;
    color: #4285f4;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 14px;
  }
  .guest-btn {
    background: rgba(255,255,255,0.2);
    color: white;
    border: 1px solid rgba(255,255,255,0.3);
  }
  .intro-note {
    font-size: 0.75rem;
    color: #ffd966;
    margin: 0.5rem 0 0.25rem;
    text-align: center;
  }
  .intro-note-small {
    font-size: 0.7rem;
    color: rgba(255,255,255,0.6);
    margin: 0;
    text-align: center;
  }

  /* MAIN APP STYLES */
  * { margin: 0; padding: 0; box-sizing: border-box; }
  .app { font-family: 'Nunito', sans-serif; max-width: 1400px; margin: 0 auto; padding: 1rem; background: #0d2b4e; min-height: 100vh; }
  .loading-screen { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; background: #0d2b4e; color: white; }
  .loading-spinner { font-size: 4rem; animation: bounce 1s infinite; }
  @keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
  .header { text-align: center; padding: 1rem; background: #1e6f5c; border-radius: 32px; margin-bottom: 2rem; }
  .header-logo { width: 180px; max-width: 90%; height: auto; object-fit: contain; }
  .main-container { display: flex; gap: 1.5rem; margin-bottom: 2rem; flex-wrap: wrap; }
  .map-section { flex: 1.5; min-width: 0; }
  .right-panel { flex: 0.8; min-width: 280px; max-width: 380px; display: flex; flex-direction: column; gap: 1.5rem; }
  .map-container { background: #0d2b4e; border-radius: 24px; padding: 1rem; box-shadow: 0 8px 20px rgba(0,0,0,0.2); }
  .map-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; padding: 0 0.5rem; }
  .map-title { color: white; font-weight: bold; }
  .map-reset-btn { background: rgba(255,255,255,0.2); border: none; color: white; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.7rem; cursor: pointer; }
  .map-legend { display: flex; justify-content: center; gap: 1rem; margin-top: 0.75rem; padding: 0.5rem; background: rgba(0,0,0,0.4); border-radius: 20px; flex-wrap: wrap; }
  .legend-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.7rem; color: white; }
  .legend-color { width: 16px; height: 16px; border-radius: 4px; border: 1px solid white; }
  .legend-color.green { background: #4caf50; }
  .legend-color.orange { background: #ff9800; }
  .legend-color.gray { background: #d3d3d3; }
  .info-card { background: white; border-radius: 24px; padding: 1.25rem; box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
  .info-card.empty { background: #f9f9f9; text-align: center; }
  .empty-state { padding: 1.5rem 1rem; }
  .empty-emoji { font-size: 3rem; display: block; margin-bottom: 0.75rem; }
  .card-header { display: flex; align-items: center; gap: 0.75rem; border-bottom: 2px solid #f0f0f0; padding-bottom: 0.75rem; margin-bottom: 0.75rem; }
  .card-flag { font-size: 2.5rem; }
  .card-header h2 { flex: 1; color: #1e6f5c; font-size: 1.3rem; }
  .audio-buttons { display: flex; gap: 0.5rem; }
  .play-btn, .stop-btn { border: none; padding: 0.5rem 0.8rem; border-radius: 60px; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; }
  .play-btn { background: #4caf50; }
  .play-btn:hover { background: #45a049; transform: scale(1.05); }
  .stop-btn { background: #f44336; }
  .stop-btn:hover { background: #d32f2f; transform: scale(1.05); }
  .card-details p { margin: 0.6rem 0; font-size: 0.85rem; }
  .stamp-shelf { background: white; border-radius: 24px; padding: 1.25rem; box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
  .stamp-header h3 { text-align: center; margin-bottom: 0.75rem; color: #1e6f5c; }
  .tier-badge { text-align: center; padding: 0.5rem; background: #ffd966; border-radius: 40px; margin-bottom: 1rem; font-weight: bold; }
  .stamps-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; max-height: 300px; overflow-y: auto; }
  .stamp { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; background: #f9f9f9; border-radius: 12px; }
  .stamp.collected { background: #e8f5e9; border: 1px solid #4caf50; }
  .stamp.empty { opacity: 0.5; }
  .stamp-flag { font-size: 1.3rem; }
  .stamp-name { font-size: 0.7rem; }
  .stamp-count { text-align: center; margin-top: 0.75rem; font-weight: bold; color: #1e6f5c; }
  
  /* Footer */
  .footer { text-align: center; padding: 1rem; margin-top: 1rem; background: white; border-radius: 24px; }
  .footer-logo { width: 40px; height: 40px; object-fit: contain; margin-bottom: 0.25rem; }
  .footer-message { font-size: 0.85rem; font-weight: bold; color: #1e6f5c; margin-bottom: 0.5rem; }
  .donate-message { font-size: 0.7rem; color: #555; margin-bottom: 0.75rem; line-height: 1.4; }
  .donate-footer-btn { background: #0070ba; color: white; border: none; padding: 0.5rem 1.2rem; border-radius: 60px; font-size: 0.8rem; cursor: pointer; font-weight: bold; margin-bottom: 0.75rem; }
  .donate-footer-btn:hover { background: #005c99; }
  .footer-links { display: flex; justify-content: center; gap: 1rem; margin-top: 0.5rem; }
  .about-btn { background: none; border: none; color: #1e6f5c; font-size: 0.7rem; cursor: pointer; text-decoration: underline; }
  .separator { color: #ccc; }

  /* Math Gate */
  .math-modal { text-align: center; max-width: 350px; }
  .math-icon { font-size: 3rem; margin-bottom: 0.5rem; }
  .math-question { font-size: 1.8rem; font-weight: bold; color: #1e6f5c; margin: 1rem 0; }
  .math-input { font-size: 1.2rem; padding: 0.5rem; text-align: center; width: 150px; margin: 0.5rem auto; display: block; border: 2px solid #ddd; border-radius: 12px; }
  .math-verify-btn { background: #1e6f5c; color: white; border: none; padding: 0.5rem 1rem; border-radius: 60px; font-size: 1rem; cursor: pointer; margin-top: 0.5rem; }
  .math-note { font-size: 0.7rem; color: #999; margin-top: 0.5rem; }
  .no-pressure-message { font-size: 0.75rem; color: #1e6f5c; background: #f0f7f4; padding: 0.5rem; border-radius: 12px; margin-bottom: 1rem; text-align: center; }

  /* Modal & Celebration */
  .celebration-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 2000; }
  .celebration-content { text-align: center; background: linear-gradient(135deg, #ffd966, #ff9800); padding: 2rem; border-radius: 48px; }
  .celebration-badge { font-size: 1.5rem; font-weight: bold; color: #1e6f5c; background: white; padding: 0.75rem 1.5rem; border-radius: 60px; margin-bottom: 0.75rem; }
  .celebration-btn { background: white; border: none; padding: 0.6rem 1.2rem; border-radius: 60px; cursor: pointer; }
  .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1001; }
  .modal { background: white; padding: 1.25rem; border-radius: 24px; max-width: 450px; width: 90%; max-height: 90vh; overflow-y: auto; position: relative; }
  .modal-close { position: absolute; top: 10px; right: 15px; background: none; border: none; font-size: 1.2rem; cursor: pointer; }
  .parent-header { font-size: 1.3rem; font-weight: bold; color: #1e6f5c; margin-bottom: 1rem; text-align: center; }
  .signed-in { text-align: center; font-size: 0.8rem; color: #555; margin-bottom: 1rem; }
  .donation-section { text-align: center; margin: 1rem 0; }
  .donate-img { max-width: 100%; height: auto; cursor: pointer; }
  .donate-note { font-size: 0.75rem; color: #555; margin-top: 0.75rem; line-height: 1.4; }
  .premium-section h4 { color: #1e6f5c; margin-bottom: 0.5rem; }
  .premium-section ul { margin-left: 1rem; font-size: 0.8rem; color: #555; }
  .account-section { display: flex; justify-content: center; gap: 0.5rem; margin: 1rem 0; flex-wrap: wrap; }
  .signout-btn, .reset-progress-btn { background: none; border: 1px solid #ccc; padding: 0.4rem 0.8rem; border-radius: 8px; cursor: pointer; }
  .reset-progress-btn { color: #c0392b; border-color: #c0392b; }
  .reset-modal { max-width: 350px; text-align: center; }
  .reset-icon { font-size: 3rem; margin-bottom: 0.5rem; }
  .reset-note { font-size: 0.75rem; color: #666; margin-top: 0.5rem; }
  .reset-buttons { display: flex; gap: 1rem; justify-content: center; margin-top: 1rem; }
  .reset-cancel { padding: 0.5rem 1rem; background: #ccc; border: none; border-radius: 60px; cursor: pointer; }
  .reset-confirm { padding: 0.5rem 1rem; background: #1e6f5c; color: white; border: none; border-radius: 60px; cursor: pointer; }
  .about-modal { max-width: 500px; }
  .about-header { text-align: center; margin-bottom: 1rem; }
  .about-logo { width: 60px; height: 60px; object-fit: contain; margin-bottom: 0.5rem; }
  .version { color: #999; font-size: 0.8rem; }
  .about-section { text-align: left; margin: 1rem 0; padding: 0.5rem 0; border-bottom: 1px solid #eee; }
  .about-section h3 { color: #1e6f5c; font-size: 1rem; }
  .about-section ul { margin-left: 1rem; font-size: 0.85rem; }
  .about-footer { text-align: center; margin-top: 1rem; font-size: 0.7rem; color: #999; }
  .close-btn-large { background: #1e6f5c; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 60px; cursor: pointer; width: 100%; margin-top: 1rem; }
  
  @media (max-width: 768px) { 
    .main-container { flex-direction: column; } 
    .right-panel { max-width: 100%; } 
    .intro-logo { width: 80px; height: auto; }
    .header-logo { width: 140px; }
  }
`}</style>
    </div>
  );
}

export default App; 
