import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDJZOb29N5tFPfauXMd4683Tbt3aq5Z7po',
  authDomain: 'halaltune-41309.firebaseapp.com',
  projectId: 'halaltune-41309',
  storageBucket: 'halaltune-41309.firebasestorage.app',
  messagingSenderId: '863902327952',
  appId: '1:863902327952:web:e0efe47977994f1b74e415',
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(() => {
  auth.setPersistence(firebase.auth.Auth.Persistence.SESSION).catch(() => {});
});

db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
  if (err.code === 'failed-precondition') {
    db.enablePersistence().catch(() => {});
  }
});

export { auth, db };
export default firebase;
