import * as React from 'react'
import { memo } from 'react-util'
import { wrapArray } from 'ytil'
import { deinitStores, initStores } from './lifecycle'
import { Store, StoreConstructor } from './types'

export type StoreContext = Store[]
export const StoreContext = React.createContext<StoreContext>([])

export interface StoreProviderProps {
  store?: Store | Store[]
  Store?: StoreConstructor<Store> | StoreConstructor<Store>[]

  initialize?: boolean
  onInitialized?: () => any
  onInitializationError?: (error: Error) => any

  children?: React.ReactNode
}

export const StoreProvider = memo('StoreProvider', (props: StoreProviderProps) => {

  const {
    store,
    Store,
    initialize = true,
    onInitialized,
    onInitializationError,
    children
  } = props

  const newStores = React.useMemo(() => [
    ...wrapArray(store ?? []),
    ...wrapArray(Store ?? []).map(Store => new Store())    
  ], [])

  React.useEffect(() => {
    if (!initialize) { return }

    initStores(newStores).then(
      () => { onInitialized?.() },
      error => onInitializationError?.(error)
    )

    return () => {
      deinitStores(newStores)
    }
  }, [initialize])

  const parent = React.useContext(StoreContext)
  const context = React.useMemo((): StoreContext => [...parent, ...newStores], [])

  return (
    <StoreContext.Provider value={context}>
      {children}
    </StoreContext.Provider>
  )
})