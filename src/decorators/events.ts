import { metaFor } from '../meta'
import { StoreEvent } from '../types'

export function on(event: StoreEvent) {
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