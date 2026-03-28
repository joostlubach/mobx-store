import { isFunction, merge } from 'lodash'
import { DeepPartial } from 'ytil'
import { LocalStorage } from './storage'

export interface Config {
  storage: SyncStorage | AsyncStorage
}

export interface SyncStorage {
  getItem(key: string): object | null
  setItem(key: string, value: object): void
  removeItem(key: string): void
  clear(): void
  addListener?(listener: (state: object) => void): void
}

export interface AsyncStorage {
  getItem(key: string): Promise<object | null>
  setItem(key: string, value: object): Promise<void>
  removeItem(key: string): Promise<void>
  clear(): Promise<void>
  addListener?(listener: (state: object) => void): void
}

const config: Config = {
  storage: new LocalStorage(),
}

export default config

export function configure(cfg: DeepPartial<Config> | ((config: Config) => void)) {
  if (isFunction(cfg)) {
    cfg(config)
  } else {
    merge(config, cfg)
  }
}