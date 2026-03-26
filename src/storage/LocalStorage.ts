import { isPlainObject } from 'lodash'

export class LocalStorage {

  public getItem(key: string) {
    const json = localStorage.getItem(key)
    const state = JSON.parse(json ?? '{}')
    if (!isPlainObject(state)) {
      throw new Error(`Expected object, got ${typeof state}`)
    }
    return state
  }

  public setItem(key: string, value: any) {
    const json = JSON.stringify(value)
    localStorage.setItem(key, json)
  }

  public removeItem(key: string) {
    localStorage.removeItem(key) 
  }

}