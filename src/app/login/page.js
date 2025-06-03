"use client";
import {useEffect, useState} from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import {doc, getDoc} from "firebase/firestore";
import {auth, db} from "../lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Modal from "@/app/components/modal";   



const Login = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");




const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    console.log("Inloggning lyckades!");

    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    const fetchedRole = docSnap.exists() ? docSnap.data().role : null;

    router.push(fetchedRole === "admin" ? "/admin/dashboard" : "/user/dashboard");
  } catch (error) {
    if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
      setModalMessage("Vänligen registrera dig");
    } else if (error.code === "auth/wrong-password") {
      setModalMessage("Fel lösenord, försök igen");
    } else {
      setModalMessage("Något gick fel. Försök igen.");
    }
    setShowModal(true);
    console.error("Fel vid inloggning:", error.message);
  }
};




return(
  
  <div className="login-portal">
    <h1>Välkommen till</h1>
    <p> arbetsuppgiftportalen</p>

  <form onSubmit={handleLogin}>

    <input
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="E-Post" required
    />

    <input
    type ="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="Lösenord" required
    />

    <button className="btn" type="submit">Logga in</button>
    <Link href="/registrera">
    <button className="btn" type="button">Registrera dig</button>
    </Link>
  </form>

  {showModal &&
  <Modal message={modalMessage}
    onClose={() => setShowModal(false)} />}

  </div>
);

}


export default Login;