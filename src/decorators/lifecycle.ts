import { metaFor } from '../meta'

export function preinit() {
  return (target: Function, context: ClassMethodDecoratorContext) => {
    if (context.kind !== 'method') {
      throw new Error("preinit() can only be placed on methods")
    }

    const methodName = context.name
    context.addInitializer(function () {
      const meta = metaFor(this as object, true)
      meta.preinits.push(methodName)
    })
  }
}

export function init() {
  return (target: Function, context: ClassMethodDecoratorContext) => {
    if (context.kind !== 'method') {
      throw new Error("init() can only be placed on methods")
    }

    const methodName = context.name
    context.addInitializer(function () {
      const meta = metaFor(this as object, true)
      meta.inits.push(methodName)
    })
  }
}

export function deinit() {
  return (target: Function, context: ClassMethodDecoratorContext) => {
    if (context.kind !== 'method') {
      throw new Error("deinit() can only be placed on methods")
    }

    const methodName = context.name
    context.addInitializer(function () {
      const meta = metaFor(this as object, true)
      meta.deinits.push(methodName)
    })
  }
}