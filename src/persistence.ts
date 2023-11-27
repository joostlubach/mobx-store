import { IReactionDisposer, reaction, runInAction } from 'mobx'
import { metaFor } from './meta'
import { HydrateFunction, PersistFunction, StoreConstructor, Store } from './types'

export function persist<TStore extends Store, TState>(
  Store: StoreConstructor<TStore>,
  key: string,
  persist: PersistFunction<TStore, TState>,
  hydrate: HydrateFunction<TStore, TState>,
) {
  const meta = metaFor(Store, true)
  meta.persist = {key, persist, hydrate}
}

export function persistStores<S extends Record<string, any>>(stores: Store[], state: S, save: (state: S) => void) {
  const persistedState: S = {...state}
  const disposers: IReactionDisposer[] = []

  runInAction(() => {
    for (const store of stores) {
      const meta = metaFor(store, false)
      if (meta?.persist == null) { continue }

      const {key, hydrate} = meta.persist

      const storeState = persistedState[key]
      if (storeState != null) {
        hydrate(store, storeState)
      }
    }
  })

  for (const store of stores) {
    const meta = metaFor(store, false)
    if (meta?.persist == null) { continue }

    const {key, persist} = meta.persist
    disposers.push(reaction(() => persist(store), state => {
      Object.assign(persistedState, {[key]: state})
      save(persistedState)
    }))
  }

  return disposers
}
