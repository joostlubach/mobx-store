import { isFunction } from 'lodash'
import config from './config'
import { metaFor } from './meta'
import { Store } from './types'

export async function initStore(store: Store) {
  try {
    const meta = metaFor(store, false)
    if (meta == null) { return true }

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
    config.logger.error(`Error while initializing ${store.constructor.name}`, [error])
    return false
  }
}

export async function deinitStore(store: Store) {
  try {
    const meta = metaFor(store, false)
    if (meta == null) { return true }

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

export async function initStores(stores: Store[], timeout: number = 5000): Promise<boolean> {
  const promises = stores.map(store => runAsyncWithTimeout(
    () => initStore(store),
    timeout,
    `Init of ${store.constructor.name} timed out`
  ))

  const results = await Promise.all(promises)
  return results.every(it => it)
}

export async function deinitStores(stores: Store[], timeout: number = 5000): Promise<boolean> {
  const promises = stores.map(store => runAsyncWithTimeout(
    () => deinitStore(store),
    timeout,
    `Deinit of ${store.constructor.name} timed out`
  ))

  const results = await Promise.all(promises)
  return results.every(it => it)
}

function runAsyncWithTimeout(fn: () => Promise<any>, timeout: number, message: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    let resolved: boolean = false

    const onSuccess = () => {
      if (resolved) { return }
      resolved = true
      resolve(true)
    }

    const onTimeout = () => {
      if (resolved) { return }
      config.logger.error(message)
      resolved = true
      resolve(false)
    }

    setTimeout(onTimeout, timeout)
    fn().then(onSuccess).catch(reject)  
  })
}