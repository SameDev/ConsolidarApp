import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView, StyleSheet, FlatList, Alert, TouchableOpacity, RefreshControl } from "react-native";
import { db, collection, getDocs } from "../firebaseConfig";
import { Picker } from "@react-native-picker/picker";

export default function AdminScreen({ navigation }: any) {
    const [userCount, setUserCount] = useState(0);
    const [visitorCount, setVisitorCount] = useState(0);
    const [visitCount, setVisitCount] = useState(0);
    const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
    const [filterType, setFilterType] = useState("all");
    const [selectedMonth, setSelectedMonth] = useState("Janeiro");
    const [users, setUsers] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false); // Estado para o refresh

    const months = ["Janeiro", "Fevereiro", "Março", /* ... outros meses */];

    // --- Fetching Data ---
    const fetchUserCount = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            setUserCount(querySnapshot.size);
        } catch (error) {
            console.error("Error fetching users:", error);
            Alert.alert("Error", "Failed to fetch users.");
        }
    };

    const fetchVisitorCount = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "visitors"));
            setVisitorCount(querySnapshot.size);
        } catch (error) {
            console.error("Error fetching visitors:", error);
            Alert.alert("Error", "Failed to fetch visitors.");
        }
    };

    const fetchVisitCount = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "visits"));
            setVisitCount(querySnapshot.size);
        } catch (error) {
            console.error("Error fetching visits:", error);
            Alert.alert("Error", "Failed to fetch visits.");
        }
    };

    const fetchUsers = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            const usersList = querySnapshot.docs.map((doc) => doc.data());
            setUsers(usersList);
            setFilteredUsers(usersList); // Inicialmente, define todos os usuários
        } catch (error) {
            console.error("Error fetching users:", error);
            Alert.alert("Error", "Failed to fetch users.");
        }
    };

    // --- Filtering ---
    const filterUsers = () => {
        let filtered = [...users];

        filtered = filtered.filter((user) =>
            user.cargo && (user.cargo.toUpperCase() === "USUARIO" || user.cargo.toUpperCase() === "DIACONOS")
        );

        setFilteredUsers(filtered);
    };

    // --- Handle Refresh ---
    const handleRefresh = async () => {
        setRefreshing(true); // Ativa o indicador de refresh
        await fetchDataAndFilter(); // Recarrega os dados
        setRefreshing(false); // Desativa o indicador de refresh
    };

    // --- Data Handling ---
    const fetchDataAndFilter = async () => {
        await fetchUserCount();
        await fetchVisitorCount(); // Fetch visitor count
        await fetchVisitCount();  // Fetch visit count
        await fetchUsers(); // Fetch users and set them for filtering
    };

    useEffect(() => {
        fetchDataAndFilter();
    }, [filterType, selectedMonth]);

    useEffect(() => {
        filterUsers(); // Re-filter sempre que `users` ou `filterType` mudar
    }, [filterType, users]);

    // --- Rendering ---
    const renderUserItem = ({ item }: { item: any }) => (
        <TouchableOpacity>
            <View style={styles.userItem}>
                <Text style={styles.userTitle}>{item.name}</Text>
                <Text>{item.email}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* --- Header & Counts --- */}
            <Text style={styles.header}>Painel Administrativo</Text>

            <View style={styles.countsContainer}>
                <View style={styles.countBox}>
                    <Text style={styles.countLabel}>Usuários Cadastrados:</Text>
                    <Text style={styles.countValue}>{userCount}</Text>
                </View>
                <View style={styles.countBox}>
                    <Text style={styles.countLabel}>Visitantes:</Text>
                    <Text style={styles.countValue}>{visitorCount}</Text>
                </View>
                <View style={styles.countBox}>
                    <Text style={styles.countLabel}>Visitas realizadas:</Text>
                    <Text style={styles.countValue}>{visitCount}</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Consolidadores cadastrados:</Text>

            {/* --- Users List with Pull-to-Refresh --- */}
            <FlatList
                data={filteredUsers}
                renderItem={renderUserItem}
                keyExtractor={(item, index) => index.toString()} // Melhor para evitar problemas de chave
                style={styles.userList}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            />
        </SafeAreaView>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    userTitle: {
        fontWeight: 'bold',
        fontSize: 18,
        color: "#BD7F3A"
    },
    safeArea: {
        flex: 1,
        backgroundColor: "#FFF",
        padding: 10,
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#A8661E",
        textAlign: "center",
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#A8661E",
        marginTop: 20,
        marginBottom: 10,
    },
    countText: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#8c6d4f",
        textAlign: "center",
        marginBottom: 20,
    },
    filterContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    picker: {
        width: "48%",
    },
    userList: {
        flex: 1,
    },
    userItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    countsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 20,
    },
    countBox: {
        backgroundColor: "#F0F0F0",
        borderRadius: 8,
        padding: 15,
        alignItems: "center",
        width: "30%",
    },
    countLabel: {
        fontSize: 16,
        color: "#333",
        marginBottom: 5,
    },
    countValue: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#007AFF",
    },
});

