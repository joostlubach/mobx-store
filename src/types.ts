export type Store = object
export type StoreConstructor<S extends Store> = new (...args: any[]) => S
export type Constructor<T> = new (...args: any[]) => T

export type InitFn = () => void | Promise<void>
export type DeinitFn = () => void | Promise<void>

export type InjectKey = Function

export interface StoreMeta {
  inits:   Array<() => void | Promise<void>>
  deinits: Array<() => void | Promise<void>>
  injects: Record<string, [InjectKey, (from: any) => any]>
  persist: PersistConfig<any, any> | null
}

export const StoreMeta: {
  empty: () => StoreMeta
} = {
  empty: () => ({
    inits:   [],
    deinits: [],
    injects: {},
    persist: null,
  }),
}

export interface PersistConfig<TStore extends Store, TState> {
  key:     string
  persist: PersistFunction<TStore, TState>
  hydrate: HydrateFunction<TStore, TState>
}

export type PersistFunction<TStore extends Store, TState> = (store: TStore) => TState
export type HydrateFunction<TStore extends Store, TState> = (store: TStore, state: TState) => void
