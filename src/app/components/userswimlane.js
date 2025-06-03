import { useState } from "react";
import createTask from "@/app/components/createTask";
import { deleteDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import '@/app/globals.css';
import Modal from "./modal";


function UserSwimlane({ user, isOpen, onToggle, tasks, markTaskDone, deleteUser }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [modal, setModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");





 const deleteTask = async (taskId) => {
  try {
    await deleteDoc(doc(db, "tasks", taskId));
    setModalMessage("Uppgiften är nu raderad!");
  } catch (error) {
    setModalMessage("Fel vid radering");
  }
  setModal(true);
};


  const updateTask = async(taskId) => {
    await updateDoc(doc(db, "tasks", taskId), {
      title: editTitle,
      description: editDescription,
      deadline: editDeadline
    });
    setEditingTaskId(null);
  }




  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !deadline) return alert("Titel och deadline krävs");

    console.log("Skapar uppgift för användare-ID:", user.id);
    console.log("Uppgiftsdata:", { title, description, deadline });

    try {
      await createTask({
        title,
        description,
        deadline,
        done: false,
        createdAt: new Date().toISOString(),
        userId: user.id 
      });
      console.log("Uppgift skapad utan felmeddelanden");
    } catch (error) {
      console.error("Fel vid skapande:", error);
    }

    console.log("Formulär återställt");
    setTitle("");
    setDescription("");
    setDeadline("");
  };

  return (
    <div className="swimlane-container">
      <div className="swimlane-row">
        <div className="column users-column">
          <div className="user-name" onClick={onToggle}>{user.name}</div>
        </div>

        {isOpen && (
          <>
            <div className="column task-info-column">
              <div className="task-panel">
                <form onSubmit={handleSubmit}>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Titel"
                    required
                  />
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Beskrivning"
                  />
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    required
                  />
                  <button type="submit" style={{ marginRight: "2em" }}>Skapa uppgift</button>
                  <button onClick={() => deleteUser(user.id)} type="button">Ta bort användare</button>
                </form>
              </div>
            </div>
            <div className="column task-detail-column">
              <div className="task-list">
                <p>Uppgifter för {user.name}:</p>
                {tasks.length === 0 && <p className="no-tasks">Inga uppgifter än.</p>}
                {tasks.map((task) => {
                  console.log("Task data:", task);
                  return (
                    <div key={task.id} style={{ marginBottom: "10px" }}>
                      <strong style={{ marginTop: "20px", display: "flex" }}>{task.title} - {task.deadline}</strong>
                      <br />
                      {task.description && <small style={{ marginTop: "5px", marginBottom: "20px", display: "block" }}>{task.description}</small>}
                      <div>
                        <button onClick={() => markTaskDone(task.id, !task.done)}>
                          {task.done ? "✔️ Klar" : "Klarmarkera"}
                        </button>
                        <br />
                        <button onClick={() => deleteTask(task.id)}>Ta bort</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
      {modal && <Modal message={modalMessage} onClose={() => setModal(false)} />}
    </div>
  );
};


export default UserSwimlane;