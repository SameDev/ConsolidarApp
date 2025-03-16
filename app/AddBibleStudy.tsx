import React, { Component } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { db, collection, getDocs, addDoc } from "../firebaseConfig";
import { Picker } from "@react-native-picker/picker";

interface State {
  name: string;
  discipler: string;
  companion: string;
  startDate: Date | null;
  users: { id: string; name: string }[];
  isLoading: boolean;
  showDatePicker: boolean;
  local: string;
}

export default class AddBibleStudy extends Component<any, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      name: "",
      discipler: "",
      companion: "",
      startDate: null,
      local: "",
      users: [],
      isLoading: false,
      showDatePicker: false,
    };
  }

  async componentDidMount() {
    await this.fetchUsers();
  }

  fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
        };
      });
      this.setState({ users: usersData });
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    }
  };

  handleAddStudy = async () => {
    const { name, discipler, companion, startDate, local } = this.state;

    if (name === "" || discipler === "" || !startDate) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    this.setState({ isLoading: true });

    try {
      await addDoc(collection(db, "bibleStudies"), {
        name,
        discipler,
        companion,
        local,
        startDate: startDate.toISOString(),
      });
      Alert.alert("Sucesso", "Estudo bíblico adicionado com sucesso!");
      this.setState({ name: "", discipler: "", companion: "", startDate: null, isLoading: false });
      this.props.navigation.goBack();
    } catch (error) {
      console.error("Erro ao adicionar estudo bíblico:", error);
      this.setState({ isLoading: false });
      Alert.alert("Erro", "Não foi possível adicionar o estudo bíblico.");
    }
  };

  render() {
    const { name, discipler, companion, startDate, users, isLoading, showDatePicker, local } = this.state;

    return (
      <View style={styles.container}>
        <Text style={styles.label}>Novo(s) discípulo(s) (separados por vírgula)</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={(text) => this.setState({ name: text })}
        />
        <Text style={styles.label}>Discipulador</Text>
        <View style={styles.input}>
          <Picker
            selectedValue={discipler}
            onValueChange={(itemValue) => this.setState({ discipler: itemValue })}
          >
            <Picker.Item label="Selecione um discipulador" value="" />
            {users.map((user) => (
              <Picker.Item key={user.id} label={user.name} value={user.name} />
            ))}
          </Picker>
        </View>
        <Text style={styles.label}>Acompanhante</Text>
        <TextInput
          style={styles.input}
          value={companion}
          onChangeText={(text) => this.setState({ companion: text })}
        />
        <Text style={styles.label}>Data de Início</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => this.setState({ showDatePicker: true })}
        >
          <Text style={styles.dateButtonText}>
            {startDate ? new Date(startDate).toLocaleDateString("pt-BR") : "Selecionar Data"}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={startDate || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              this.setState({ showDatePicker: false });
              if (selectedDate) this.setState({ startDate: selectedDate });
            }}
          />
        )}
        <Text style={styles.label}>Local do estudo</Text>
        <TextInput
          style={styles.input}
          value={local}
          onChangeText={(text) => this.setState({ local: text })}
        />
        <TouchableOpacity style={styles.saveButton} onPress={this.handleAddStudy}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Adicionar Estudo Bíblico</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#FFF" },
  label: { fontSize: 16, marginBottom: 10, color: "#333" },
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
  dateButton: {
    backgroundColor: "#A56429",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  dateButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});