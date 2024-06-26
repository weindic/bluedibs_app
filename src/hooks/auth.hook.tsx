import { useEffect, useState } from 'react';
import { auth } from '../utils/firebase';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';


export function useFirebaseAuth() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    FirebaseAuthentication.addListener('authStateChange', (change) => {
      debugger
      setLoading(false);
      if (!!change.user) setUser(change.user);
      else setUser(null)
    })
  }, []);

  return [loading, user];
}
