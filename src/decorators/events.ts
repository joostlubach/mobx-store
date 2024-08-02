import { isFunction } from 'ytil'
import { metaFor } from '../meta'
import { StoreEvent } from '../types'

export function on(event: StoreEvent): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    if (!isFunction(descriptor.value)) {
      throw new Error(`@on() can only be placed on functions`)
    }

    const meta = metaFor(target, true)
    meta.handlers[event] ??= []
    meta.handlers[event].push(propertyKey)
  }
}