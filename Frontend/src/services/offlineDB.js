const DB_NAME = 'remindarin-offline';
const DB_VERSION = 1;

let dbInstance = null;

const openDB = () => {
  return new Promise((resolve, reject) => {
    if (dbInstance) return resolve(dbInstance);
    
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Chat history store
      if (!db.objectStoreNames.contains('chats')) {
        const chatStore = db.createObjectStore('chats', { keyPath: 'id', autoIncrement: true });
        chatStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      // File system cache store
      if (!db.objectStoreNames.contains('files')) {
        db.createObjectStore('files', { keyPath: 'name' });
      }

      // Dashboard cache store (for full offline support)
      if (!db.objectStoreNames.contains('dashboard')) {
        db.createObjectStore('dashboard', { keyPath: 'id' });
      }
    };
    
    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };
    
    request.onerror = (event) => reject(event.target.error);
  });
};

// Save chat message (works completely offline)
export const saveChatMessage = async (message) => {
  const db = await openDB();
  const tx = db.transaction('chats', 'readwrite');
  const store = tx.objectStore('chats');
  await store.add({
    ...message,
    timestamp: Date.now(),
    offline: true
  });
  return tx.complete;
};

// Get all chat history
export const getChatHistory = async () => {
  const db = await openDB();
  const tx = db.transaction('chats', 'readonly');
  const store = tx.objectStore('chats');
  return new Promise((resolve) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
  });
};

// Dashboard offline caching (IndexedDB - production ready)
export const saveDashboardData = async (data) => {
  const db = await openDB();
  const tx = db.transaction('dashboard', 'readwrite');
  const store = tx.objectStore('dashboard');
  
  const dashboardEntry = {
    id: 'main',
    ...data,
    timestamp: Date.now()
  };
  
  await store.put(dashboardEntry);
  return tx.complete;
};

export const getDashboardData = async () => {
  const db = await openDB();
  const tx = db.transaction('dashboard', 'readonly');
  const store = tx.objectStore('dashboard');
  return new Promise((resolve) => {
    const request = store.get('main');
    request.onsuccess = () => resolve(request.result || null);
  });
};

// File System Access API wrapper
export const saveToLocalFile = async (content, suggestedName = 'remindarin-chat.md') => {
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName,
      types: [{
        description: 'Markdown File',
        accept: { 'text/markdown': ['.md'] }
      }]
    });
    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
    return true;
  } catch (err) {
    console.warn('File System Access API not supported or cancelled', err);
    return false;
  }
};

// Cache API helper for instant loading
export const cacheAIResponse = async (key, response) => {
  const cache = await caches.open('remindarin-ai-cache');
  await cache.put(`/ai-cache/${key}`, new Response(JSON.stringify(response)));
};

export default { 
  saveChatMessage, 
  getChatHistory, 
  saveDashboardData, 
  getDashboardData, 
  saveToLocalFile, 
  cacheAIResponse 
};