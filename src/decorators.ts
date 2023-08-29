import { isFunction } from 'lodash'
import { metaFor } from './meta'
import { StoreConstructor } from './types'

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

export function store(StoreClass: StoreConstructor): PropertyDecorator {
  return (target, key) => {
    if (typeof key !== 'string') {
      throw new Error(`@store() can only be applied to string-keyed properties`)
    }

    const meta = metaFor(target, true)
    meta.stores[key] = StoreClass
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