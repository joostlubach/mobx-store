import { metaFor } from '../meta'

export function store(name: string) {
  return <T extends new (...args: any[]) => any>(target: T, context: ClassDecoratorContext) => {
    const meta = metaFor(target, true)
    meta.name = name
  }
}