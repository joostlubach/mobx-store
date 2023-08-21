import { isFunction } from 'lodash'
import { metaFor } from './meta'

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

// export function persist<T>(key?: string, options: PersistOptions<T> = {}): PropertyDecorator {
//   return (target: Object, property: string | symbol, descriptor: TypedPropertyDescriptor<T>) => {
//     if (typeof property !== 'string') { return }

//     const meta = metaFor(target, true)
//     meta.persists.push({key, property})
//   }
// }

// export function rehydrate(key?: string): PropertyDecorator {
//   return (target, property) => {
//     persist(key, {rehydate: true})(target, property)
//   }
// }