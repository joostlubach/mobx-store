import { isFunction, merge } from 'lodash'
import { DeepPartial } from 'ytil'
import { LocalStorage } from './storage'

export interface Config {
  storage: SyncStorage | AsyncStorage
}

export interface SyncStorage {
  getItem(key: string): object | null
  setItem(key: string, value: object): void
}

export interface AsyncStorage {
  getItem(key: string): Promise<object | null>
  setItem(key: string, value: object): Promise<void>
}

const config: Config = {
  storage: new LocalStorage(),
}

export default config

export function configure(cfg: DeepPartial<Config> | ((config: Config) => any)) {
  if (isFunction(cfg)) {
    cfg(config)
  } else {
    merge(config, cfg)
  }
}