import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Importa AsyncStorage
import { authFirebase, createUserWithEmailAndPassword, saveUserToFirestore } from "../firebaseConfig";

const image = require("../assets/banner-login.png");

interface RegisterScreenProps {
  onRegister: () => void;
  onBackToLogin: () => void;
}

export default function RegisterScreen({ onRegister, onBackToLogin }: RegisterScreenProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleRegister = async () => {
    setError(""); // Limpa mensagens de erro anteriores
    if (!fullName || !email || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }
    setIsLoggingIn(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(authFirebase, email.toLowerCase().trim(), password.trim());
      await saveUserToFirestore(fullName, email, "USUARIO", userCredential.user.uid);

      // Armazena as informações do usuário no AsyncStorage
      const userData = {
        fullName,
        email: email.toLowerCase().trim(),
        cargo: "USUARIO",
      };
      await AsyncStorage.setItem("@user_data", JSON.stringify(userData));

      onRegister(); // Chama a função de callback para indicar sucesso
    } catch (error: any) {
      // Tratamento de erros baseados nos códigos retornados
      switch (error.code) {
        case "auth/email-already-in-use":
          setError("O email já está em uso. Tente outro.");
          break;
        case "auth/invalid-email":
          setError("O email fornecido é inválido.");
          break;
        case "auth/weak-password":
          setError("A senha deve ter pelo menos 6 caracteres.");
          break;
        case "auth/network-request-failed":
          setError("Problema na conexão. Verifique sua internet.");
          break;
        default:
          setError("Erro ao registrar. Tente novamente mais tarde.");
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

      <View style={styles.registerContainer}>
        <Text style={styles.title}>Faça Cadastro</Text>

        <Text style={styles.label}>Insira seu nome completo:</Text>
        <TextInput
          style={styles.input}
          placeholder="Seu nome completo"
          placeholderTextColor="#B0B0B0"
          value={fullName}
          onChangeText={setFullName}
        />

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
        {error && <Text style={styles.errorMessage}>{error}</Text>}

        <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={isLoggingIn}>
          {isLoggingIn ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.registerButtonText}>Faça Cadastro</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={onBackToLogin}>
          <Text style={styles.loginText}>Já tem cadastro? Faça login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7EFE5",
  },
  image: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "60%",
  },
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorMessage: {
    width: "100%",
    textAlign: "center",
    color: "#FFF",
    fontSize: 14,
    marginBottom: 10,
    backgroundColor: '#bc3a3a',
    padding: 12,
    borderRadius: 4
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    position: "absolute",
    bottom: 170,
  },
  registerContainer: {
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#A56429",
    marginBottom: 20,
  },
  label: {
    width: "100%",
    fontSize: 16,
    color: "#A56429",
    marginBottom: 5,
  },
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
  googleButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D4C4AF",
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  googleButtonImg: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleButtonText: {
    color: "#A56429",
    fontSize: 16,
    flex: 1,
    textAlign: "center",
  },
  registerButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#A56429",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  registerButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginText: {
    fontSize: 14,
    color: "#A56429",
    textDecorationLine: "underline",
    marginTop: 10,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
  },
});
