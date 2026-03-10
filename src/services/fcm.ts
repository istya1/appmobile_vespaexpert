import messaging from '@react-native-firebase/messaging';
import axios from 'axios';

export const registerFCM = async (userId: any)=>{

  const authStatus = await messaging().requestPermission();

  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if(enabled){

    const token = await messaging().getToken();

    await axios.post("http://192.168.1.11:8000/api/save-token",{
      user_id:userId,
      fcm_token:token
    });

  }

}