import { isFunction } from 'lodash'
import { metaFor } from './meta'

export async function initStore(store: Object) {
  const meta = metaFor(store, false)
  if (meta == null) { return }

  for (const fn of meta.inits) {
    const retval = await fn.call(store)
    if (isFunction(retval)) {
      meta.deinits.push(retval)
    }
  }
}

export async function deinitStore(store: Object) {
  const meta = metaFor(store, false)
  if (meta == null) { return }

  for (const fn of meta.deinits) {
    await fn.call(store)
  }
}