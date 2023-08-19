import { metaFor } from './meta'

export async function initStore(store: Object) {
  const meta = metaFor(store, false)
  if (meta == null) { return }

  for (const fn of meta.inits) {
    await fn.call(store)
  }
}

export async function deinitStore(store: Object) {
  const meta = metaFor(store, false)
  if (meta == null) { return }

  for (const fn of meta.deinits) {
    await fn.call(store)
  }
}