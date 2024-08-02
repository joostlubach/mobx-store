import { metaFor } from '../meta'
import { Constructor, InjectKey } from '../types'

export function inject<T, U>(Ctor: Constructor<T>, transform: (from: T) => U): PropertyDecorator
export function inject(key: InjectKey): PropertyDecorator
export function inject(key: InjectKey, transform?: (from: any) => any): PropertyDecorator {
  return (target, prop) => {
    if (typeof prop !== 'string') {
      throw new Error(`@inject() can only be applied to string-keyed properties`)
    }

    const meta = metaFor(target, true)
    meta.injects[prop] = [key, transform ?? (it => it)]
  }
}
