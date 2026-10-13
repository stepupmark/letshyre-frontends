// Picked documents, kept in IndexedDB until submit so a refresh doesn't lose them.
// Every call fails quietly: without storage the form still works, it just forgets.

const DB = "letshyre-drafts"
const STORE = "employer-onboarding-files"

interface Stored {
  name: string
  type: string
  lastModified: number
  blob: Blob
}

function open() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB, 1)
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE)
    }
    request.onsuccess = () => {
      resolve(request.result)
    }
    request.onerror = () => {
      reject(request.error ?? new Error("indexedDB open failed"))
    }
  })
}

async function run<T>(
  mode: IDBTransactionMode,
  work: (store: IDBObjectStore) => IDBRequest<T>
) {
  const db = await open()
  try {
    return await new Promise<T>((resolve, reject) => {
      const request = work(db.transaction(STORE, mode).objectStore(STORE))
      request.onsuccess = () => {
        resolve(request.result)
      }
      request.onerror = () => {
        reject(request.error ?? new Error("indexedDB request failed"))
      }
    })
  } finally {
    db.close()
  }
}

export async function storeFile(key: string, file: File | null) {
  try {
    if (!file) {
      await run("readwrite", (store) => store.delete(key))
      return
    }
    const value: Stored = {
      name: file.name,
      type: file.type,
      lastModified: file.lastModified,
      blob: file,
    }
    await run("readwrite", (store) => store.put(value, key))
  } catch {
    /* empty */
  }
}

export async function loadFiles(keys: readonly string[]) {
  const files: Record<string, File> = {}
  try {
    for (const key of keys) {
      const value = (await run("readonly", (store) => store.get(key))) as
        Stored | undefined
      if (value)
        files[key] = new File([value.blob], value.name, {
          type: value.type,
          lastModified: value.lastModified,
        })
    }
  } catch {
    /* empty */
  }
  return files
}

export async function clearFiles() {
  try {
    await run("readwrite", (store) => store.clear())
  } catch {
    /* empty */
  }
}
