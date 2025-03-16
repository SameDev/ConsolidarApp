import React, { Component } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { db, collection, getDocs } from "../firebaseConfig";
import { FontAwesome6 } from "@expo/vector-icons";

interface Study {
  id: string;
  name: string;
  discipler: string;
  companion: string;
}

interface State {
  studies: Study[];
  refreshing: boolean;
}

export default class BibleStudyScreen extends Component<any, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      studies: [],
      refreshing: false,
    };
  }

  async componentDidMount() {
    await this.fetchStudies();
  }

  fetchStudies = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "bibleStudies"));
      const studiesData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
        };
      }) as Study[];

      this.setState({ studies: studiesData });
    } catch (error) {
      console.error("Erro ao buscar estudos bíblicos:", error);
    }
  };

  handleRefresh = async () => {
    this.setState({ refreshing: true });
    await this.fetchStudies();
    this.setState({ refreshing: false });
  };

  render() {
    const { studies, refreshing } = this.state;
    const { navigation } = this.props;

    return (
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddBibleStudy")}
        >
          <FontAwesome6 name="plus" size={20} color="#FFF" />
          <Text style={styles.addButtonText}>Adicionar Novo Estudo Bíblico</Text>
        </TouchableOpacity>
        <FlatList
          data={studies}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={this.handleRefresh} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("StudyDetails", { study: item })}>
              <View style={styles.iconContainer}>
                <FontAwesome6 name="user-circle" size={40} color="#A8661E" />
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.discipler}>Discipulador: {item.discipler}</Text>
                <Text style={styles.discipler}>Acompanhante: {item.companion}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
        
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF" },
  listContainer: { paddingHorizontal: 20 },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#f9e4d6", borderRadius: 10, marginBottom: 15, padding: 15, elevation: 1 },
  iconContainer: { marginRight: 15 },
  infoContainer: { flex: 1 },
  name: { fontSize: 20, fontWeight: "bold", color: "#a56726" },
  discipler: { fontSize: 14, color: "#8c6d4f", fontWeight: "bold" },
  addButton: {
    flexDirection: "row",
    backgroundColor: "#A56429",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    margin: 20,
  },
  addButtonText: {
    color: "#FFF",
    marginLeft: 10,
    fontWeight: "bold",
  },
});