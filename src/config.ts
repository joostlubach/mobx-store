import { isFunction, merge } from 'lodash'
import { DeepPartial } from 'ytil'
import { LocalStorage } from './storage'

export interface Config {
  storage: SyncStorage | AsyncStorage
  logger: Logger
}

export interface Logger {
  debug: (message: string, ...meta: any[]) => void
  info:  (message: string, ...meta: any[]) => void
  warn:  (message: string, ...meta: any[]) => void
  error: (message: string, ...meta: any[]) => void
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
  logger: console,
}

export default config

export function configure(cfg: DeepPartial<Config> | ((config: Config) => void)) {
  if (isFunction(cfg)) {
    cfg(config)
  } else {
    merge(config, cfg)
  }
}