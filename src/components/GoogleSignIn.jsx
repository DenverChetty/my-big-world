// src/components/GoogleSignIn.jsx
import React, { useEffect, useRef } from 'react';
import { auth, googleProvider } from '../firebase-config';
import { signInWithPopup } from 'firebase/auth';

const GoogleSignIn = () => {
  const buttonRef = useRef(null);

  const handleGoogleSuccess = async (response) => {
    console.log("Google Sign-In Success:", response);
    // Firebase doesn't directly accept the credential from the new API, so we use popup as the reliable bridge.
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Firebase Sign-In Success:", result.user);
    } catch (error) {
      console.error("Firebase Sign-In Error:", error);
    }
  };

  const handleGoogleError = () => {
    console.error("Google Sign-In Failed or was blocked.");
  };

  useEffect(() => {
    // Load the Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: "5932772531-tputkjip90d44tb5eqjjti2qkj23rr53.apps.googleusercontent.com",
          callback: handleGoogleSuccess,
        });
        // Render the button into the div referenced by 'buttonRef'
        window.google.accounts.id.renderButton(
          buttonRef.current,
          { 
            type: "standard",
            theme: "outline",
            size: "large",
            text: "sign_in_with",
            shape: "rectangular",
            logo_alignment: "left"
          } // Customization attributes
        );
      }
    };
    document.body.appendChild(script);

    // Cleanup function to remove the script when the component unmounts
    return () => {
      const scriptTag = document.querySelector(`script[src="https://accounts.google.com/gsi/client"]`);
      if (scriptTag) document.body.removeChild(scriptTag);
    };
  }, []);

  return <div ref={buttonRef}></div>;
};

export default GoogleSignIn;
