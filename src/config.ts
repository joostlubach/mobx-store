import { isFunction, merge } from 'lodash'
import { DeepPartial } from 'ytil'

export interface Config {
  logger:   LoggerInterface
  storage?: SyncStorage | AsyncStorage
}

export interface LoggerInterface {
  log(...args: any[]): void
  error(...args: any[]): void
  warn(...args: any[]): void
  info(...args: any[]): void
  debug(...args: any[]): void
}

export interface SyncStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export interface AsyncStorage {
  getItem(key: string): Promise<string | null>
  setItem(key: string, value: string): Promise<void>
}

const config: Config = {
  logger:  console,
  storage: undefined,
}

export default config

export function configure(cfg: DeepPartial<Config> | ((config: Config) => any)) {
  if (isFunction(cfg)) {
    cfg(config)
  } else {
    merge(config, cfg)
  }
}