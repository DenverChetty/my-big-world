import React, { useEffect, useRef } from 'react';
import { auth } from './firebase-config';
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';

function SignIn({ onSignIn }) {
  const uiRef = useRef(null);

  useEffect(() => {
    if (uiRef.current && !firebaseui.auth.AuthUI.getInstance()) {
      const ui = new firebaseui.auth.AuthUI(auth);
      
      ui.start(uiRef.current, {
        signInOptions: [
          {
            provider: firebaseui.auth.GoogleAuthProvider.PROVIDER_ID,
            customParameters: {
              prompt: 'select_account'
            }
          }
        ],
        signInFlow: 'popup',
        callbacks: {
          signInSuccessWithAuthResult: (authResult) => {
            onSignIn(authResult.user);
            return false;
          }
        }
      });
    }
  }, [onSignIn]);

  return <div ref={uiRef}></div>;
}

export default SignIn;
