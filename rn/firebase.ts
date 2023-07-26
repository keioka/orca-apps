import { initializeApp } from 'firebase/app';

// Optionally import the services that you want to use
// import {...} from "firebase/auth";
// import {...} from "firebase/database";
// import {...} from "firebase/firestore";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";
console.log("process.env.NODE_ENV", process.env.NODE_ENV)

const firebaseConfig = process.env.NODE_ENV === "production" ?
  {
    apiKey: "AIzaSyCWcbOM8E5zytmulWOn9CQIObYoU9GqISI",
    authDomain: "orca-app-prod.firebaseapp.com",
    databaseURL: "https://orca-app-prod-default-rtdb.firebaseio.com",
    projectId: "orca-app-prod",
    storageBucket: "orca-app-prod.appspot.com",
    messagingSenderId: "1013757441489",
    appId: "1:1013757441489:web:4e5a1ec690629c3a369cf0"
  } : {
    apiKey: "AIzaSyCA-apxqk7ggH4MJd3SU6lcAmB0-NSDE1g",
    authDomain: "orca-app-stg.firebaseapp.com",
    projectId: "orca-app-stg",
    storageBucket: "orca-app-stg.appspot.com",
    messagingSenderId: "660565417900",
    appId: "1:660565417900:web:19b24f4ab38a1b1712a409"
  };

export let firebase: any = null

try {
  firebase = initializeApp(firebaseConfig);
} catch (error) {
  console.error(error)
}

