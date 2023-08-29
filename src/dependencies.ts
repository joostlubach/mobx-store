import { objectEntries } from 'ytil'
import { metaFor } from './meta'

export async function injectDependencies(store: Object, stores: Object[]) {
  const meta = metaFor(store, false)
  if (meta == null) { return }

  for (const [key, StoreClass] of objectEntries(meta.stores)) {
    const injectedStore = stores.find(it => it instanceof StoreClass)
    if (injectedStore == null) {
      throw new Error(`Cannot inject store of type \`${StoreClass.name}\` as it is not found`)
    }

    Object.assign(store, {[key]: injectedStore})
  }
}