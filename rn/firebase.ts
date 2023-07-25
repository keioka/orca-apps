import { initializeApp } from 'firebase/app';

// Optionally import the services that you want to use
// import {...} from "firebase/auth";
// import {...} from "firebase/database";
// import {...} from "firebase/firestore";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCWcbOM8E5zytmulWOn9CQIObYoU9GqISI",
  authDomain: "orca-app-prod.firebaseapp.com",
  databaseURL: "https://orca-app-prod-default-rtdb.firebaseio.com",
  projectId: "orca-app-prod",
  storageBucket: "orca-app-prod.appspot.com",
  messagingSenderId: "1013757441489",
  appId: "1:1013757441489:web:4e5a1ec690629c3a369cf0"
};

export const firebase = initializeApp(firebaseConfig);