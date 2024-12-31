import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface PhotoDBSchema extends DBSchema {
  photos: {
    key: number;
    value: {
      id: number;
      photo: string;
      description: string;
      position: number;
      rotation: number;
    };
  };
}

const DB_NAME = 'photo-report-db';
const DB_VERSION = 1;

export const initializeDB = async (): Promise<IDBPDatabase<PhotoDBSchema>> => {
  return openDB<PhotoDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('photos')) {
        db.createObjectStore('photos', {
          keyPath: 'id',
          autoIncrement: true,
        });
        console.log('Object store "photos" created.');
      }
    },
  });
};

export const dbPromise = initializeDB();