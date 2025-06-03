"use client";
import { useState, useEffect } from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {doc, setDoc} from "firebase/firestore";
import {auth, db} from "@/app/lib/firebase";
import Modal from "../components/modal";


export default function RegisterPage() {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("user");
    const [errors, setErrors] = useState({});
    const [showModal, setShowModal] = useState(false);
    const router = useRouter();




    const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("handleSubmit körs");

  const newErrors = {};
  if (!name) newErrors.name = "Namn krävs";
  if (!email) newErrors.email = "E-post krävs";
  if (!password) newErrors.password = "Lösenord krävs";
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    console.log("user.uid:", user?.uid);
    console.log("data:", { name, email, role });

    try {
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        role,
        createdAt: new Date().toISOString(),
      });
      console.log("setDoc lyckades");
    } catch (docErr) {
      console.error("setDoc-fel:", docErr);
      throw docErr; 
    }

    console.log("Modal should be visible:", true);
    setShowModal(true);
    setName("");
    setEmail("");
    setPassword("");
    setRole("user");
    setErrors({});
  } catch (err) {
    console.error("Registreringsfel:", err);
    alert("Fel vid registrering: " + err.message);
  }
};


    console.log(errors);


 

    return(
    
   <>
   {console.log("Rendering, showModal =", showModal)}

   {showModal && (
    <Modal
    message="Nu har dina uppgifter blivit sparade"
    onClose={() => setShowModal(false)}
    />
   )}
      

    <div className="registration-form">
    <h1>Vänligen</h1>
    <p> registrera dina uppgifter</p>
    <form onSubmit={handleSubmit}>

    <input type="text" 
    placeholder="Namn"
    value={name}
    onChange={(e) => setName(e.target.value)}
    />
    {errors.name && <p className="errors">{errors.name}</p>}

    <input type="email" 
    placeholder="E-post"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    />
    {errors.email && <p className="errors">{errors.email}</p> }
    
    <input type="password"
    placeholder="Lösenord"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    />
    {errors.password && <p className="errors">{errors.password}</p>}

   

    <button type="submit" className="btn">Spara</button>
    <Link href="/login">
    <button type="button" className="btn">Tillbaka</button> 
    </Link> 
    </form>
    </div>
    
    </>

    );
}