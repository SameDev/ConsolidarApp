import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { View, Text, SafeAreaView, StyleSheet, Image } from "react-native";
import ViewVisitorsScreen from "./ViewVisitorScreen";
import VisitorDetailScreen from "./VisitorDetailScreen";
import VisitsScreen from "./VisitsScreen";

type RootStackParamList = {
    Home: undefined;
    AddVisitor: undefined;
    ViewVisitors: undefined;
    AdminScreen: undefined;
    VisitorDetails: undefined;
    VisitsScreen: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function VisitorNavigation({ navigation }: any) {
    return (
        <Stack.Navigator
            initialRouteName="ViewVisitors"
            screenOptions={({ route }) => ({
                headerStyle: {
                    backgroundColor: "#fff",
                },
                headerTintColor: "#A8661E",
                headerShadowVisible: false,
                headerTitle: () => (
                    <View style={styles.headerContainer}>
                        <Text style={styles.headerText}>{getHeaderTitle(route.name)}</Text>
                        <Image source={require("../assets/logo.png")} style={styles.logo} />
                    </View>
                ),
            })}
        >
            <Stack.Screen
                name="ViewVisitors"
                component={ViewVisitorsScreen}
                options={{ title: "Visitantes" }}
            />
            <Stack.Screen
                name="VisitorDetails"
                component={VisitorDetailScreen}
                options={{ title: "Detalhes do Visitante" }}
            />
            <Stack.Screen
                name="VisitsScreen"
                component={VisitsScreen}
                options={{ title: "Detalhes do Visitante" }}
            />

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
    logo: {
        width: 40,
        height: 40,
        resizeMode: "contain",
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
});
