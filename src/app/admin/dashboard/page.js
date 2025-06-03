"use client";
import '@/app/globals.css';
import { useEffect, useState } from "react";
import { auth, db } from "@/app/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import UserSwimlane from "@/app/components/userswimlane";
import Modal from "@/app/components/modal";           
import { useRouter } from "next/navigation";

export const markTaskDone = async (taskId, done) => {
  const taskRef = doc(db, "tasks", taskId);
  await updateDoc(taskRef, { done });
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const [userName, setUserName] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [tasks, setTasks] = useState({});
  const [openId, setOpenId] = useState(null);
  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const [confirmTaskId, setConfirmTaskId] = useState(null);


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

        if (data.role === "admin") {
          
          const unsubscribeUsers = onSnapshot(
            collection(db, "users"),
            (snap) => {
              const users = [];
              snap.forEach((d) => {
                const u = d.data();
                if (u.role !== "admin") users.push({ id: d.id, ...u });
              });
              setAllUsers(users);
            }
          );
          
          return unsubscribeUsers;
        }
      }
    } else {
      setUser(null);
      setRole("");
      setAllUsers([]);
    }
  });

  return () => unsubscribeAuth();
}, []);


  

  useEffect(() => {
    if (role !== "admin") return;
    const unsubscribeTasks = onSnapshot(collection(db, "tasks"), (snapshot) => {
      const tasksByUser = {};
      snapshot.forEach(doc => {
        const task = { id: doc.id, ...doc.data() };
        if (!tasksByUser[task.userId]) tasksByUser[task.userId] = [];
        tasksByUser[task.userId].push(task);
      });
      setTasks(tasksByUser);
    });
    return () => unsubscribeTasks();
  }, [role]);



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


  
  const deleteUser = async (userId) => {
    try {
      await deleteDoc(doc(db, "users", userId));
      setModalMessage("Användaren har nu tagits bort!");
      setShowModal(true);
    } catch (error) {
      setModalMessage("Fel vid borttagning");
      setShowModal(true);
    }
  };

  const closeModal = () => setShowModal(false);

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  if (!user) return <p>Logga in för att se sidan</p>;

  return (
    <>
      <button className="logout-btn" onClick={handleLogout}>
        Logga Ut
      </button>

      <h1>{role === "admin" ? "Admin Dashboard" : "User Dashboard"}</h1>
      <p>Välkommen, {userName}!</p>

     
      {showModal && (
        <Modal message={modalMessage} onClose={closeModal} />
      )}

      {role === "admin" ? (
        <>
          <h2>Användare:</h2>
          {allUsers.map((u) => (
            <UserSwimlane
              key={u.id}
              user={u}
              tasks={tasks[u.id] || []}
              isOpen={openId === u.id}
              onToggle={() => setOpenId(openId === u.id ? null : u.id)}
              markTaskDone={markTaskDone}
              deleteUser={deleteUser}        
            />
          ))}
        </>
      ) : (
        <>
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
                  onClick={() =>
                  markTaskDone(task.id, !task.done)
                  }
                >
                  {task.done ? "✔️ Klar" : "Klarmarkera"}
                </button>
                <button
                  className="user-btn"
                  style={{marginLeft: "10px"}}
                  onClick={() => deleteTask(task.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </>
      )}
    </>
  );
}
