// Same Firebase project as mobile/ and platform/. These values are project identifiers, not secrets;
// Realtime Database rules are the protection.
// The landing page needs no live data, so nothing imports this file. It exists so the config lives in
// one predictable place if the page ever reads from the database.
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
