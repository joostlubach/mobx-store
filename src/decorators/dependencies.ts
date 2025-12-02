import { metaFor } from '../meta'
import { Constructor, InjectKey } from '../types'

export function inject<T, U>(Ctor: Constructor<T>, transform: (from: T) => U): (target: undefined, context: ClassFieldDecoratorContext) => void
export function inject(key: InjectKey): (target: undefined, context: ClassFieldDecoratorContext) => void
export function inject(key: InjectKey, transform?: (from: any) => any) {
  return (target: undefined, context: ClassFieldDecoratorContext) => {
    if (context.kind !== 'field') {
      throw new Error(`@inject() can only be applied to class fields`)
    }
    if (typeof context.name !== 'string') {
      throw new Error(`@inject() can only be applied to string-keyed properties`)
    }

    const prop = context.name as string
    context.addInitializer(function () {
      const meta = metaFor(this as object, true)
      meta.injects[prop] = [key, transform ?? ((it: any) => it)]
    })
  }
}
