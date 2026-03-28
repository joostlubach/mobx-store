import { action, reaction, runInAction } from 'mobx'
import config from './config'
import { metaFor } from './meta'
import { PersistFunction, RestoreFunction, Store, StoreConstructor } from './types'

export function persist<TStore extends Store, TState>(
  Store: StoreConstructor<TStore>,
  key: string,
  persist: PersistFunction<TStore, TState>,
  hydrate: RestoreFunction<TStore, TState>,
) {
  const meta = metaFor(Store, true)
  meta.persist = {key, persist, restore: hydrate}
}

export async function persistStores(stores: Store[]) {
  const promises = stores.map(loadPersistedStore)
  await Promise.all(promises)

  stores.forEach(autopersistStore)
  config.storage.addListener?.(action(state => {
    for (const store of stores) {
      const meta = metaFor(store, false)
      if (meta?.persist == null) { continue }

      const {key, restore} = meta.persist
      const storeState = (state as any)[key]
      if (storeState != null) {
        runInAction(() => restore(store, storeState))
      }
    }
  }))
}

async function loadPersistedStore(store: Store) {
  const meta = metaFor(store, false)
  if (meta?.persist == null) { return null }
  
  const {key, restore} = meta.persist
  const state = await loadFromStorage(key)
  if (state == null) { return null }
  
  runInAction(() => restore(store, state))
}

function autopersistStore(store: Store) {
  const meta = metaFor(store, false)
  if (meta?.persist == null) { return null }

  const {key, persist} = meta.persist
  return reaction(() => persist(store), state => {
    saveToStorage(key, state)
  })
}

export async function loadFromStorage(key: string) {
  return await config.storage.getItem(key)
}

export async function saveToStorage(key: string, state: object) {
  await config.storage.setItem(key, state)
}

export async function removeFromStorage(key: string) {
  await config.storage.removeItem(key)
}