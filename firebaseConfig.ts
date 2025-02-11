import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
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
  apiKey: "AIzaSyBoVIXLR-JZ0uIlixCHSe-XIPXrlFDjK3E",
  authDomain: "consolidarapp.firebaseapp.com",
  projectId: "consolidarapp",
  storageBucket: "consolidarapp.appspot.com",
  messagingSenderId: "421522072100",
  appId: "1:421522072100:web:f883b7f37861fa06472eb1"
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


// Exportando os serviços e métodos
// Exportando os serviços e métodos
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
    updateDoc, 
};
