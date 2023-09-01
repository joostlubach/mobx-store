import { reaction } from 'mobx'
import { metaFor } from './meta'
import { HydrateFunction, PersistFunction, StoreConstructor } from './types'

export function persist<TStore extends Object, TState>(
  Store: StoreConstructor<TStore>,
  key: string,
  persist: PersistFunction<TStore, TState>,
  hydrate: HydrateFunction<TStore, TState>,
) {
  const meta = metaFor(Store, true)
  meta.persist = {key, persist, hydrate}
}

export function persistStores<S extends Record<string, any>>(stores: Object[], state: S, save: (state: S) => void) {
  const persistedState: S = {...state}

  for (const store of stores) {
    const meta = metaFor(store, false)
    if (meta?.persist == null) { continue }

    const {key, hydrate, persist} = meta.persist

    const storeState = persistedState[key]
    if (storeState == null) { continue }

    hydrate(store, storeState)
    reaction(() => persist(store), storeState => {
      (persistedState as any)[key] = state
      save({...persistedState, [key]: state})
    })
  }
}