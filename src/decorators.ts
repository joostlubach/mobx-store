import { isFunction } from 'lodash'

import { metaFor } from './meta.js'
import { Constructor, InjectKey } from './types.js'

export function init(): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    if (descriptor.value == null) { return }
    if (!isFunction(descriptor.value)) {
      throw new Error("init() can only be placed on functions")
    }

    const meta = metaFor(target, true)
    meta.inits.push(descriptor.value)
  }
}

export function deinit(): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    if (descriptor.value == null) { return }
    if (!isFunction(descriptor.value)) {
      throw new Error("deinit() can only be placed on functions")
    }

    const meta = metaFor(target, true)
    meta.deinits.push(descriptor.value)
  }
}

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
