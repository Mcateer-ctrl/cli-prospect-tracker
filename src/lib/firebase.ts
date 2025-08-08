
// src/lib/firebase.ts
import { initializeApp, getApp, getApps } from '@firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {

  "projectId": "prospect-pipeline-f6w29",
  "appId": "1:27361302962:web:5512e723b35b9deedbecab",
  "storageBucket": "prospect-pipeline-f6w29.firebasestorage.app",
  "apiKey": "AIzaSyCBKaHvKMqjMZx9jgYUrxX2g6LTHRNcycU",
  "authDomain": "prospect-pipeline-f6w29.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "27361302962"
};


const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);


export { app, db };
