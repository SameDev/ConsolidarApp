import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import ExpoCheckbox from "expo-checkbox";
import { db, collection } from "../firebaseConfig";
import { addDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function AddVisitorScreen({ navigation }: any) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    prayerReason: "",
    needsBasicBasket: false,
    firstVisit: false,
    needsVisit: false,
    visitDate: new Date(),
  });
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem("@user_data");
        if (userData) {
          const parsedData = JSON.parse(userData);
          setName(parsedData.displayName);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      }
    };
    fetchUserData();
  }, []);

  const handleInputChange = (key: string, value: string | boolean | Date) => {
    setFormData({ ...formData, [key]: value });
  };

  const saveVisitor = async () => {
    setLoading(true);
    try {
      if (!formData.name || !formData.phone) {
        setLoading(false);
        Alert.alert("Erro", "Por favor, preencha todos os campos obrigatórios.");
        return;
      }
      if (!formData.address) {
        formData.address = "Endereço não informado, se você souber por favor adicione!"
      }

      await addDoc(collection(db, "visitors"), {
        ...formData,
        nameAdded: name,
        createdAt: new Date(),
      });
      Alert.alert("Sucesso", "Visitante adicionado com sucesso!");
      setFormData({
        name: "",
        phone: "",
        address: "",
        prayerReason: "",
        needsBasicBasket: false,
        firstVisit: false,
        needsVisit: false,
        visitDate: new Date(),
      });
      setLoading(false);
      navigation.goBack();
    } catch (error) {
      setLoading(false);
      Alert.alert("Erro", "Erro ao salvar o visitante. Tente novamente.");
      console.error("Erro ao salvar o visitante no Firestore:", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Data da visita:</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
          <Text>{formData.visitDate.toLocaleDateString()}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={formData.visitDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === "ios");
              if (selectedDate) handleInputChange("visitDate", selectedDate);
            }}
          />
        )}

        <Text style={styles.label}>Insira o nome do visitante:</Text>
        <TextInput
          style={styles.input}
          placeholder="Maria de Fátima Oliveira"
          value={formData.name}
          onChangeText={(text) => handleInputChange("name", text)}
        />

        <Text style={styles.label}>Insira o telefone para contato:</Text>
        <TextInput
          style={styles.input}
          placeholder="(99) 99999-9999"
          value={formData.phone}
          onChangeText={(text) => handleInputChange("phone", text)}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Insira o endereço:</Text>
        <TextInput
          style={styles.input}
          placeholder="Rua das Graças de Deus, n 211"
          value={formData.address}
          onChangeText={(text) => handleInputChange("address", text)}
        />

        <Text style={styles.label}>Insira o motivo de oração:</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Digite o motivo de oração"
          value={formData.prayerReason}
          onChangeText={(text) => handleInputChange("prayerReason", text)}
          multiline
        />

        <View style={styles.checkboxContainer}>
          <View style={styles.checkboxItem}>
            <ExpoCheckbox
              color="#8c6d4f"
              value={formData.needsBasicBasket}
              onValueChange={(value) => handleInputChange("needsBasicBasket", value)}
            />
            <Text style={styles.checkboxLabel}>Precisa de cesta básica?</Text>
          </View>
          <View style={styles.checkboxItem}>
            <ExpoCheckbox
              value={formData.firstVisit}
              color="#8c6d4f"
              onValueChange={(value) => handleInputChange("firstVisit", value)}
            />
            <Text style={styles.checkboxLabel}>Primeira visita na igreja?</Text>
          </View>
          <View style={styles.checkboxItem}>
            <ExpoCheckbox
              value={formData.needsVisit}
              color="#8c6d4f"
              onValueChange={(value) => handleInputChange("needsVisit", value)}
            />
            <Text style={styles.checkboxLabel}>Gostaria de uma visita?</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={saveVisitor}>
          {loading ? (
            <ActivityIndicator color="#fff" size={30} />
          ) : (
            <Text style={styles.buttonText}>Adicionar visitante</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  container: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#a56726",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#8c6d4f",
    marginBottom: 5,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#c8a883",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 14,
    backgroundColor: "#f9f5f0",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  checkboxContainer: {
    marginBottom: 20,
  },
  checkboxItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: "#8c6d4f",
  },
  button: {
    backgroundColor: "#a56726",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});