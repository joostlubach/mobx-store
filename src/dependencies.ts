import { objectEntries } from 'ytil'
import { metaFor } from './meta'

export async function injectDependencies(store: Object, getDependency: (Ctor: Function) => any) {
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