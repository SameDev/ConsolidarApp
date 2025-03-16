import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDocs,
  deleteDoc,
  updateDoc,
  setDoc
} from "firebase/firestore"; 

// Configuração do Firebase
const firebaseConfig = {
  apiKey: `${process.env.EXPO_PUBLIC_API_KEY}`,
  authDomain: "consolidarapp.firebaseapp.com",
  projectId: "consolidarapp",
  storageBucket: "consolidarapp.appspot.com",
  messagingSenderId: "421522072100",
  appId: `${process.env.EXPO_PUBLIC_APP_ID}`
};

const app = initializeApp(firebaseConfig);

// Inicialização do Firebase
const authFirebase = getAuth(app);
const db = getFirestore(app);


const saveUserToFirestore = async (fullName: string, email: string, cargo: string, uid: string) => {
  try {
    await setDoc(doc(db, "users", uid), {
      name: fullName,
      email: email,
      cargo,
      createdAt: new Date(),
    });
    console.log("Usuário salvo no Firestore com sucesso!");
  } catch (error) {
    console.error("Erro ao salvar usuário no Firestore:", error);
    throw error;
  }
};

export {
    authFirebase,
    db,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    collection,
    saveUserToFirestore,
    doc,
    getDocs,
    deleteDoc,
    updateDoc, addDoc,
};
