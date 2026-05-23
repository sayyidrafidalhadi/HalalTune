import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyD7bc74wJSIRi1_BhDqFjEMG2mE3noBm4g',
  authDomain: 'halaltune-6c908.firebaseapp.com',
  projectId: 'halaltune-6c908',
  storageBucket: 'halaltune-6c908.firebasestorage.app',
  messagingSenderId: '159242961546',
  appId: '1:159242961546:web:65bdcd9c3fee61c661e373',
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
