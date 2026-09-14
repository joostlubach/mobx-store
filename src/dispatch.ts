import { isFunction } from 'ytil'
import { metaFor } from './meta'
import { Store, StoreEventMap } from './types'

const allStores = new Set<Store>()

export function dispatch<E extends keyof StoreEventMap>(source: Store, type: E, payload: StoreEventMap[E]) {
  for (const store of allStores) {
    const meta = metaFor(store, false)
    if (meta == null) { continue }

    for (const key of meta.handlers[type] ?? []) {
      const handler = (store as any)[key]
      if (!isFunction(handler)) { continue }

      handler.call(store, payload)
    }
  }
}

export function registerStore(store: Store) {
  allStores.add(store)
}