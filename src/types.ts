export type StoreConstructor = new () => Object

export type InitFn = () => void | Promise<void>
export type DeinitFn = () => void | Promise<void>

export type PersistFunction<Store, State> = (store: Store) => State
export type RehydrateFunction<Store, State> = (store: Store, state: State) => void

export interface StoreMeta {
  inits:    Array<() => void | Promise<void>>
  deinits:  Array<() => void | Promise<void>>
  persists: Persist[]
}

export interface Persist {
  property: string
  key?:     string
}

export const StoreMeta: {
  empty: () => StoreMeta
} = {
  empty: () => ({
    inits: [],
    deinits: [],
    persists: []
  })
}