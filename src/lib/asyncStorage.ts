// IndexedDB persistent storage utility for large data objects (decor items, categories, images)
// Bypasses 5MB localStorage browser quota limit completely while staying synchronous/fast via in-memory cache

const DB_NAME = 'fleur_app_db_v2';
const STORE_NAME = 'key_value_store';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

// In-memory cache for instant synchronous access
const memoryCache: Record<string, any> = {};

/**
 * Synchronous initial load from memory cache or fallback to localStorage
 */
export function getSyncStorageItem<T>(key: string, defaultValue: T): T {
  if (memoryCache[key] !== undefined) {
    return memoryCache[key] as T;
  }
  try {
    const lsVal = localStorage.getItem(key);
    if (lsVal !== null) {
      const parsed = JSON.parse(lsVal);
      memoryCache[key] = parsed;
      return parsed as T;
    }
  } catch {}
  return defaultValue;
}

/**
 * Async fetch from IndexedDB, fallback to localStorage/defaultValue
 */
export async function getStorageItem<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => {
        if (req.result !== undefined && req.result !== null) {
          memoryCache[key] = req.result;
          resolve(req.result as T);
        } else {
          // Fallback to localStorage
          try {
            const lsVal = localStorage.getItem(key);
            if (lsVal !== null) {
              const parsed = JSON.parse(lsVal);
              memoryCache[key] = parsed;
              resolve(parsed as T);
              return;
            }
          } catch {}
          memoryCache[key] = defaultValue;
          resolve(defaultValue);
        }
      };
      req.onerror = () => {
        try {
          const lsVal = localStorage.getItem(key);
          if (lsVal !== null) {
            const parsed = JSON.parse(lsVal);
            memoryCache[key] = parsed;
            resolve(parsed as T);
            return;
          }
        } catch {}
        resolve(defaultValue);
      };
    });
  } catch (e) {
    try {
      const lsVal = localStorage.getItem(key);
      if (lsVal !== null) {
        return JSON.parse(lsVal) as T;
      }
    } catch {}
    return defaultValue;
  }
}

/**
 * Save value to IndexedDB and memory cache, and optionally to localStorage if small enough
 */
export async function setStorageItem<T>(key: string, value: T): Promise<void> {
  memoryCache[key] = value;

  // Save to IndexedDB (unlimited capacity)
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn(`[IndexedDB] Save failed for key "${key}":`, e);
  }

  // Also try localStorage for quick small items
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // If localStorage is full, remove key from localStorage so it doesn't hold stale truncated data
    try {
      localStorage.removeItem(key);
    } catch {}
  }
}
