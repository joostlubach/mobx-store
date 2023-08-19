export type InitFn = () => void | Promise<void>
export type DeinitFn = () => void | Promise<void>

export interface StoreMeta {
  inits: Array<() => void | Promise<void>>
  deinits: Array<() => void | Promise<void>>
}

export const StoreMeta: {
  empty: () => StoreMeta
} = {
  empty: () => ({
    inits: [],
    deinits: []
  })
}