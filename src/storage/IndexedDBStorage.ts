import { AsyncStorage } from '../config'

let $indexedDB = globalThis.indexedDB

export function setIndexedDBFactory(factory: IDBFactory) {
  $indexedDB = factory
}

export class IndexedDBStorage<R extends object = object> implements AsyncStorage {
  
  constructor(
    public readonly dbName: string,
    private readonly options: IndexedDBStorageOptions<R> = {},
  ) {}

  public async init() {
    await this.openDatabase()
  }

  private get storeName() {
    return this.options.storeName ?? 'mobx-store'
  }

  private encode(value: object): R {
    return this.options.encode ? this.options.encode(value) : value as R
  }

  private decode(value: R): object {
    return this.options.decode ? this.options.decode(value) : value as object
  }

  // #region Open

  private dbPromise: Promise<IDBDatabase> | undefined

  private db() {
    return this.dbPromise ??= this.openDatabase()
  }

  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = $indexedDB.open(this.dbName, 1)
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

  // #region API

  public async getItem(key: string): Promise<object | null> {
    const db = await this.db()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(key)

      request.onsuccess = () => {
        if (request.result == null) {
          resolve(null)
        } else {
          resolve(this.decode(request.result))
        }
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  public async setItem(key: string, value: object): Promise<void> {
    const db = await this.db()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const encoded = this.encode(value)
      const request = store.put(encoded, key)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  public async removeItem(key: string): Promise<void> {
    const db = await this.db()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(key)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  public async clear() {
    const db = await this.db()
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.clear()

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  // #endregion


}

export interface IndexedDBStorageOptions<R> {
  storeName?: string
  encode?: (value: object) => R
  decode?: (raw: R) => object
}