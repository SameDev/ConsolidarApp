import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableHighlight,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Image
} from "react-native";
import auth from "@react-native-firebase/auth";
import { FontAwesome6 } from "@expo/vector-icons";

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Erro", "Por favor, insira seu e-mail.");
      return;
    }

    setIsLoading(true);
    try {
      await auth().sendPasswordResetEmail(email);
      Alert.alert("Sucesso", "Um link para redefinição foi enviado ao seu e-mail.");
      navigation.goBack();
    } catch (error: any) {
      console.error("Erro ao enviar email:", error);
      Alert.alert("Erro", "Não foi possível enviar o e-mail. Verifique se o e-mail está correto.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.exit} onPress={() => {navigation.goBack()}} >
        <FontAwesome6 name="arrow-left-long" color="#A56429" size={45} />
      </TouchableOpacity>
      <Image source={require("../assets/logo.png")} style={styles.logo} />
      <Text style={styles.title}>Recuperar Senha</Text>
      <Text style={styles.subtitle}>
        Insira seu e-mail para receber um link de redefinição.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Digite seu e-mail"
        placeholderTextColor="#B0B0B0"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableHighlight underlayColor="#D19554" style={styles.button} onPress={handleForgotPassword}>
        {isLoading ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Enviar E-mail</Text>
        )}
      </TouchableHighlight>

      <TouchableHighlight underlayColor="#D19554" style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Voltar para Login</Text>
      </TouchableHighlight>
    </View>
  );
}

const styles = StyleSheet.create({
  exit: {
    position: 'absolute',
    top: 5,
    left: 5
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#A56429",
    marginBottom: 10,
  },
  logo: { width: 120, height: 120, resizeMode: "contain", marginBottom: 80 },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#A56429",
    borderRadius: 8,
    paddingLeft: 10,
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#A56429",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    marginTop: 15,
  },
  backButtonText: {
    color: "#A56429",
    fontSize: 14,
    fontWeight: "bold",
  },
});
