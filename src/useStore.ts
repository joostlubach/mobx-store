import * as React from 'react'

import { StoreContext } from './StoreContext'
import { StoreConstructor } from './types'

export function useStore<C extends StoreConstructor<any>>(Store: C): InstanceType<C> {
  const stores = React.useContext(StoreContext)
  const store = stores.find(store => store instanceof Store)
  if (!store) {
    throw new StoreNotFoundError(Store)
  }

  return store as InstanceType<C>
}

export class StoreNotFoundError extends Error {
  
  constructor(
    public readonly Store: StoreConstructor<any>
  ) {
    super(`Store not found: ${Store.name}`)
  }

}