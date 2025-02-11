import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import auth from "@react-native-firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authFirebase, collection, db, doc, signInWithEmailAndPassword } from "../firebaseConfig";
import { getDoc } from "firebase/firestore";

const image = require("../assets/banner-login.png");

import { StackNavigationProp } from "@react-navigation/stack";

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  EsqueciSenha: undefined;
  Home: undefined;
};

import { useNavigation } from "@react-navigation/native";

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, "Login">;

interface LoginScreenProps {
  onLogin: () => void;
  onRegister: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onRegister }) => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
  setErrorMessage(null);
  if (!email || !password) {
    setErrorMessage('Por favor, preencha todos os campos.');
    return;
  }
  setIsLoggingIn(true);
  try {
    const userCredential = await signInWithEmailAndPassword(
      authFirebase,
      email.toLowerCase().trim(),
      password.trim()
    );

    const userId = userCredential.user.uid;
    console.log('UID do usuário:', userId); 

    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const { cargo } = userData;

      const user = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userData.name,
        cargo: cargo, 
      };
      await AsyncStorage.setItem('@user_data', JSON.stringify(user));

      onLogin();
    } else {
      console.log('Documento do usuário não encontrado no Firestore');
      setErrorMessage("Erro: Dados do usuário não encontrados.");
    }
  } catch (error: any) {
    console.log('Erro:', error); 
    switch (error.code) {
      case "auth/user-not-found":
        setErrorMessage("Usuário não encontrado. Verifique seu email.");
        break;
      case "auth/wrong-password":
        setErrorMessage("Senha incorreta. Tente novamente.");
        break;
      case "auth/invalid-email":
        setErrorMessage("O email fornecido é inválido.");
        break;
      case "auth/network-request-failed":
        setErrorMessage("Problema na conexão. Verifique sua internet.");
        break;
      default:
        setErrorMessage("Erro ao realizar login. Tente novamente.");
    }
  } finally {
    setIsLoggingIn(false);
  }
};


  return (
    <View style={styles.container}>
      <ImageBackground source={image} resizeMode="cover" style={styles.image}>
        <View style={styles.logoContainer}>
          <Image source={require("../assets/logobranca.png")} style={styles.logo} />
        </View>
      </ImageBackground>

      <View style={styles.loginContainer}>
        <Text style={styles.title}>Faça Login</Text>

        <Text style={styles.label}>Insira seu email:</Text>
        <TextInput
          style={styles.input}
          placeholder="seuemail@email.com"
          placeholderTextColor="#B0B0B0"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Insira sua senha:</Text>
        <TextInput
          style={styles.input}
          placeholder="********"
          placeholderTextColor="#B0B0B0"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          {isLoggingIn ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.loginButtonText}>Faça Login</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("EsqueciSenha")}>
          <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onRegister}>
          <Text style={styles.registerText}>Não tem cadastro ainda? Cadastre-se</Text>
        </TouchableOpacity>
        

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7EFE5" },
  image: { flex: 1, justifyContent: "center", alignItems: "center", width: "100%", height: "60%" },
  logoContainer: { justifyContent: "center", alignItems: "center" },
  logo: { width: 120, height: 120, resizeMode: "contain", position: "absolute", bottom: 130 },
  loginContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 20,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  forgotPasswordText: {
    color: "#A56429",
    fontSize: 14,
    marginTop: 10,
    textAlign: "right",
    textDecorationLine: "underline"
  },  
  errorMessage: {
    width: "100%",
    textAlign: "center",
    color: "#FFF",
    fontSize: 14,
    marginBottom: 10,
    backgroundColor: "#bc3a3a",
    padding: 12,
    borderRadius: 4,
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#A56429", marginBottom: 20, fontFamily: "Poppins" },
  label: { width: "100%", fontSize: 16, color: "#A56429", marginBottom: 5 },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#D4C4AF",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: "#FFF",
  },
  loginButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#A56429",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    marginTop: 50,
  },
  loginButtonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  registerText: { fontSize: 14, color: "#A56429", textDecorationLine: "underline", marginTop: 10, fontWeight: 'bold', textDecorationStyle: 'dotted' },
});

export default LoginScreen;