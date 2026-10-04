import { HttpError, NetworkError, ResponseShapeError } from "./errors.ts"
import type { HttpClient, RequestOptions } from "./http.ts"

export interface UploadOptions extends RequestOptions {
  method?: "POST" | "PUT" | "PATCH"
  onProgress?: (fraction: number) => void
  /** for tests */
  createXhr?: () => XMLHttpRequest
}

/** Multipart upload with progress; fetch can't report upload progress. */
export function xhrUpload(
  client: HttpClient,
  path: string,
  form: FormData,
  { method = "POST", onProgress, createXhr, ...options }: UploadOptions = {}
): Promise<unknown> {
  const send = () =>
    new Promise<unknown>((resolve, reject) => {
      const { url, headers } = client.prepare(path, options)
      const xhr = createXhr?.() ?? new XMLHttpRequest()
      xhr.open(method, url)
      for (const [name, value] of Object.entries(headers))
        xhr.setRequestHeader(name, value)

      const abort = () => {
        xhr.abort()
      }
      options.signal?.addEventListener("abort", abort, { once: true })
      const done = () => options.signal?.removeEventListener("abort", abort)

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress?.(event.loaded / event.total)
      }
      xhr.onabort = () => {
        done()
        reject(
          (options.signal?.reason as Error | undefined) ??
            new DOMException("Upload aborted", "AbortError")
        )
      }
      xhr.onerror = () => {
        done()
        reject(new NetworkError(`${method} ${path} failed`))
      }
      xhr.onload = () => {
        done()
        let body: unknown = null
        if (xhr.responseText) {
          try {
            body = JSON.parse(xhr.responseText)
          } catch (error) {
            if (xhr.status < 400) {
              reject(
                new ResponseShapeError(
                  `${method} ${path} returned invalid JSON`,
                  {
                    cause: error,
                  }
                )
              )
              return
            }
          }
        }
        if (xhr.status >= 400) reject(new HttpError(xhr.status, body))
        else {
          onProgress?.(1)
          resolve(body)
        }
      }
      xhr.send(form)
    })

  return client.withAuthRetry(send, options)
}
