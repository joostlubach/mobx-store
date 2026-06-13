import { Store, StoreConstructor, StoreMeta } from './types'

const META = new Map<Store, StoreMeta>()

export function metaFor(store: Store, createIfNotFound: false): StoreMeta | undefined
export function metaFor(store: Store, createIfNotFound: true): StoreMeta
export function metaFor(store: Store, createIfNotFound: boolean) {
  let meta = META.get(store)
  if (meta == null && createIfNotFound) {
    META.set(store, meta = StoreMeta.empty())
  }

  return meta
}

export function storeName(store: Store | StoreConstructor<any>) {
  return metaFor(store instanceof Function ? store : store.constructor, true).name
}