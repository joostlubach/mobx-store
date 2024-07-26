import { isFunction } from 'lodash'
import { metaFor } from './meta'
import { Store } from './types'

export async function initStore(store: Store) {
  try {
    const meta = metaFor(store, false)
    if (meta == null) { return }

    for (const fn of meta.inits) {
      const retval = await fn.call(store)
      if (isFunction(retval)) {
        meta.deinits.push(retval)
      }
    }
    console.debug(`Initialized ${store.constructor.name}`)
  } catch (error) {
    console.error(`Error while initializing ${store.constructor.name}`)
    console.error(error)
  }
}

export async function deinitStore(store: Store) {
  try {
    const meta = metaFor(store, false)
    if (meta == null) { return }

    for (const fn of meta.deinits) {
      await fn.call(store)
    }
  } catch (error) {
    console.error(`Error while deinitializing ${store.constructor.name}`)
    console.error(error)
  }
}

export function initStores(stores: Store[], timeout: number = 5000) {
  const promises = stores.flatMap(store => Promise.race([
    initStore(store),
    timeoutAfter(`Init of ${store.constructor.name} timed out`, timeout)
  ]))
  return Promise.all(promises)
}

export function deinitStores(stores: Store[], timeout: number = 5000) {
  const promises = stores.flatMap(store => Promise.race([
    deinitStore(store),
    timeoutAfter(`Deinit of ${store.constructor.name} timed out`, timeout)
  ]))
  return Promise.all(promises)
}

function timeoutAfter(message: string, ms: number) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(
      new Error(message)
    ), ms)
  })
}