
export type Store = object

export interface StoreConstructor<S extends Store> {
  new (...args: any[]): S
  name: string
}

export type Constructor<T> = new (...args: any[]) => T

export type InitFn = () => void | Promise<void>
export type DeinitFn = () => void | Promise<void>

export type InjectKey = Function | string

export interface StoreMeta {
  name?:    string
  preinits: Set<string | symbol>
  inits:    Set<string | symbol>
  deinits:  Set<string | symbol>

  deinitsByInstance: WeakMap<Store, DeinitFn[]>

  injects:  Record<string, [InjectKey, (from: any) => void]>
  handlers: Record<string, Set<string | symbol>>
  persist:  PersistConfig<any, any> | null
}

export const StoreMeta: {
  empty: () => StoreMeta
} = {
  empty: () => ({
    preinits: new Set(),
    inits:    new Set(),
    deinits:  new Set(),
    deinitsByInstance: new WeakMap(),
    injects:  {},
    handlers: {},
    persist:  null,
  }),
}

export interface PersistConfig<TStore extends Store, TState> {
  key:     string
  persist: PersistFunction<TStore, TState>
  restore: RestoreFunction<TStore, TState>
}

export type PersistFunction<TStore extends Store, TState> = (store: TStore) => TState | Promise<TState>
export type RestoreFunction<TStore extends Store, TState> = (store: TStore, state: TState) => void

export type StoreEvent = keyof {[K in keyof StoreEventMap as true extends StoreEventMap[K] ? K : never]: any}

// The following are extendable by client code.
export interface StoreEventMap {}