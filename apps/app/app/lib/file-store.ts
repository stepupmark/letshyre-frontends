// Picked files, kept in IndexedDB until submit so a refresh doesn't lose them.
// Every call fails quietly: without storage the form still works, it just forgets.

const DB = "letshyre-drafts"
const STORES = ["employer-onboarding-files", "candidate-onboarding-files"]

interface Stored {
  name: string
  type: string
  lastModified: number
  blob: Blob
}

function open() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB, 2)
    request.onupgradeneeded = () => {
      for (const name of STORES)
        if (!request.result.objectStoreNames.contains(name))
          request.result.createObjectStore(name)
    }
    request.onsuccess = () => {
      resolve(request.result)
    }
    request.onerror = () => {
      reject(request.error ?? new Error("indexedDB open failed"))
    }
  })
}

export function fileStore(name: (typeof STORES)[number]) {
  async function run<T>(
    mode: IDBTransactionMode,
    work: (store: IDBObjectStore) => IDBRequest<T>[]
  ) {
    const db = await open()
    try {
      const store = db.transaction(name, mode).objectStore(name)
      return await Promise.all(
        work(store).map(
          (request) =>
            new Promise<T>((resolve, reject) => {
              request.onsuccess = () => {
                resolve(request.result)
              }
              request.onerror = () => {
                reject(request.error ?? new Error("indexedDB request failed"))
              }
            })
        )
      )
    } finally {
      db.close()
    }
  }

  return {
    async save(key: string, file: File | null) {
      try {
        if (!file) {
          await run("readwrite", (store) => [store.delete(key)])
          return
        }
        const value: Stored = {
          name: file.name,
          type: file.type,
          lastModified: file.lastModified,
          blob: file,
        }
        await run("readwrite", (store) => [store.put(value, key)])
      } catch {
        /* empty */
      }
    },

    async load(keys: readonly string[]) {
      const files: Record<string, File> = {}
      try {
        const values = (await run("readonly", (store) =>
          keys.map((key) => store.get(key))
        )) as (Stored | undefined)[]
        values.forEach((value, i) => {
          const key = keys[i]
          if (value && key)
            files[key] = new File([value.blob], value.name, {
              type: value.type,
              lastModified: value.lastModified,
            })
        })
      } catch {
        /* empty */
      }
      return files
    },

    async clear() {
      try {
        await run("readwrite", (store) => [store.clear()])
      } catch {
        /* empty */
      }
    },
  }
}
