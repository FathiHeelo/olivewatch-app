// Firebase Realtime Database. These values are project identifiers, not secrets;
// the database rules are the real protection. Same config as mobile/ and landing/.
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

export const firebaseConfig = {
  apiKey: 'AIzaSyBCYRSt3TAhlApo680gixvsVn1LSV5Uzu4',
  authDomain: 'olivewatch-ai.firebaseapp.com',
  databaseURL: 'https://olivewatch-ai-default-rtdb.firebaseio.com',
  projectId: 'olivewatch-ai',
  storageBucket: 'olivewatch-ai.firebasestorage.app',
  messagingSenderId: '212803003223',
  appId: '1:212803003223:web:ef680d9643a492973cd412',
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
