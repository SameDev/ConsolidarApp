import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    TouchableHighlight,
    Image,
    SafeAreaView,
} from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import AddVisitorScreen from "./AddVisitorScreen";
import ViewVisitorsScreen from "./VisitorNavigation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AdminScreen from "./AdminScreen";
import VisitorNavigation from "./VisitorNavigation";

type RootStackParamList = {
    HomeScreenView: undefined;
    AddVisitor: undefined;
    ViewVisitors: undefined;
    AdminScreen: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

// Páginas (Screens)
function HomeScreenView({ navigation }: { navigation: any }) {
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
    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Cabeçalho */}
            <View style={styles.header}>
                <Text style={styles.title}>Página Inicial</Text>
                <Image
                    source={require("../assets/logo.png")}
                    style={styles.logo}
                />
            </View>

            {/* Botões principais */}
            <View style={styles.mainButtons}>
                <TouchableHighlight underlayColor="#FFECD9"
                    style={styles.button}
                    onPress={() => navigation.navigate("AddVisitor")}
                >
                    <View style={styles.buttonContent}>
                        <FontAwesome6 name="user-plus" size={28} color="#A8661E" />
                        <Text style={styles.buttonText}>Adicionar novo visitante</Text>
                    </View>
                </TouchableHighlight>

                <TouchableHighlight underlayColor="#FFC17D"
                    style={styles.buttonSecondary}
                    onPress={() => navigation.navigate("ViewVisitors")}
                >
                    <View style={styles.buttonContent}>
                        <FontAwesome6 name="user-group" size={28} color="#FFF" />
                        <Text style={[styles.buttonText, { color: "#fff" }]}>
                            Ver todos os visitantes
                        </Text>
                    </View>
                </TouchableHighlight>
                {cargo === "ADMIN" || cargo === "PASTORES" ? (
                    <TouchableHighlight underlayColor="#FFAD94"
                        style={[styles.button, {backgroundColor: '#F28E6F', marginTop: 20, }]}
                        onPress={() => navigation.navigate("AdminScreen")}
                    >
                        <View style={styles.buttonContent}>
                            <FontAwesome6 name="chart-line" size={28} color="#FFF" />
                            <Text style={[styles.buttonText, { color: "#fff" }]}>
                                Ver desempenho geral
                            </Text>
                        </View>
                    </TouchableHighlight>
                ) : null}
            </View>
            
        </SafeAreaView>
    );
}

// Configuração do Stack Navigator
export default function HomeScreen() {
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

    return (
        <Stack.Navigator
        initialRouteName="HomeScreenView"
        screenOptions={({ route }) => ({
            headerStyle: {
                backgroundColor: "#fff",
            },
            headerTintColor: "#A8661E",
            headerShadowVisible: false,
            headerTitle: () => (
                <View style={styles.headerContainer}>
                    <Text style={styles.headerText}>{getHeaderTitle(route.name)}</Text>
                    <Image
                        source={require("../assets/logo.png")}
                        style={styles.logo}
                    />
                </View>
            ),
        })}
    >
                <Stack.Screen
                    name="HomeScreenView"
                    component={HomeScreenView}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="AddVisitor"
                    component={AddVisitorScreen}
                    options={{ title: "Adicionar Visitante" }}
                />
                
                <Stack.Screen
                    name="ViewVisitors"
                    component={VisitorNavigation}
                    options={{ headerShown: false }}
                    
                />
                {cargo === "ADMIN" || cargo === "PASTORES" ? (
                    <Stack.Screen
                    name="AdminScreen"
                    component={AdminScreen}
                    options={{ title: "Adicionar Visitante" }}
                    />
                ) : null}
            </Stack.Navigator>
    );
}

function getHeaderTitle(routeName: string) {
    switch (routeName) {
        case "AddVisitor":
            return "Adicionar Visitante";
        case "ViewVisitors":
            return "Visitantes";
        default:
            return "";
    }
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#FFF",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#FFF",
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
    },
    headerText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#A8661E",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#A56429",
    },
    logo: {
        width: 40,
        height: 40,
        resizeMode: "contain",
    },
    mainButtons: {
        padding: 20,
    },
    button: {
        backgroundColor: "#FDDAB8",
        borderRadius: 10,
        padding: 15,
        paddingVertical: 30,
        marginBottom: 20,
    },
    buttonSecondary: {
        backgroundColor: "#E9AA6D",
        borderRadius: 10,
        padding: 15,
        paddingVertical: 30,
    },
    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    buttonText: {
        marginLeft: 20,
        fontSize: 16,
        fontWeight: "bold",
        color: "#A56429",
    },
});
