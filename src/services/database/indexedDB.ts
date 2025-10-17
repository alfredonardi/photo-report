import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Photo } from '../../types';

/**
 * Schema do IndexedDB usando o tipo Photo da aplicação
 * Mantém consistência entre camada de persistência e domínio
 */
interface PhotoDBSchema extends DBSchema {
  photos: {
    key: number;
    value: Photo;
    indexes: {
      'by-position': number;
    };
  };
}

const DB_NAME = 'photo-report-db';
const DB_VERSION = 2; // Incrementado para adicionar índice

/**
 * Inicializa o banco de dados IndexedDB
 * Cria object store e índices necessários
 */
export const initializeDB = async (): Promise<IDBPDatabase<PhotoDBSchema>> => {
  try {
    return await openDB<PhotoDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        console.log(`Upgrading DB from version ${oldVersion} to ${newVersion}`);
        
        // Cria object store se não existir
        if (!db.objectStoreNames.contains('photos')) {
          const store = db.createObjectStore('photos', {
            keyPath: 'id',
            autoIncrement: true,
          });
          
          // Cria índice para ordenação por posição
          store.createIndex('by-position', 'position', { unique: false });
          
          console.log('Object store "photos" created with index "by-position"');
        } else if (oldVersion < 2) {
          // Migração: adiciona índice se estiver atualizando da v1 para v2
          const store = transaction.objectStore('photos');
          if (!store.indexNames.contains('by-position')) {
            store.createIndex('by-position', 'position', { unique: false });
            console.log('Index "by-position" added to existing store');
          }
        }
      },
      blocked() {
        console.warn('Database blocked. Close other tabs using this database.');
      },
      blocking() {
        console.warn('Database blocking. This version is blocking another connection.');
      },
    });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw new Error('Não foi possível inicializar o banco de dados.');
  }
};

export const dbPromise = initializeDB();
