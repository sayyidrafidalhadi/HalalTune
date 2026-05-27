import { initializeApp } from "firebase/app"
import { getAuth, connectAuthEmulator } from "firebase/auth"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyCIImtxDL4OxFjV3xk5MlDwkvuvWtYIZNs",
  authDomain: "halaltune-3a389.firebaseapp.com",
  projectId: "halaltune-3a389",
  storageBucket: "halaltune-3a389.firebasestorage.app",
  messagingSenderId: "213811571538",
  appId: "1:213811571538:web:04e74ad7f85711c642e88b",
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

export default app
