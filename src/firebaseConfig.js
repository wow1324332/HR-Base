// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyChC5foo8k09r7OSwEyHJOW_PKLFCicz2I',
  authDomain: 'rh-works-c7cb6.firebaseapp.com',
  projectId: 'rh-works-c7cb6',
  storageBucket: 'rh-works-c7cb6.firebasestorage.app',
  messagingSenderId: '361742359573',
  appId: '1:361742359573:web:536e7bb0d75ea094ecc21c',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
