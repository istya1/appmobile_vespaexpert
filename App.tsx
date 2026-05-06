import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
// import SplashScreen from './src/screens/splash';
import AppNavigator from './src/navigation/app-navigator';


const RootStack = createNativeStackNavigator();

export default function App() {
    const API_URL = "https://appraiser-pasty-helpline.ngrok-free.dev/api";

  useEffect(() => {
    fetch(`${API_URL}/motor-types`)
      .then(res => res.json())
      .then(data => {
        console.log("DATA:", data);
      })
      .catch(err => {
        console.log("ERROR:", err);
      });
  }, []);
  
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {/* <RootStack.Screen name="Splash" component={SplashScreen} /> */}
        <RootStack.Screen name="MainApp" component={AppNavigator} />
      </RootStack.Navigator>
      
      <Toast />
    </NavigationContainer>
  );
}