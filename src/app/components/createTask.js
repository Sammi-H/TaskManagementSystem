import { collection, addDoc } from "firebase/firestore";
import { auth, db } from "@/app/lib/firebase";

export default async function createTask(data) {
  const userId = data.userId;
  await addDoc(collection(db, "tasks"), {
    ...data,
    userId,  
  });
}

