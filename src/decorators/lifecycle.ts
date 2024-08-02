import { isFunction } from 'lodash'
import { metaFor } from '../meta'

export function init(): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    if (descriptor.value == null) { return }
    if (!isFunction(descriptor.value)) {
      throw new Error("init() can only be placed on functions")
    }

    const meta = metaFor(target, true)
    meta.inits.push(propertyKey)
  }
}

export function deinit(): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    if (descriptor.value == null) { return }
    if (!isFunction(descriptor.value)) {
      throw new Error("deinit() can only be placed on functions")
    }

    const meta = metaFor(target, true)
    meta.deinits.push(propertyKey)
  }
}