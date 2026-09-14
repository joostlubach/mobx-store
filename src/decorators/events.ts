import { metaFor } from '../meta'
import { StoreEventMap } from '../types'

export function on<E>(event: keyof StoreEventMap) {
  return (target: Function, context: ClassMethodDecoratorContext) => {
    if (context.kind !== 'method') {
      throw new Error(`@on() can only be placed on methods`)
    }

    const methodName = context.name
    context.addInitializer(function () {
      const meta = metaFor(this as object, true)
      meta.handlers[event] ??= new Set()
      meta.handlers[event].add(methodName)
    })
  }
}