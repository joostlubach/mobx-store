import { AnyConstructor, objectEntries } from 'ytil'

import { metaFor } from './meta'
import { Store } from './types'

export async function injectDependencies(store: Store, getDependency: (Ctor: AnyConstructor) => any) {
  const meta = metaFor(store, false)
  if (meta == null) { return }

  for (const [key, [Ctor, transform]] of objectEntries(meta.injects)) {
    const dependency = getDependency(Ctor)
    if (dependency == null) {
      throw new Error(`Cannot inject store of type \`${Ctor.name}\` as it is not found`)
    }

    Object.assign(store, {[key]: transform(dependency)})
  }
}
