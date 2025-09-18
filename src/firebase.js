import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDmkj_sbo9-t6VQAgwJuZdWx4u1WqBlVfw",
  authDomain: "realtime-chat-sibers.firebaseapp.com",
  databaseURL: "https://realtime-chat-sibers-default-rtdb.firebaseio.com",
  projectId: "realtime-chat-sibers",
  storageBucket: "realtime-chat-sibers.firebasestorage.app",
  messagingSenderId: "659055281341",
  appId: "1:659055281341:web:479c0bf31abf4a0d0fa3d4",
  measurementId: "G-0ZT8CCL40M",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
