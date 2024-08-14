import { Store } from 'mobx-store'
import { isFunction } from 'ytil'
import { metaFor } from './meta'
import { StoreEvent } from './types'

const allStores = new Set<Store>()

export function dispatch(source: Store, event: StoreEvent) {
  for (const store of allStores) {
    const meta = metaFor(store, false)
    if (meta == null) { continue }

    for (const key of meta.handlers[event] ?? []) {
      const handler = (store as any)[key]
      if (!isFunction(handler)) { continue }

      handler.call(store, source)
    }
  }
}

export function registerStore(store: Store) {
  allStores.add(store)
}