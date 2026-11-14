import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private storageInstance: Storage | null = null;
  private initPromise: Promise<Storage> | null = null;

  constructor(private readonly storage: Storage) {}

  /**
   * Inicializa la instancia de Ionic Storage una única vez y reutiliza
   * la promesa si ocurren llamadas concurrentes al iniciar la aplicación.
   */
  private async ensureInitialized(): Promise<Storage> {
    if (this.storageInstance) {
      return this.storageInstance;
    }
    if (!this.initPromise) {
      this.initPromise = this.storage.create().then((instance) => {
        this.storageInstance = instance;
        return instance;
      });
    }
    return this.initPromise;
  }

  /**
   * Obtiene un valor por su clave o `null` si no existe.
   */
  async get<T>(key: string): Promise<T | null> {
    const store = await this.ensureInitialized();
    const value = await store.get(key);
    return (value ?? null) as T | null;
  }

  /**
   * Guarda o actualiza un valor asociado a la clave indicada.
   */
  async set<T>(key: string, value: T): Promise<void> {
    const store = await this.ensureInitialized();
    await store.set(key, value);
  }

  /**
   * Elimina una clave del almacenamiento local.
   */
  async remove(key: string): Promise<void> {
    const store = await this.ensureInitialized();
    await store.remove(key);
  }
}
