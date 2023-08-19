import { StoreMeta } from './types'

const META = new WeakMap<Function, StoreMeta>()

export function metaFor(store: Object, createIfNotFound: false): StoreMeta | undefined
export function metaFor(store: Object, createIfNotFound: true): StoreMeta
export function metaFor(store: Object, createIfNotFound: boolean) {
  const StoreClass = store instanceof Function ? store : store.constructor

  let meta = META.get(StoreClass)
  if (meta == null && createIfNotFound) {
    META.set(StoreClass, meta = StoreMeta.empty())
  }

  return meta
}