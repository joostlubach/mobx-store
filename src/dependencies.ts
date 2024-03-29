import { isFunction } from 'lodash'
import { objectEntries } from 'ytil'

import { metaFor } from './meta.js'
import { InjectKey, Store } from './types.js'

export async function injectDependencies(store: Store, getDependency: (key: InjectKey) => any) {
  const meta = metaFor(store, false)
  if (meta == null) { return }

  for (const [prop, [key, transform]] of objectEntries(meta.injects)) {
    const dependency = getDependency(key)
    if (dependency == null) {
      const name = isFunction(key) ? key.name : key
      throw new Error(`Cannot inject store of type \`${name}\` as it is not found`)
    }

    Object.assign(store, {[prop]: transform(dependency)})
  }
}
