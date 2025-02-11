import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  Button,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { db, collection, getDocs, doc, deleteDoc } from "../firebaseConfig";
import { FontAwesome6 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Visitor {
  id: string;
  name: string;
  visitDate: Date;
}

export default function ViewVisitorsScreen({ navigation }: any) {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [cargo, setCargo] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [isModalVisible, setIsModalVisible] = useState(false); // Estado da modal
  const [visitorToDelete, setVisitorToDelete] = useState<string | null>(null); // ID do visitante a ser excluído

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

  const fetchVisitors = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "visitors"));
      let visitorsData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          visitDate: data.visitDate?.toDate ? data.visitDate.toDate() : new Date(data.visitDate),
        };
      }) as Visitor[];

      visitorsData.sort((a, b) => b.visitDate.getTime() - a.visitDate.getTime());
      setVisitors(visitorsData);
    } catch (error) {
      console.error("Erro ao buscar visitantes:", error);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchVisitors();
    setRefreshing(false);
  };

  const filterVisitorsByPeriod = () => {
    const now = new Date();
    return visitors.filter((visitor) => {
      const visitDate = new Date(visitor.visitDate);

      switch (selectedPeriod) {
        case "actualWeek":
          const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
          return visitDate >= startOfWeek;
        case "actualMonth":
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          return visitDate >= startOfMonth;
        case "actualYear":
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          return visitDate >= startOfYear;
        case "lastWeek":
          const lastWeek = new Date(now.setDate(now.getDate() - 7));
          return visitDate >= lastWeek && visitDate < new Date();
        case "lastMonth":
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          return visitDate >= lastMonth && visitDate < new Date();
        case "lastYear":
          const lastYear = new Date(now.getFullYear() - 1, 0, 1);
          return visitDate >= lastYear && visitDate < new Date();
        default:
          return true;
      }
    });
  };

  const openDeleteModal = (visitorId: string) => {
    setVisitorToDelete(visitorId);
    setIsModalVisible(true);
  };

  const deleteVisitor = async () => {
    if (visitorToDelete) {
      try {
        await deleteDoc(doc(db, "visitors", visitorToDelete));
        setVisitors((prevVisitors) => prevVisitors.filter((visitor) => visitor.id !== visitorToDelete));
        Alert.alert("Sucesso", "Visitante excluído com sucesso");
      } catch (error) {
        console.error("Erro ao excluir visitante:", error);
        Alert.alert("Erro", "Houve um problema ao excluir o visitante");
      }
      setIsModalVisible(false); // Fecha a modal após a exclusão
      setVisitorToDelete(null); // Reseta o ID do visitante a ser excluído
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setVisitorToDelete(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.pickerContainer}>
        <FontAwesome6 name="calendar-alt" size={24} color="#FFF" style={styles.pickerIcon} />
        <Picker selectedValue={selectedPeriod} onValueChange={(itemValue) => setSelectedPeriod(itemValue)} style={styles.picker} dropdownIconColor="#fff" dropdownIconRippleColor="#BD7833">
          <Picker.Item label="Todas as visitas" value="all" />
          <Picker.Item label="Esta semana" value="actualWeek" />
          <Picker.Item label="Este mês" value="actualMonth" />
          <Picker.Item label="Este ano" value="actualYear" />
          <Picker.Item label="Última semana" value="lastWeek" />
          <Picker.Item label="Último mês" value="lastMonth" />
          <Picker.Item label="Último ano" value="lastYear" />
        </Picker>
      </View>
      <FlatList
        data={filterVisitorsByPeriod()}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("VisitorDetails", { visitor: item })}>
            <View style={styles.iconContainer}>
              <FontAwesome6 name="user-circle" size={40} color="#A8661E" />
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.visitDate}>{item.visitDate.toLocaleDateString("pt-BR")}</Text>
            </View>
            {(cargo === "ADMIN" || cargo === "PASTOR") && (
              <TouchableOpacity style={styles.deleteButton} onPress={() => openDeleteModal(item.id)}>
                <FontAwesome6 name="trash-alt" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#A8661E"]} />}
      />

      {/* Modal de confirmação */}
      <Modal visible={isModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>Tem certeza de que deseja excluir este visitante?</Text>
            <View style={styles.modalButtons}>
              <Button title="Cancelar" onPress={closeModal} color="#A8661E" />
              <Button title="Excluir" onPress={deleteVisitor} color="#D32F2F" />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF" },
  listContainer: { paddingHorizontal: 20 },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#f9e4d6", borderRadius: 10, marginBottom: 15, padding: 15, elevation: 1 },
  iconContainer: { marginRight: 15 },
  infoContainer: { flex: 1 },
  name: { fontSize: 20, fontWeight: "bold", color: "#a56726" },
  visitDate: { fontSize: 14, color: "#8c6d4f", fontWeight: "bold" },
  deleteButton: { marginLeft: 10, backgroundColor: "#D32F2F", padding: 10, borderRadius: 5 },
  picker: { flex: 1, color: "#fff" },
  pickerContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#BD7F3A", margin: 10, paddingHorizontal: 10, borderRadius: 5 },
  pickerIcon: { marginRight: 10 },

  // Estilos para a modal
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: "80%",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
});
