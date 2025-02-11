import { FontAwesome, FontAwesome6 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { View, Text, SafeAreaView, StyleSheet, StatusBar, TouchableOpacity } from "react-native";

interface User {
    displayName: string;
    email: string;
    cargo: string;
}

export default function UserScreen({ onLogout }: { onLogout: () => void }) {
    const [user, setUser] = useState<User | null>(null); // Alterado para armazenar um único objeto User ou null

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await AsyncStorage.getItem("@user_data");
                if (userData) {
                    const parsedData: User = JSON.parse(userData); // Converta para o tipo User
                    setUser(parsedData);
                }
            } catch (error) {
                console.error("Erro ao buscar dados do usuário:", error);
            }
        };
        fetchUserData();
    }, []);

    return (
        <View style={styles.tabContainer}>
            {user ? (
                <View style={styles.tabIcon}>
                    <FontAwesome name="user-circle" size={90} color="#A56429" />
                    <Text style={styles.tabTextName}>{user.displayName}</Text>
                    <Text style={styles.tabTextCargo}>{user.cargo}</Text>
                    <Text style={styles.tabTextEmail}>{user.email}</Text>
                </View>
            ) : (
                <Text style={styles.loadingText}>Carregando dados do usuário...</Text>
            )}
            <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
                <Text style={styles.logoutText}>Sair do Aplicativo</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#FFF",
    },
    tabIcon: {
        marginTop: 30,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    tabContainer: {
        flex: 1,
        padding: 20,
    },
    tabTextName: {
        marginTop: 20,
        fontSize: 23,
        color: "#A56429",
        fontWeight: "bold",
        fontFamily: "Poppins"
    },
    tabTextEmail: {
        fontSize: 18,
        color: "#A56429",
        fontWeight: "bold",
    },
    tabTextCargo: {
        fontSize: 18,
        marginTop: -4,
        color: "#A56429",
        fontWeight: "bold",
    },
    loadingText: {
        fontSize: 18,
        color: "#A56429",
        textAlign: "center",
        marginTop: 20,
        
    },
    logoutButton: {
        marginTop: 20,
        backgroundColor: "#BD7F3A",
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    logoutText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
    },
});
