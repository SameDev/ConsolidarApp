import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from './HomeScreen';


type Props = StackScreenProps<RootStackParamList, 'StudyDetails'>;

const StudyDetails: React.FC<Props> = ({ route, navigation }) => {
  const { study } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>Nome do Estudo:</Text>
        <Text style={styles.value}>{study.name}</Text>
        <Text style={styles.label}>Discipulador:</Text>
        <Text style={styles.value}>{study.discipler}</Text>
        <Text style={styles.label}>Acompanhante:</Text>
        <Text style={styles.value}>{study.companion}</Text>
        <Text style={styles.label}>Data de Início:</Text>
        <Text style={styles.value}>{new Date(study.startDate).toLocaleDateString("pt-BR")}</Text>
        <Text style={styles.label}>Local:</Text>
        <Text style={styles.value}>{study.local}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#A56429",
    padding: 15,
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
});

export default StudyDetails;