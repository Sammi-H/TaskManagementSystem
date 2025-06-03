export const getFirestore = jest.fn(() => ({}));
export const doc = jest.fn((db, collection, id) => ({ id }));
export const updateDoc = jest.fn(() => Promise.resolve());
export const deleteDoc = jest.fn(() => Promise.resolve());
