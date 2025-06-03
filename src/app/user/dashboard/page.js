"use client";
import '@/app/globals.css';
import { useEffect, useState } from "react";
import { auth, db } from "@/app/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import Modal from "@/app/components/modal";           
import { useRouter } from "next/navigation";

export const markTaskDone = async (taskId, done) => {
  const taskRef = doc(db, "tasks", taskId);
  await updateDoc(taskRef, { done });
};

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const [userName, setUserName] = useState("");
  const [tasks, setTasks] = useState({});
  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserName(data.name);
          setRole(data.role);
        }
      } else {
        setUser(null);
        setRole("");
        router.push("/login");
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  useEffect(() => {
    if (role !== "user" || !user) return;
    const q = query(
      collection(db, "tasks"),
      where("userId", "==", user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userTasks = {};
      snapshot.forEach(doc => {
        const task = { id: doc.id, ...doc.data() };
        if (!userTasks[task.userId]) userTasks[task.userId] = [];
        userTasks[task.userId].push(task);
      });
      setTasks(userTasks);
    });
    return () => unsubscribe();
  }, [role, user]);

  const deleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId));
      setModalMessage("Uppgiften är nu raderad!");
    } catch (error) {
      setModalMessage("Fel vid radering av uppgift");
    }
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  if (!user) return <p>Logga in för att se sidan</p>;
  if (role !== "user") return <p>Otillåtet</p>;

  return (
    <>
      <button className="logout-btn" onClick={handleLogout}>
        Logga Ut
      </button>

      <h1>User Dashboard</h1>
      <p>Välkommen, {userName}!</p>

      {showModal && (
        <Modal message={modalMessage} onClose={closeModal} />
      )}

      <h2>Dina uppgifter:</h2>
      {tasks[user.uid]?.map((task) => (
        <div key={task.id} className="task-item">
          <strong className="task-title">
            {task.title}
          </strong>{" "}
          - {task.deadline}
          <p className="task-desc">{task.description}</p>
          <div>
            <button
              className="user-btn"
              onClick={() => markTaskDone(task.id, !task.done)}
            >
              {task.done ? "✔️ Klar" : "Klarmarkera"}
            </button>
            <button
              className="user-btn"
              style={{ marginLeft: "10px" }}
              onClick={() => deleteTask(task.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </>
  );
}
