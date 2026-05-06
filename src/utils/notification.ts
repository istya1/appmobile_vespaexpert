// import * as Notifications from 'expo-notifications';
// import * as Device from 'expo-device';

// export async function registerForPushNotificationsAsync() {
//   if (!Device.isDevice) return null;

//   const { status } = await Notifications.requestPermissionsAsync();
//   if (status !== 'granted') return null;

//   const token = (await Notifications.getExpoPushTokenAsync()).data;

//   console.log('EXPO TOKEN:', token);

//   return token;
// }