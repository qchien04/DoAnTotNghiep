/**
 * Local Database Engine cho Mock API
 * Kết hợp In-Memory Cache và LocalStorage để dữ liệu tương tác CRUD được bảo toàn khi F5.
 */
import { MockDatabaseSchema, INITIAL_MOCK_DATA } from './initialData';

const STORAGE_KEY = 'stayconnect_mock_db_v1';

class MockStorage {
  private db: MockDatabaseSchema;

  constructor() {
    this.db = this.loadFromStorage();
  }

  private loadFromStorage(): MockDatabaseSchema {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Bỏ qua nếu môi trường không có localStorage
    }
    // Lần đầu hoặc lỗi: nạp dữ liệu mẫu và lưu vào storage
    this.saveToStorage(INITIAL_MOCK_DATA);
    return JSON.parse(JSON.stringify(INITIAL_MOCK_DATA));
  }

  private saveToStorage(data: MockDatabaseSchema) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // In-memory fallback
    }
  }

  public getDb(): MockDatabaseSchema {
    return this.db;
  }

  public resetDb(): MockDatabaseSchema {
    this.db = JSON.parse(JSON.stringify(INITIAL_MOCK_DATA));
    this.saveToStorage(this.db);
    return this.db;
  }

  public getCollection<K extends keyof MockDatabaseSchema>(collectionName: K): MockDatabaseSchema[K] {
    return this.db[collectionName];
  }

  public findItem<K extends keyof MockDatabaseSchema>(
    collectionName: K,
    predicate: (item: any) => boolean
  ): any | undefined {
    const list = this.db[collectionName] as any[];
    return list.find(predicate);
  }

  public findById<K extends keyof MockDatabaseSchema>(
    collectionName: K,
    id: string | number
  ): any | undefined {
    return this.findItem(collectionName, (item) => String(item.id) === String(id) || item.code === id);
  }

  public insertItem<K extends keyof MockDatabaseSchema>(
    collectionName: K,
    item: any
  ): any {
    const list = this.db[collectionName] as any[];
    list.unshift(item);
    this.saveToStorage(this.db);
    return item;
  }

  public updateItem<K extends keyof MockDatabaseSchema>(
    collectionName: K,
    id: string | number,
    partial: any
  ): any | undefined {
    const list = this.db[collectionName] as any[];
    const index = list.findIndex((item) => String(item.id) === String(id) || item.code === id);
    if (index === -1) return undefined;

    const updated = {
      ...list[index],
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    list[index] = updated;
    this.saveToStorage(this.db);
    return updated;
  }

  public deleteItem<K extends keyof MockDatabaseSchema>(
    collectionName: K,
    id: string | number
  ): boolean {
    const list = this.db[collectionName] as any[];
    const initialLen = list.length;
    this.db[collectionName] = list.filter(
      (item) => String(item.id) !== String(id) && item.code !== id
    ) as any;
    const removed = (this.db[collectionName] as any[]).length < initialLen;
    if (removed) {
      this.saveToStorage(this.db);
    }
    return removed;
  }
}

export const mockStorage = new MockStorage();
