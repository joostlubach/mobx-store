import AsyncStorage from '@react-native-async-storage/async-storage'
import * as React from 'react'
import { memo } from 'react-util'
import { wrapArray } from 'ytil'

import { injectDependencies } from './dependencies'
import { deinitStores, initStores } from './lifecycle'
import { persistStores } from './persistence'
import { Store, StoreConstructor } from './types'

export type StoreContext = Store[]
export const StoreContext = React.createContext<StoreContext>([])

export interface StoreProviderProps {
  store?: Store | Store[]
  Store?: StoreConstructor<Store> | StoreConstructor<Store>[]

  initialize?:            boolean
  onInitialized?:         () => any
  onInitializationError?: (error: Error) => any
  initializationTimeout?: number

  children?: React.ReactNode
}

export const StoreProvider = memo('StoreProvider', (props: StoreProviderProps) => {

  const {
    store,
    Store,
    initialize = true,
    onInitialized,
    onInitializationError,
    initializationTimeout,
    children,
  } = props

  const newStores = React.useMemo(() => [
    ...wrapArray(store ?? []),
    ...wrapArray(Store ?? []).map(Store => new Store()),    
  ], [Store, store])

  React.useEffect(() => {
    if (!initialize) { return }

    const init = async () => {

      const state = JSON.parse(await AsyncStorage.getItem('state') ?? '{}')
      persistStores(newStores, state, state => {
        AsyncStorage.setItem('state', JSON.stringify(state))
      })

      initStores(newStores, initializationTimeout).then(
        () => { onInitialized?.() },
        error => onInitializationError?.(error)
      )

      for (const store of newStores) {
        injectDependencies(store, Store => newStores.find(it => it instanceof Store))
      }
    }

    init()
    return () => {
      deinitStores(newStores)
    }
  }, [initializationTimeout, initialize, newStores, onInitializationError, onInitialized])

  const parent = React.useContext(StoreContext)
  const context = React.useMemo((): StoreContext => [...parent, ...newStores], [newStores, parent])

  return (
    <StoreContext.Provider value={context}>
      {children}
    </StoreContext.Provider>
  )
})