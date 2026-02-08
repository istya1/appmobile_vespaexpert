import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import SplashScreen from './src/screens/splash';
import AppNavigator from './src/navigation/app-navigator';
import './src/global.css';

const RootStack = createNativeStackNavigator();

export default function App() {
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