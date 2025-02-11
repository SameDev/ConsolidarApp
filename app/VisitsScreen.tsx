import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  Alert,
  ActivityIndicator,
} from "react-native";
import { db, collection,  getDocs } from "../firebaseConfig";
import { FontAwesome } from "@expo/vector-icons";
import {addDoc, deleteDoc, doc, query, where} from 'firebase/firestore';
import ExpoCheckbox from "expo-checkbox";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Visit {
    id: string;
    visitorId: string;
    deaconName: string;
    additionalPeople: string[];
    needsBibleStudy: boolean;
    visitDate: {
      seconds: number;
      nanoseconds: number;
    };
  }
  

  export default function VisitsScreen({ route }: any) {
    const { visitorId } = route.params;
    const [visits, setVisits] = useState<Visit[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [newVisit, setNewVisit] = useState({
      deaconName: "",
      additionalPeople: "",
      needsBibleStudy: false,
      visitDate: new Date().toISOString().split("T")[0],
    });
  
    useEffect(() => {
      fetchVisits();
    }, []);
  
    const [cargo, setCargo] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await AsyncStorage.getItem("@user_data");
                if (userData) {
                    const parsedData = JSON.parse(userData);
                    setCargo(parsedData.cargo);
                }
            } catch (error) {
                console.error("Erro ao buscar dados do usuário:", error);
            }
        };
        fetchUserData();
    }, []);
  
    const fetchVisits = async () => {
      if (!visitorId) {
        console.error("visitorId não definido.");
        return;
      }
  
      try {
        const visitsRef = collection(db, "visits");
        const q = query(visitsRef, where("visitorId", "==", visitorId));
        const querySnapshot = await getDocs(q);
        const visitsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Visit, "id">),
        }));
        setVisits(visitsData);
      } catch (error) {
        console.error("Erro ao buscar visitas:", error);
      }
    };
  
    const handleDeleteVisit = async (visitId: string) => {
      try {
        await deleteDoc(doc(db, "visits", visitId));
        Alert.alert("Sucesso", "Visita excluída com sucesso!");
        fetchVisits(); // Atualiza a lista de visitas
      } catch (error) {
        console.error("Erro ao excluir visita:", error);
        Alert.alert("Erro", "Não foi possível excluir a visita.");
      }
    };

    const handleRegisterVisit = async () => {
        if (!visitorId || !newVisit.deaconName) {
          Alert.alert("Erro", "Todos os campos obrigatórios devem ser preenchidos.");
          return;
        }
      
        try {
          const visitData: Omit<Visit, "id" | "visitDate"> = {
            visitorId,
            deaconName: newVisit.deaconName,
            additionalPeople: newVisit.additionalPeople.split(",").map((p) => p.trim()),
            needsBibleStudy: newVisit.needsBibleStudy,
          };
      
          await addDoc(collection(db, "visits"), {
            ...visitData,
            visitDate: new Date(),
          });
      
          Alert.alert("Sucesso", "Visita cadastrada com sucesso!");
          setIsModalVisible(false);
          fetchVisits();
        } catch (error) {
          console.error("Erro ao cadastrar visita:", error);
          Alert.alert("Erro", "Não foi possível cadastrar a visita.");
        }
      };
  
    const renderVisit = ({ item }: any) => (
      <View style={styles.visitItem}>
        <Text style={styles.visitText}>
          <Text style={styles.bold}>Data:</Text>{" "}
          {new Date(item.visitDate.seconds * 1000).toLocaleDateString()}
        </Text>
        <Text style={styles.visitText}>
          <Text style={styles.bold}>Acolhedor:</Text> {item.deaconName}
        </Text>
        <Text style={styles.visitText}>
          <Text style={styles.bold}>Acompanhantes:</Text> {item.additionalPeople.join(", ")}
        </Text>
        <Text style={styles.visitText}>
          <Text style={styles.bold}>Precisa de Estudo Bíblico:</Text>{" "}
          {item.needsBibleStudy ? "Sim" : "Não"}
        </Text>
        {cargo === "ADMIN" || cargo === "PASTORES" ? (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() =>
              Alert.alert(
                "Confirmar Exclusão",
                "Tem certeza que deseja excluir esta visita?",
                [
                  { text: "Cancelar", style: "cancel" },
                  { text: "Excluir", onPress: () => handleDeleteVisit(item.id) },
                ]
              )
            }
          >
            <Text style={styles.deleteButtonText}>Excluir</Text>
          </TouchableOpacity>
        ) : (null)}
      </View>
    );
  
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsModalVisible(true)}
        >
          <FontAwesome name="plus" size={20} color="#FFF" />
          <Text style={styles.addButtonText}>Adicionar Visita</Text>
        </TouchableOpacity>
  
        <FlatList
          data={visits}
          keyExtractor={(item) => item.id}
          renderItem={renderVisit}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhuma visita cadastrada.</Text>
          }
        />
  
  <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nova Visita</Text>

            <TextInput
              style={styles.input}
              placeholder="Nome do Acolhedor"
              value={newVisit.deaconName}
              onChangeText={(text) => setNewVisit({ ...newVisit, deaconName: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Acompanhantes (separados por vírgula)"
              value={newVisit.additionalPeople}
              onChangeText={(text) => setNewVisit({ ...newVisit, additionalPeople: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Data da Visita (AAAA-MM-DD)"
              value={newVisit.visitDate}
              onChangeText={(text) => setNewVisit({ ...newVisit, visitDate: text })}
            />

            <View style={styles.checkboxContainer}>
              <ExpoCheckbox
                value={newVisit.needsBibleStudy}
                onValueChange={(value) => setNewVisit({ ...newVisit, needsBibleStudy: value })}
              />
              <Text style={styles.checkboxLabel}>Precisa de Estudo Bíblico?</Text>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleRegisterVisit}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Salvar</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: "#D32F2F" }]}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      </SafeAreaView>
    );
  }
  

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 20,
  },
  addButton: {
    flexDirection: "row",
    backgroundColor: "#A56429",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  addButtonText: {
    color: "#FFF",
    marginLeft: 10,
    fontWeight: "bold",
  },
  visitItem: {
    padding: 15,
    backgroundColor: "#F9E4D6",
    borderRadius: 10,
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: "#D32F2F",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  visitText: {
    fontSize: 16,
    color: "#8c6d4f",
  },
  bold: {
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    color: "#8c6d4f",
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#FFF8F1",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#D4C4AF",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: "#A56429",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  checkboxLabel: {
    marginLeft: 8,
    color: "#8c6d4f",
  },
});
