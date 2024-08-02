import { Store, StoreMeta } from './types'

const META = new Map<Store, StoreMeta>()

export function metaFor(store: Store, createIfNotFound: false): StoreMeta | undefined
export function metaFor(store: Store, createIfNotFound: true): StoreMeta
export function metaFor(store: Store, createIfNotFound: boolean) {
  const StoreClass = store instanceof Function ? store : store.constructor

  let meta = META.get(StoreClass)
  if (meta == null && createIfNotFound) {
    META.set(StoreClass, meta = StoreMeta.empty())
  }

  return meta
}

export function allStores() {
  return Array.from(META.keys())
}