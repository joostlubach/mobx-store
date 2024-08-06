import { IReactionDisposer, reaction, runInAction } from 'mobx'
import config from './config'
import { metaFor } from './meta'
import { HydrateFunction, PersistFunction, Store, StoreConstructor } from './types'

export function persist<TStore extends Store, TState>(
  Store: StoreConstructor<TStore>,
  key: string,
  persist: PersistFunction<TStore, TState>,
  hydrate: HydrateFunction<TStore, TState>,
) {
  const meta = metaFor(Store, true)
  meta.persist = {key, persist, restore: hydrate}
}

export function persistStores<S extends Record<string, any>>(stores: Store[], state: S, save: (state: S) => void) {
  const persistedState: S = {...state}
  const disposers: IReactionDisposer[] = []

  runInAction(() => {
    for (const store of stores) {
      const meta = metaFor(store, false)
      if (meta?.persist == null) { continue }

      const {key, restore} = meta.persist

      const storeState = persistedState[key]
      if (storeState != null) {
        config.logger.debug(`Restoring persisted state of ${store.constructor.name}`, storeState)

        restore(store, storeState)
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
