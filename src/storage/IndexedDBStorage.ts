import { AsyncStorage } from '../config'

export class IndexedDBStorage implements AsyncStorage {
  
  constructor(
    public readonly dbName: string,
    public readonly storeName: string = 'mobx-store'
  ) {}

  public async init() {
    this.openDatabase()
  }

  // #region Open

  private dbPromise: Promise<IDBDatabase> | undefined

  private db() {
    return this.dbPromise ??= this.openDatabase()
  }

  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1)
      const storeName = this.storeName

      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName)
        }
      }

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  // #endregion

  async getItem(key: string): Promise<object | null> {
    const db = await this.db()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(key)

      request.onsuccess = () => {
        resolve(request.result ?? null)
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  async setItem(key: string, value: object): Promise<void> {
    const db = await this.db()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.put(value, key)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }


}