import { FontAwesome } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  Alert,
  ActivityIndicator,
  ScrollView
} from "react-native";
import { db, doc, updateDoc, deleteDoc } from "../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDoc } from "firebase/firestore";
import ExpoCheckbox from "expo-checkbox";

interface Visitor {
  visitDate: any;
  id: string;
  name: string;
  email?: string;
  phone?: string;
  nameAdded: string;
  prayerReason: string;
  needsBasicBasket: boolean;
  needsVisit: boolean;
  address: string;
  createdAt: {
    toDate: () => Date;
  };
  hasVisit: boolean;
  visit: any;
  receivedBasicBaskets?: number;
}

export default function VisitorDetailScreen({ route, navigation }: any) {
  const { visitor }: { visitor: Visitor } = route.params;
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editedVisitor, setEditedVisitor] = useState(visitor);
  const [cargo, setCargo] = useState<string | null>(null);
  const [visitData, setVisitData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentVisitor, setCurrentVisitor] = useState(visitor);
  const [needBasket, setNeedBasket] = useState(visitor.needsBasicBasket);

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

    const fetchVisitData = async () => {
      if (currentVisitor.visit) {
        const visitSnap = await getDoc(currentVisitor.visit);
        if (visitSnap.exists()) {
          setVisitData(visitSnap.data());
        } else {
          console.log("Visita não encontrada.");
        }
      }
    };

    fetchUserData();
    fetchVisitData();
  }, [currentVisitor]);

  const handleEdit = async () => {
    setIsEditing(true);
    try {
      const visitorRef = doc(db, "visitors", visitor.id);
      await updateDoc(visitorRef, {
        name: editedVisitor.name,
        phone: editedVisitor.phone,
        address: editedVisitor.address,
        needsBasicBasket: needBasket,
        prayerReason: editedVisitor.prayerReason,
      });
      Alert.alert("Sucesso", "Visitante atualizado com sucesso!");
      setCurrentVisitor({ ...currentVisitor, ...editedVisitor, needsBasicBasket: needBasket });
      setEditModalVisible(false);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar o visitante.");
      console.error("Erro ao editar visitante:", error);
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    try {
      const visitorRef = doc(db, "visitors", visitor.id);
      await deleteDoc(visitorRef);
      Alert.alert("Sucesso", "Visitante excluído com sucesso!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível excluir o visitante.");
      console.error("Erro ao excluir visitante:", error);
    }
  };

  const handleRegisterBasket = async () => {
    try {
      const visitorRef = doc(db, "visitors", visitor.id);
      const updatedBaskets = (currentVisitor.receivedBasicBaskets || 0) + 1;
      await updateDoc(visitorRef, {
        needsBasicBasket: false,
        receivedBasicBaskets: updatedBaskets,
      });
      setNeedBasket(false)
      Alert.alert("Sucesso", "Entrega de cesta básica registrada com sucesso!");
      setCurrentVisitor({
        ...currentVisitor,
        needsBasicBasket: false,
        receivedBasicBaskets: updatedBaskets,
      });
    } catch (error) {
      Alert.alert("Erro", "Não foi possível registrar a entrega da cesta básica.");
      console.error("Erro ao registrar cesta básica:", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.tabIcon}>
        <FontAwesome name="user-circle" size={90} color="#A56429" />
        <Text style={styles.tabTextName}>{currentVisitor.name}</Text>
      </View>
      <View style={styles.infoContainer}>
        {(cargo === "ADMIN" || cargo === "PASTOR") && (
           <>
            <Text style={styles.label}>Adcionado por:</Text>
            <Text style={styles.value}>{currentVisitor.nameAdded} - {currentVisitor.createdAt?.toDate().toLocaleDateString('pt-BR') || "N/A"}</Text>
            </>
        )}
        
        <Text style={styles.label}>Primeira visita na Igreja:</Text>
        <Text style={styles.value}>
          {currentVisitor.visitDate?.toLocaleDateString("pt-BR") || "N/A"}
        </Text>

        {currentVisitor.phone && (
          <>
            <Text style={styles.label}>Telefone:</Text>
            <Text style={styles.value}>{currentVisitor.phone}</Text>
          </>
        )}

        <Text style={styles.label}>Endereço:</Text>
        <Text style={styles.value}>{currentVisitor.address}</Text>

        <Text style={styles.label}>Motivo de oração:</Text>
        <Text style={styles.value}>{currentVisitor.prayerReason}</Text>

        <Text style={styles.label}>Precisa de Cesta Básica:</Text>
        <Text style={styles.value}>{currentVisitor.needsBasicBasket ? "Sim" : "Não"}</Text>
        
        {currentVisitor.receivedBasicBaskets !== undefined && (
          <>
            <Text style={styles.label}>Cestas Básicas Recebidas:</Text>
            <Text style={styles.value}>{currentVisitor.receivedBasicBaskets}</Text>
          </>
        )}

        {currentVisitor.hasVisit && visitData && (
          <>
            <Text style={styles.label}>Última Visita:</Text>
            <Text style={styles.value}>
              {visitData.visitDate?.toDate().toLocaleDateString() || "N/A"} - {visitData.deaconName || "N/A"}
            </Text>
          </>
        )}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("VisitsScreen", { visitorId: visitor.id })}>
          <Text style={styles.buttonText}>Gerenciar Visitas</Text>
        </TouchableOpacity>
      </View>

      <View style={[{ marginTop: 5, marginBottom: 100 }]}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setEditModalVisible(true)}
        >
          <Text style={styles.buttonText}>Editar</Text>
        </TouchableOpacity>

        {currentVisitor.needsBasicBasket && (
          <TouchableOpacity
            style={styles.button}
            onPress={handleRegisterBasket}
          >
            <Text style={styles.buttonText}>Registrar Cesta Básica</Text>
          </TouchableOpacity>
        )}

        {(cargo === "ADMIN" || cargo === "PASTOR") && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Text style={styles.buttonText}>Excluir Visitante</Text>
          </TouchableOpacity>
        )}

        
      </View>

      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Visitante</Text>

            <TextInput
              style={styles.input}
              value={editedVisitor.name}
              onChangeText={(text) =>
                setEditedVisitor({ ...editedVisitor, name: text })
              }
              placeholder="Nome"
            />

            <TextInput
              style={styles.input}
              value={editedVisitor.phone}
              onChangeText={(text) =>
                setEditedVisitor({ ...editedVisitor, phone: text })
              }
              placeholder="Telefone"
              keyboardType="phone-pad"
            />

            <TextInput
              style={styles.input}
              value={editedVisitor.address}
              onChangeText={(text) =>
                setEditedVisitor({ ...editedVisitor, address: text })
              }
              placeholder="Endereço"
            />

            <TextInput
              style={styles.input}
              value={editedVisitor.prayerReason}
              onChangeText={(text) =>
                setEditedVisitor({ ...editedVisitor, prayerReason: text })
              }
              placeholder="Motivo de oração"
            />

            <View style={styles.checkboxItem}>
              <ExpoCheckbox
                value={needBasket}
                color="#C6B09D"
                onValueChange={(value) => setNeedBasket(value)}
              />
              <Text style={styles.checkboxLabel}>Precisa de cesta básica?</Text>
            </View>

            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              {isEditing ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Salvar</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: "#D32F2F" }]}
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFF",
  },
  tabIcon: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
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
  tabTextName: {
    marginBottom: 10,
    fontSize: 23,
    color: "#A56429",
    fontWeight: "bold",
    fontFamily: "Poppins",
  },
  infoContainer: {
    backgroundColor: "#f9e4d6",
    borderRadius: 10,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#A8661E",
    marginTop: 10,
  },
  editButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#A56429",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  value: {
    fontSize: 16,
    color: "#8c6d4f",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#A56429",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
    width: "100%",
    marginHorizontal: 5,
    marginBottom: 5,
  },
  deleteButton: {
    backgroundColor: "#D32F2F",
    padding: 15,
    width: "100%",
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
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
    alignItems: "center",
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
    backgroundColor: "#FFF",
  },
});
