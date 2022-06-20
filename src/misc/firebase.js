
import firebase from 'firebase/app';
import 'firebase/auth' ;
import 'firebase/database';
import 'firebase/storage';


const config={
    apiKey: "AIzaSyA3UzQgt-8jJJVeznatTXuFWH-kwNmHGBQ",
    authDomain: "chatting-web-app-26699.firebaseapp.com",
    projectId: "chatting-web-app-26699",
    storageBucket: "chatting-web-app-26699.appspot.com",
    messagingSenderId: "351401747530",
    appId: "1:351401747530:web:43aa4844127cddf4aa72b3"
  };



const app=firebase.initializeApp(config);

export const auth= app.auth();

export const database= app.database();
export const storage=app.storage();