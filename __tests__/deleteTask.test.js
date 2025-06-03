jest.mock('firebase/firestore', () => ({
  doc: jest.fn(() => ({ id: '123' })),
  deleteDoc: jest.fn(() => Promise.resolve()),
}));

jest.mock('@/app/lib/firebase', () => ({
  db: {}
}));

const { deleteDoc, doc } = require('firebase/firestore');
const { db } = require('@/app/lib/firebase');

const setModalMessage = jest.fn();
const setShowModal = jest.fn();

const deleteTask = async (taskId) => {
  try {
    await deleteDoc(doc(db, "tasks", taskId));
    setModalMessage("Uppgiften är nu raderad!");
  } catch (error) {
    setModalMessage("Fel vid radering av uppgift");
  }
  setShowModal(true);
};

describe('deleteTask', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ska anropa deleteDoc korrekt och visa lyckad meddelande', async () => {
    await deleteTask('123');
    expect(doc).toHaveBeenCalledWith(db, 'tasks', '123');
    expect(deleteDoc).toHaveBeenCalledWith({ id: '123' });
    expect(setModalMessage).toHaveBeenCalledWith("Uppgiften är nu raderad!");
    expect(setShowModal).toHaveBeenCalledWith(true);
  });

  it('ska hantera fel och visa felmeddelande', async () => {
    deleteDoc.mockImplementationOnce(() => Promise.reject(new Error('fail')));
    await deleteTask('123');
    expect(setModalMessage).toHaveBeenCalledWith("Fel vid radering av uppgift");
    expect(setShowModal).toHaveBeenCalledWith(true);
  });
});
