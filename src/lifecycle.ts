import { isArray, isFunction } from 'lodash'
import config from './config'
import { metaFor, storeName } from './meta'
import { DeinitFn, Store } from './types'

export async function preinitStore(store: Store) {
  try {
    const meta = metaFor(store, false)
    if (meta == null) { return }
    if (meta.preinits.size === 0) { return }

    for (const key of meta.preinits) {
      const fn = (store as any)[key]
      if (!isFunction(fn)) { continue }

      const retval = await fn.call(store)
      if (isFunction(retval)) {
        addDeinitsForInstance(store, [retval])
      } else if (isArray(retval) && retval.every(isFunction)) {
        addDeinitsForInstance(store, retval)
      }
    }
    config.logger.debug(`Pre-initialized ${storeName(store)}`)
  } catch (error) {
    config.logger.error(`Error while pre-initializing ${storeName(store)}`, [error])
  }
}

export async function initStore(store: Store) {
  try {
    const meta = metaFor(store, false)
    if (meta == null) { return true }

    for (const key of meta.inits) {
      const fn = (store as any)[key]
      if (!isFunction(fn)) { continue }

      const retval = await fn.call(store)
      if (isFunction(retval)) {
        addDeinitsForInstance(store, [retval])
      } else if (isArray(retval) && retval.every(isFunction)) {
        addDeinitsForInstance(store, retval)
      }
    }
    config.logger.debug(`Initialized ${storeName(store)}`)
    return true
  } catch (error) {
    config.logger.error(`Error while initializing ${storeName(store)}`, [error])
    return false
  }
}

function addDeinitsForInstance(store: Store, deinits: DeinitFn[]) {
  const meta = metaFor(store, false)
  if (meta == null) { return }

  let instanceDeinits = meta.deinitsByInstance.get(store)
  if (instanceDeinits == null) {
    instanceDeinits = []
    meta.deinitsByInstance.set(store, instanceDeinits)
  }
  instanceDeinits.push(...deinits)
}

export async function deinitStore(store: Store) {
  try {
    const meta = metaFor(store, false)
    if (meta == null) { return true }

    for (const key of meta.deinits) {
      const fn = (store as any)[key]
      if (!isFunction(fn)) { continue }

      await fn.call(store)
    }

    for (const fn of meta.deinitsByInstance.get(store) ?? []) {
      await fn.call(store)
    }
    
    config.logger.debug(`Deinitialized ${storeName(store)}`)

    return true
  } catch (error) {
    config.logger.error(`Error while deinitializing ${storeName(store)}`, error)
    return false
  }
}

export async function initStores(stores: Store[], timeout: number | null = null): Promise<boolean> {
  const preInitPromises = stores.map(store => runAsyncWithTimeout(
    () => preinitStore(store),
    timeout,
    `Pre-init of ${storeName(store)} timed out`,
  ))
  await Promise.all(preInitPromises)

  const promises = stores.map(store => runAsyncWithTimeout(
    () => initStore(store),
    timeout,
    `Init of ${storeName(store)} timed out`,
  ))

  const results = await Promise.all(promises)
  return results.every(it => it)
}

export async function deinitStores(stores: Store[], timeout: number = 5000): Promise<boolean> {
  const promises = stores.map(store => runAsyncWithTimeout(
    () => deinitStore(store),
    timeout,
    `Deinit of ${storeName(store)} timed out`,
  ))

  const results = await Promise.all(promises)
  return results.every(it => it)
}

function runAsyncWithTimeout(fn: () => Promise<any>, timeout: number | null, message: string): Promise<boolean> {
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

    if (timeout != null) {
      setTimeout(onTimeout, timeout)
    }
    fn().then(onSuccess).catch(reject)  
  })
}