import React, { useState, useEffect, useRef } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { auth, db, googleProvider, doc, getDoc, setDoc, updateDoc } from './firebase-config';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

// ============================================
// COUNTRY DATA (20 countries)
// ============================================
const countriesData = {
  "japan": { id: "japan", name: "Japan", capital: "Tokyo", population: "125 million", language: "Japanese", hello: "Konnichiwa", animal: "Giant Panda", animalEmoji: "🐼", food: "Sushi", foodEmoji: "🍣", funFact: "Japan has over 6,800 islands!", flagEmoji: "🇯🇵", continent: "Asia" },
  "france": { id: "france", name: "France", capital: "Paris", population: "68 million", language: "French", hello: "Bonjour", animal: "Gallic Rooster", animalEmoji: "🐓", food: "Baguette", foodEmoji: "🥖", funFact: "France produces over 1,000 types of cheese!", flagEmoji: "🇫🇷", continent: "Europe" },
  "brazil": { id: "brazil", name: "Brazil", capital: "Brasília", population: "213 million", language: "Portuguese", hello: "Olá", animal: "Jaguar", animalEmoji: "🐆", food: "Feijoada", foodEmoji: "🍲", funFact: "Brazil has the most plant species in the world!", flagEmoji: "🇧🇷", continent: "South America" },
  "australia": { id: "australia", name: "Australia", capital: "Canberra", population: "25 million", language: "English", hello: "G'day", animal: "Kangaroo", animalEmoji: "🦘", food: "Vegemite", foodEmoji: "🍞", funFact: "Australia is wider than the Moon!", flagEmoji: "🇦🇺", continent: "Oceania" },
  "egypt": { id: "egypt", name: "Egypt", capital: "Cairo", population: "109 million", language: "Arabic", hello: "Marhaba", animal: "Mau Cat", animalEmoji: "🐱", food: "Koshari", foodEmoji: "🍚", funFact: "Home to the last standing ancient wonder!", flagEmoji: "🇪🇬", continent: "Africa" },
  "canada": { id: "canada", name: "Canada", capital: "Ottawa", population: "38 million", language: "English/French", hello: "Hello/Bonjour", animal: "Beaver", animalEmoji: "🦫", food: "Poutine", foodEmoji: "🍟", funFact: "Canada has more lakes than the rest of the world combined!", flagEmoji: "🇨🇦", continent: "North America" },
  "india": { id: "india", name: "India", capital: "New Delhi", population: "1.4 billion", language: "Hindi", hello: "Namaste", animal: "Bengal Tiger", animalEmoji: "🐅", food: "Biryani", foodEmoji: "🍛", funFact: "India has the world's largest vegetarian population!", flagEmoji: "🇮🇳", continent: "Asia" },
  "kenya": { id: "kenya", name: "Kenya", capital: "Nairobi", population: "54 million", language: "Swahili", hello: "Jambo", animal: "Lion", animalEmoji: "🦁", food: "Nyama Choma", foodEmoji: "🍖", funFact: "The Great Migration has over 1.5 million animals!", flagEmoji: "🇰🇪", continent: "Africa" },
  "italy": { id: "italy", name: "Italy", capital: "Rome", population: "60 million", language: "Italian", hello: "Ciao", animal: "Wolf", animalEmoji: "🐺", food: "Pizza", foodEmoji: "🍕", funFact: "Italy has the most UNESCO World Heritage sites!", flagEmoji: "🇮🇹", continent: "Europe" },
  "mexico": { id: "mexico", name: "Mexico", capital: "Mexico City", population: "126 million", language: "Spanish", hello: "Hola", animal: "Golden Eagle", animalEmoji: "🦅", food: "Tacos", foodEmoji: "🌮", funFact: "Mexico has 68 official languages!", flagEmoji: "🇲🇽", continent: "North America" },
  "germany": { id: "germany", name: "Germany", capital: "Berlin", population: "83 million", language: "German", hello: "Hallo", animal: "Eagle", animalEmoji: "🦅", food: "Bratwurst", foodEmoji: "🌭", funFact: "Germany has over 1,500 types of sausages!", flagEmoji: "🇩🇪", continent: "Europe" },
  "spain": { id: "spain", name: "Spain", capital: "Madrid", population: "47 million", language: "Spanish", hello: "Hola", animal: "Bull", animalEmoji: "🐂", food: "Paella", foodEmoji: "🥘", funFact: "Spain has the second most UNESCO sites!", flagEmoji: "🇪🇸", continent: "Europe" },
  "southafrica": { id: "southafrica", name: "South Africa", capital: "Pretoria", population: "60 million", language: "11 official", hello: "Sawubona", animal: "Springbok", animalEmoji: "🦌", food: "Biltong", foodEmoji: "🥩", funFact: "South Africa has 3 capital cities!", flagEmoji: "🇿🇦", continent: "Africa" },
  "argentina": { id: "argentina", name: "Argentina", capital: "Buenos Aires", population: "45 million", language: "Spanish", hello: "Hola", animal: "Jaguar", animalEmoji: "🐆", food: "Asado", foodEmoji: "🥩", funFact: "Argentina is home to the world's widest river!", flagEmoji: "🇦🇷", continent: "South America" },
  "china": { id: "china", name: "China", capital: "Beijing", population: "1.4 billion", language: "Mandarin", hello: "Nǐ hǎo", animal: "Giant Panda", animalEmoji: "🐼", food: "Dumplings", foodEmoji: "🥟", funFact: "China has the world's largest population!", flagEmoji: "🇨🇳", continent: "Asia" },
  "thailand": { id: "thailand", name: "Thailand", capital: "Bangkok", population: "70 million", language: "Thai", hello: "Sawasdee", animal: "Elephant", animalEmoji: "🐘", food: "Pad Thai", foodEmoji: "🍜", funFact: "Thailand is called the 'Land of Smiles'!", flagEmoji: "🇹🇭", continent: "Asia" },
  "turkey": { id: "turkey", name: "Turkey", capital: "Ankara", population: "84 million", language: "Turkish", hello: "Merhaba", animal: "Wolf", animalEmoji: "🐺", food: "Kebab", foodEmoji: "🍖", funFact: "Istanbul spans two continents!", flagEmoji: "🇹🇷", continent: "Europe/Asia" },
  "sweden": { id: "sweden", name: "Sweden", capital: "Stockholm", population: "10 million", language: "Swedish", hello: "Hej", animal: "Moose", animalEmoji: "🦌", food: "Meatballs", foodEmoji: "🍝", funFact: "Sweden has over 100,000 lakes!", flagEmoji: "🇸🇪", continent: "Europe" },
  "norway": { id: "norway", name: "Norway", capital: "Oslo", population: "5 million", language: "Norwegian", hello: "Hei", animal: "Moose", animalEmoji: "🦌", food: "Salmon", foodEmoji: "🐟", funFact: "Norway has the longest coastline in Europe!", flagEmoji: "🇳🇴", continent: "Europe" },
  "newzealand": { id: "newzealand", name: "New Zealand", capital: "Wellington", population: "5 million", language: "English/Maori", hello: "Kia ora", animal: "Kiwi", animalEmoji: "🐦", food: "Fish and chips", foodEmoji: "🐟", funFact: "First country to give women the vote!", flagEmoji: "🇳🇿", continent: "Oceania" }
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
  const holdTimer = useRef(null);
  const celebrationTriggered = useRef(false);

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
      const utterance = new SpeechSynthesisUtterance("Woo hoo! You're a Novice Explorer!");
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
      setTimeout(() => setShowCelebration(false), 4000);
    } else if (stamps.length === 20 && !celebrationTriggered.current) {
      celebrationTriggered.current = true;
      setCelebrationMessage("🏆 EXPLORER! You've collected 20 stamps!");
      setShowCelebration(true);
      const utterance = new SpeechSynthesisUtterance("Amazing! You're an Explorer!");
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

  const speakCountryInfo = (country) => {
    if (country.id === "unknown") {
      const utterance = new SpeechSynthesisUtterance(`${country.name} is coming soon!`);
      utterance.rate = 0.85; utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
      return;
    }
    const text = `Let's learn about ${country.name}! ${country.name}'s capital is ${country.capital}. ${country.name} has about ${country.population} people. The main language is ${country.language}. To say hello, you say ${country.hello}. The famous animal is the ${country.animal}. A popular food is ${country.food}. Here's a fun fact: ${country.funFact}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85; utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const resetMapView = () => {
    setMapResetKey(prev => prev + 1);
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
        <div className="intro-card">
          <div className="intro-pandas">🐼 🐼</div>
          <h2>Hi! We're Penny and Peter.</h2>
          <p>This is <strong>MY BIG WORLD</strong>.</p>
          <p>We travel to different countries, collect stamps, and learn how to say hello in new languages.</p>
          <p>Want to come with us?</p>
          <div className="intro-buttons">
            <button className="intro-btn primary" onClick={handleGoogleSignIn}>🚀 Sign in with Google</button>
            <button className="intro-btn secondary" onClick={() => setShowIntro(false)}>👻 Continue as Guest</button>
          </div>
          <p className="intro-note">Sign in to save progress across devices. Guest saves on this device only.</p>
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
            <p>This returns the map to its original zoom and position.</p>
            <p className="reset-note">Your stamps and badges will NOT be affected.</p>
            <div className="reset-buttons">
              <button className="reset-cancel" onClick={() => setShowResetConfirm(false)}>Cancel</button>
              <button className="reset-confirm" onClick={resetMapView}>Yes, Reset Map</button>
            </div>
          </div>
        </div>
      )}

      <header className="header">
        <div className="logo-area">
          <span className="panda-icon">🐼🐼</span>
          <div>
            <h1>My Big World</h1>
            <p className="subtitle">with Penny and Peter Panda</p>
          </div>
        </div>
        <p className="tagline">Explore. Learn. Grow.</p>
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
                            default: { fill: fillColor, stroke: "#fff", strokeWidth: 0.5, outline: "none", cursor: isSupported ? "pointer" : "default" },
                            hover: { fill: isSupported ? "#ffd966" : "#e0e0e0", stroke: "#fff", strokeWidth: 0.5, outline: "none", cursor: isSupported ? "pointer" : "default" },
                            pressed: { fill: isSupported ? "#ff9800" : "#d3d3d3", stroke: "#fff", strokeWidth: 0.5, outline: "none" }
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
                <button className="speaker-btn" onClick={() => speakCountryInfo(selectedCountry)}>🔊</button>
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
        <p>🐼🐼 My Big World — Free. Ad-free. Forever.</p>
        <div className="footer-links">
          <button className="about-btn" onClick={() => setShowAbout(true)}>ℹ️ About / Legal</button>
          <span className="separator">|</span>
          <button className="about-btn" onClick={() => setShowParentGate(true)}>🔒 Parents</button>
        </div>
        <p className="footer-hint">👆 Hold here for 3 seconds (parent gate)</p>
      </footer>

      {showParentGate && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="modal-close" onClick={() => setShowParentGate(false)}>✕</button>
            <div className="parent-header">🔒 PARENTS & TEACHERS</div>
            {user && <p className="signed-in">Signed in as: {user.displayName || user.email}</p>}
            
            <div className="donation-section">
              <form action="https://www.paypal.com/donate" method="post" target="_top">
                <input type="hidden" name="hosted_button_id" value="JWKA5H7X7EL2Y" />
                <input 
                  type="image" 
                  src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif" 
                  border="0" 
                  name="submit" 
                  title="PayPal - The safer, easier way to pay online!" 
                  alt="Donate with PayPal button" 
                  className="donate-img"
                />
                <img alt="" border="0" src="https://www.paypal.com/en_ZA/i/scr/pixel.gif" width="1" height="1" />
              </form>
              <p className="donate-note">
                Every child deserves to explore the world, no matter their family's budget.
                Your donation helps expand the map — more countries, more facts, more games.
                So donate if you can. Every little bit helps.
                If you can't, the map is still yours. Completely.
                Thank you for believing in free, ad-free learning. 🌍
              </p>
            </div>
            
            <hr />
            <div className="premium-section">
              <h4>⭐ Premium (Coming Soon)</h4>
              <ul>
                <li>✓ All 195 countries</li>
                <li>✓ Deep facts & quizzes</li>
                <li>✓ 1,000+ workbook pages</li>
                <li>✓ Timed challenges</li>
                <li>✓ Multiple profiles</li>
              </ul>
            </div>
            <hr />
            <div className="account-section">
              <button className="signout-btn" onClick={handleSignOut}>🔑 Sign Out</button>
              <button className="reset-progress-btn" onClick={resetAllProgress}>⚠️ Reset All Progress</button>
            </div>
            <div className="pin-section">
              <p className="pin-hint">🔒 Parent PIN: <strong>1234</strong></p>
            </div>
          </div>
        </div>
      )}

      {showAbout && (
        <div className="modal-overlay">
          <div className="modal about-modal">
            <button className="modal-close" onClick={() => setShowAbout(false)}>✕</button>
            <div className="about-header"><span className="about-icon">🐼🐼</span><h2>My Big World</h2><p className="version">Version 1.0</p></div>
            <div className="about-section"><h3>📧 Contact</h3><p><a href="mailto:info@mybigworld.online">info@mybigworld.online</a></p></div>
            <div className="about-section"><h3>🔒 Privacy</h3><ul><li>✓ No personal data collected (guest mode)</li><li>✓ Google sign-in optional</li><li>✓ No tracking or cookies</li><li>✓ No ads ever</li></ul></div>
            <div className="about-section"><h3>📜 Terms</h3><ul><li>✓ Free for personal and classroom use</li><li>✓ May not be sold or redistributed</li><li>✓ Content for educational purposes only</li></ul></div>
            <div className="about-section"><h3>👶 Age Rating</h3><p>Designed for ages 4-10</p></div>
            <div className="about-footer"><p>© 2025 My Big World. All rights reserved.</p><p>🐼 Penny & Peter Panda</p></div>
            <button className="close-btn-large" onClick={() => setShowAbout(false)}>Close</button>
          </div>
        </div>
      )}

      <style jsx>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .app { font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 1400px; margin: 0 auto; padding: 1rem; background: #0d2b4e; min-height: 100vh; }
        .loading-screen { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; background: #0d2b4e; color: white; }
        .loading-spinner { font-size: 4rem; animation: bounce 1s infinite; }
        @keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        .intro-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: #0d2b4e; display: flex; align-items: center; justify-content: center; z-index: 10000; }
        .intro-card { background: white; border-radius: 48px; padding: 2rem; max-width: 450px; width: 90%; text-align: center; }
        .intro-pandas { font-size: 4rem; margin-bottom: 1rem; }
        .intro-btn { padding: 0.75rem; border-radius: 60px; font-size: 1rem; font-weight: bold; cursor: pointer; border: none; width: 100%; margin: 0.5rem 0; }
        .intro-btn.primary { background: #4285f4; color: white; }
        .intro-btn.secondary { background: #f5f5f5; color: #555; border: 1px solid #ddd; }
        .intro-note { font-size: 0.7rem; color: #999; margin-top: 1rem; }
        .header { text-align: center; padding: 1rem; background: #1e6f5c; color: white; border-radius: 32px; margin-bottom: 2rem; }
        .logo-area { display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 0.25rem; }
        .panda-icon { font-size: 2rem; }
        .header h1 { margin: 0; font-size: 1.8rem; }
        .subtitle { font-size: 0.8rem; opacity: 0.9; }
        .tagline { font-size: 0.8rem; opacity: 0.8; margin-top: 0.5rem; }
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
        .speaker-btn { background: #ffd966; border: none; font-size: 1.2rem; padding: 0.4rem 0.8rem; border-radius: 60px; cursor: pointer; }
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
        .footer { text-align: center; padding: 1rem; margin-top: 1rem; background: white; border-radius: 24px; font-size: 0.8rem; color: #666; }
        .footer-links { display: flex; justify-content: center; gap: 1rem; margin: 0.5rem 0; }
        .about-btn { background: none; border: none; color: #1e6f5c; font-size: 0.7rem; cursor: pointer; text-decoration: underline; }
        .footer-hint { font-size: 0.65rem; color: #1e6f5c; margin-top: 0.25rem; cursor: pointer; }
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
        .pin-section { text-align: center; margin-top: 0.5rem; }
        .pin-hint { font-size: 0.7rem; color: #666; }
        .reset-modal { max-width: 350px; text-align: center; }
        .reset-icon { font-size: 3rem; margin-bottom: 0.5rem; }
        .reset-note { font-size: 0.75rem; color: #666; margin-top: 0.5rem; }
        .reset-buttons { display: flex; gap: 1rem; justify-content: center; margin-top: 1rem; }
        .reset-cancel { padding: 0.5rem 1rem; background: #ccc; border: none; border-radius: 60px; cursor: pointer; }
        .reset-confirm { padding: 0.5rem 1rem; background: #1e6f5c; color: white; border: none; border-radius: 60px; cursor: pointer; }
        .about-modal { max-width: 500px; }
        .about-header { text-align: center; margin-bottom: 1rem; }
        .about-icon { font-size: 3rem; }
        .version { color: #999; font-size: 0.8rem; }
        .about-section { text-align: left; margin: 1rem 0; padding: 0.5rem 0; border-bottom: 1px solid #eee; }
        .about-section h3 { color: #1e6f5c; font-size: 1rem; }
        .about-section ul { margin-left: 1rem; font-size: 0.85rem; }
        .about-footer { text-align: center; margin-top: 1rem; font-size: 0.7rem; color: #999; }
        .close-btn-large { background: #1e6f5c; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 60px; cursor: pointer; width: 100%; margin-top: 1rem; }
        @media (max-width: 768px) { .main-container { flex-direction: column; } .right-panel { max-width: 100%; } .header h1 { font-size: 1.3rem; } }
      `}</style>
    </div>
  );
}

export default App;
