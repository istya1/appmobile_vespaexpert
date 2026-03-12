// import React, { createContext, useContext, useState, useEffect } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { LightTheme, DarkTheme } from './theme';

// const ThemeContext = createContext<any>(null);

// export const ThemeProvider = ({ children }: any) => {
//   const [darkMode, setDarkMode] = useState(true);

//   useEffect(() => {
//     loadTheme();
//   }, []);

//   const loadTheme = async () => {
//     const saved = await AsyncStorage.getItem('theme');
//     if (saved === 'light') {
//       setDarkMode(false);
//     }
//   };

//   const toggleTheme = async () => {
//     const newTheme = !darkMode;
//     setDarkMode(newTheme);
//     await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
//   };

//   const theme = darkMode ? DarkTheme : LightTheme;

//   return (
//     <ThemeContext.Provider value={{ theme, darkMode, toggleTheme }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };

// export const useTheme = () => useContext(ThemeContext);