import messaging from '@react-native-firebase/messaging';
import axios from 'axios';

export const registerFCM = async (userId:number)=>{

  try{

    const authStatus = await messaging().requestPermission();

    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if(enabled){

      console.log("Notification permission granted");

      const token = await messaging().getToken();

      console.log("FCM TOKEN:",token);

      await axios.post("http://192.168.1.11:8000/api/save-token",{
        user_id:userId,
        fcm_token:token
      });

      console.log("Token berhasil dikirim ke server");

    }

  }catch(error){

    console.log("FCM ERROR",error);

  }

}