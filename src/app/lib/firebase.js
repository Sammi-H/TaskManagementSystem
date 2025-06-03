import {initializeApp} from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
import {doc, updateDoc } from "firebase/firestore";



const firebaseConfig = {

    apiKey: "AIzaSyAEln1216uMJ-xENDROLcr8reQ5RYy_55U",
    authDomain: "arbetsuppgiftportal.firebaseapp.com",
    projectId: "arbetsuppgiftportal",
    storageBucket: "arbetsuppgiftportal.appspot.com",
    messagingSenderId: "858695355353",
    appId: "1:858695355353:web:0664de4b01d186825ae7c8",
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {auth, db, getFirestore, doc, updateDoc};