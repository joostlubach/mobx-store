import { isFunction } from 'lodash'
import config from './config'
import { metaFor } from './meta'
import { Store } from './types'

export async function initStore(store: Store) {
  try {
    const meta = metaFor(store, false)
    if (meta == null) { return }

    for (const key of meta.inits) {
      const fn = (store as any)[key]
      if (!isFunction(fn)) { continue }

      const retval = await fn.call(store)
      if (isFunction(retval)) {
        meta.deinits.push(retval)
      }
    }
    config.logger.debug(`Initialized ${store.constructor.name}`)
    return true
  } catch (error) {
    config.logger.error(`Error while initializing ${store.constructor.name}`)
    config.logger.error(error)
    return false
  }
}

export async function deinitStore(store: Store) {
  try {
    const meta = metaFor(store, false)
    if (meta == null) { return }

    for (const deinit of meta.deinits) {
      const fn = isFunction(deinit) ? deinit : (store as any)[deinit]
      if (!isFunction(fn)) { continue }

      await fn.call(store)
    }
    return true
  } catch (error) {
    config.logger.error(`Error while deinitializing ${store.constructor.name}`)
    config.logger.error(error)
    return false
  }
}

export function initStores(stores: Store[], timeout: number = 5000): Promise<boolean> {
  const promises = stores.flatMap(store => Promise.race([
    initStore(store),
    timeoutAfter(`Init of ${store.constructor.name} timed out`, timeout),
  ]))
  return Promise.all(promises).then(results => results.every(it => it))
}

export function deinitStores(stores: Store[], timeout: number = 5000): Promise<boolean> {
  const promises = stores.flatMap(store => Promise.race([
    deinitStore(store),
    timeoutAfter(`Deinit of ${store.constructor.name} timed out`, timeout),
  ]))
  return Promise.all(promises).then(results => results.every(it => it))
}

function timeoutAfter(message: string, ms: number) {
  return new Promise((_, reject) => {
    setTimeout(() => {
      config.logger.error(message)
      reject(false)
    }, ms)
  })
}