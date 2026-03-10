import messaging from '@react-native-firebase/messaging';

export async function getFCMToken() {

  const token = await messaging().getToken();

  console.log("FCM TOKEN:", token);

  return token;
}