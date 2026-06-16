import { Store, StoreConstructor, StoreMeta } from './types'

const META = new Map<StoreConstructor<any>, StoreMeta>()

export function metaFor(store: Store, createIfNotFound: false): StoreMeta | undefined
export function metaFor(store: Store, createIfNotFound: true): StoreMeta
export function metaFor(store: Store, createIfNotFound: boolean) {
  const StoreClass = (store instanceof Function ? store : store.constructor) as StoreConstructor<any>

  let meta = META.get(StoreClass)
  if (meta == null && createIfNotFound) {
    META.set(StoreClass, meta = StoreMeta.empty())
  }

  return meta
}

export function storeName(store: Store | StoreConstructor<any>) {
  const StoreClass = store instanceof Function ? store : store.constructor
  return metaFor(StoreClass, true).name
}