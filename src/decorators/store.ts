import { metaFor } from '../meta'

export function store(name: string): ClassDecorator {
  return target => {
    const meta = metaFor(target, true)
    meta.name = name
  }
}