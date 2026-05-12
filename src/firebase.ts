import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, type User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: 'AIzaSyDbYkxvrEFMfltDnn_8fxLpPLDLZU3HscQ',
    authDomain: 'travel-a01b4.firebaseapp.com',
    projectId: 'travel-a01b4',
    storageBucket: 'travel-a01b4.firebasestorage.app',
    messagingSenderId: '879602910910',
    appId: '1:879602910910:web:5036f88cc2581c4761c0ef',
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export const ensureAnonymousAuth = (): Promise<User> =>
    new Promise((resolve, reject) => {
        const unsub = onAuthStateChanged(
            auth,
            (user) => {
                if (user) {
                    unsub();
                    resolve(user);
                    return;
                }
                signInAnonymously(auth).catch((err) => {
                    unsub();
                    reject(err);
                });
            },
            (err) => {
                unsub();
                reject(err);
            }
        );
    });
