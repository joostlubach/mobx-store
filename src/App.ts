import Logger from 'logger'
import { makeObservable, observable, runInAction } from 'mobx'
import { Deps } from 'ydeps'
import { injectDependencies } from './dependencies'
import { registerStore } from './dispatch'
import { deinitStores, initStores } from './lifecycle'
import { storeName } from './meta'
import { persistStores } from './persistence'
import { Store, StoreConstructor } from './types'

export class App {

  constructor() {
    makeObservable(this)
  }

  protected readonly logger = new Logger('App')

  // #region Lifecycle

  @observable
  public accessor status: AppStatus = AppStatus.Idle

  private readonly Stores: StoreConstructor<Store>[] = []
  private readonly stores: Store[] = []

  private disposers: Array<() => void> = []

  protected disposer(disposer: () => void) {
    this.disposers.push(disposer)
  }

  protected registerStore(...Stores: StoreConstructor<Store>[]) {
    this.Stores.push(...Stores)
  }

  public async init(initializer?: () => void | Promise<void>) {
    for (const Store of this.Stores) {
      const store = new Store(this)
      this.stores.push(store)
      this.deps.provide(Store, () => store)
      registerStore(store)
      this.logger.debug(`Registered store: ${storeName(Store)}`)
    }

    // Inject store dependencies.
    for (const store of this.stores) {
      injectDependencies(store, key => this.dep(key))
    }

    await persistStores(this.stores)
    
    // Then, initialize all stores.
    const initialized = await initStores(this.stores, this.logger)
    if (initialized) {
      this.logger.info('Initialized')
    }

    await initializer?.()

    runInAction(() => {
      this.status = initialized ? AppStatus.Initialized : AppStatus.InitializationError
    })
  }

  public async deinit() {
    if (this.status !== AppStatus.Initialized) { return }

    this.disposers.forEach(it => it())
    this.disposers = []

    return await deinitStores(this.stores, this.logger)
  }

  // #endregion

  // #region Dependencies

  public deps = new Deps()

  public dep(key: any) {
    if (typeof key === 'string') {
      return this.stores.find(store => storeName(store) === key)
    } else {
      return this.deps.get(key)
    }
  }

  public store<S extends StoreConstructor<any>>(Store: S): InstanceType<S> {
    return this.deps.get(Store)
  }

  // #endregion

}

export enum AppStatus {
  Idle,
  Initializing,
  Initialized,
  InitializationError,
  ShutDown
}
