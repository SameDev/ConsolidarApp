import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { FontAwesome6, Ionicons } from '@expo/vector-icons'; // Importação para ícones

import LoginScreen from './app/LoginScreen';
import RegisterScreen from './app/RegisterScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from './app/HomeScreen';
import ViewVisitorsScreen from './app/VisitorNavigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import VisitorNavigation from './app/VisitorNavigation';
import UserScreen from './app/UserScreen';
import ForgotPasswordScreen from './app/ForgotPasswordScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


// Tab Navigator principal
const MainTabs = ({ onLogout }: { onLogout: () => void }) => (
    <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarShowLabel: true,
      tabBarLabelStyle: { fontSize: 12 },
      tabBarStyle: {
        backgroundColor: '#BD7F3A',
        height: 80,
        paddingBottom: 10,
        paddingTop: 10,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 10, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
      },
      tabBarActiveTintColor: '#FFF',
      tabBarInactiveTintColor: '#FFEAD2',
      headerShown: false,
      headerStyle: {
        marginTop: 20
      },
      tabBarIcon: ({ color }) => {
        const iconName =
          route.name === 'Home'
            ? 'house'
            : route.name === 'Visitantes'
            ? 'user-group'
            : 'circle-user';

        return <FontAwesome6 name={iconName} size={28} color={color} />;
      }
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Visitantes" component={VisitorNavigation} />
    <Tab.Screen name="Usuario">
      {() => <UserScreen onLogout={onLogout} />}
    </Tab.Screen>
  </Tab.Navigator>
);

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);



  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await AsyncStorage.getItem('@user_data');
        setIsLoggedIn(!!userData); // Define como true se os dados do usuário existirem
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('@user_data'); // Remove os dados salvos
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Erro ao deslogar:', error);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const userToken = await new Promise((resolve) =>
        setTimeout(() => resolve(false), 1000)
      );
      setIsLoggedIn(!!userToken);
    };
    checkAuth();
  }, []);

  if (isLoggedIn === null) {
    return (
      <View style={styles.container}>
        <Text>Verificando autenticação...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <NavigationContainer>
          {isLoggedIn ? (
            <>        
              <MainTabs onLogout={handleLogout} />
            </>
          ) : (
            <>
              <Stack.Navigator screenOptions={{ headerShown: false, headerStyle: { marginTop: -20 } }} >
                {isRegistering ? (
                  <Stack.Screen name="Cadastro">
                    {() => (
                      <RegisterScreen
                        onRegister={() => setIsLoggedIn(true)}
                        onBackToLogin={() => setIsRegistering(false)}
                      />
                    )}
                  </Stack.Screen>
                ) : (
                  <Stack.Screen name="Login">
                    {() => (
                      <LoginScreen
                        onLogin={() => setIsLoggedIn(true)}
                        onRegister={() => setIsRegistering(true)}
                      />
                    )}
                  </Stack.Screen>
                )}
                <Stack.Screen name="EsqueciSenha" component={ForgotPasswordScreen} />
              </Stack.Navigator>
            </>
          )}
        </NavigationContainer>
        <StatusBar style="light" backgroundColor="#5C360D" />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 18,
    color: '#A56429',
    fontWeight: 'bold',
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#A56429',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
