import { isFunction, merge } from 'lodash'
import { DeepPartial } from 'ytil'

export interface Config {
  logger:  LoggerInterface
  storage: SyncStorage | AsyncStorage
}

export interface LoggerInterface {
  log(...args: any[]): void
  error(...args: any[]): void
  warn(...args: any[]): void
  info(...args: any[]): void
  debug(...args: any[]): void
}

export interface SyncStorage {
  getItem<T>(key: string): unknown | null
  setItem(key: string, value: unknown): void
}

export interface AsyncStorage {
  getItem<T>(key: string): Promise<unknown | null>
  setItem(key: string, value: unknown): Promise<void>
}

const config: Config = {
  logger:  console,
  storage: {
    getItem: key => localStorage.getItem(key),
    setItem: (key, value) => { localStorage.setItem(key, JSON.stringify(value)) },
  },
}

export default config

export function configure(cfg: DeepPartial<Config> | ((config: Config) => any)) {
  if (isFunction(cfg)) {
    cfg(config)
  } else {
    merge(config, cfg)
  }
}