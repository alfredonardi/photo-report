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
const DB_VERSION = 3; // v3: Adiciona originalPhoto e rotationMetadata para rotação sem perda

/**
 * Inicializa o banco de dados IndexedDB
 * Cria object store e índices necessários
 */
export const initializeDB = async (): Promise<IDBPDatabase<PhotoDBSchema>> => {
  try {
    return await openDB<PhotoDBSchema>(DB_NAME, DB_VERSION, {
      async upgrade(db, oldVersion, newVersion, transaction) {
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
        } else {
          // Store já existe, processar migrações
          const store = transaction.objectStore('photos');

          // Migração v1 → v2: Adiciona índice by-position
          if (oldVersion < 2) {
            if (!store.indexNames.contains('by-position')) {
              store.createIndex('by-position', 'position', { unique: false });
              console.log('Index "by-position" added to existing store');
            }
          }

          // Migração v2 → v3: Adiciona originalPhoto e rotationMetadata
          if (oldVersion < 3) {
            console.log('Migrating to v3: Adding originalPhoto and rotationMetadata...');

            const allPhotos = await store.getAll();
            console.log(`Migrating ${allPhotos.length} photos to new format...`);

            for (const photo of allPhotos) {
              // Para fotos antigas, usa os valores existentes
              const migratedPhoto = {
                ...photo,
                originalPhoto: photo.originalPhoto || photo.photo, // Usa photo se originalPhoto não existir
                rotationMetadata: photo.rotationMetadata !== undefined
                  ? photo.rotationMetadata
                  : (photo.rotation || 0), // Usa rotation se rotationMetadata não existir
              };

              await store.put(migratedPhoto);
            }

            console.log('✅ Migration to v3 completed successfully!');
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
