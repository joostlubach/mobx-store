import { isArray, isFunction } from 'lodash'
import Logger from 'logger'
import { metaFor, storeName } from './meta'
import { Store } from './types'

export async function preinitStore(store: Store, logger?: Logger) {
  try {
    const meta = metaFor(store, false)
    if (meta == null) { return }
    if (meta.preinits.length === 0) { return }

    for (const key of meta.preinits) {
      const fn = (store as any)[key]
      if (!isFunction(fn)) { continue }

      const retval = await fn.call(store)
      if (isFunction(retval)) {
        meta.deinits.push(retval)
      } else if (isArray(retval) && retval.every(isFunction)) {
        meta.deinits.push(...retval)
      }
    }
    logger?.debug(`Pre-initialized ${storeName(store)}`)
  } catch (error) {
    logger?.error(`Error while pre-initializing ${storeName(store)}`, [error])
  }
}

export async function initStore(store: Store, logger?: Logger) {
  try {
    const meta = metaFor(store, false)
    if (meta == null) { return true }

    for (const key of meta.inits) {
      const fn = (store as any)[key]
      if (!isFunction(fn)) { continue }

      const retval = await fn.call(store)
      if (isFunction(retval)) {
        meta.deinits.push(retval)
      } else if (isArray(retval) && retval.every(isFunction)) {
        meta.deinits.push(...retval)
      }
    }
    logger?.debug(`Initialized ${storeName(store)}`)
    return true
  } catch (error) {
    logger?.error(`Error while initializing ${storeName(store)}`, [error])
    return false
  }
}

export async function deinitStore(store: Store, logger?: Logger) {
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
    logger?.error(`Error while deinitializing ${storeName(store)}`, error)
    return false
  }
}

export async function initStores(stores: Store[], logger?: Logger, timeout: number | null = null): Promise<boolean> {
  const preInitPromises = stores.map(store => runAsyncWithTimeout(
    () => preinitStore(store, logger),
    timeout,
    `Pre-init of ${storeName(store)} timed out`,
    logger,
  ))
  await Promise.all(preInitPromises)

  const promises = stores.map(store => runAsyncWithTimeout(
    () => initStore(store, logger),
    timeout,
    `Init of ${storeName(store)} timed out`,
    logger,
  ))

  const results = await Promise.all(promises)
  return results.every(it => it)
}

export async function deinitStores(stores: Store[], logger?: Logger, timeout: number = 5000): Promise<boolean> {
  const promises = stores.map(store => runAsyncWithTimeout(
    () => deinitStore(store, logger),
    timeout,
    `Deinit of ${storeName(store)} timed out`,
    logger,
  ))

  const results = await Promise.all(promises)
  return results.every(it => it)
}

function runAsyncWithTimeout(fn: () => Promise<any>, timeout: number | null, message: string, logger?: Logger): Promise<boolean> {
  return new Promise((resolve, reject) => {
    let resolved: boolean = false

    const onSuccess = () => {
      if (resolved) { return }
      resolved = true
      resolve(true)
    }

    const onTimeout = () => {
      if (resolved) { return }
      logger?.error(message)
      resolved = true
      resolve(false)
    }

    if (timeout != null) {
      setTimeout(onTimeout, timeout)
    }
    fn().then(onSuccess).catch(reject)  
  })
}