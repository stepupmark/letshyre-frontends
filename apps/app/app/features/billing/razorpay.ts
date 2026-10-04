const SCRIPT = "https://checkout.razorpay.com/v1/checkout.js"

export class RazorpayLoadError extends Error {
  override name = "RazorpayLoadError"
}

interface RazorpayFailure {
  error?: { description?: string }
}

interface RazorpayInstance {
  open: () => void
  on: (event: "payment.failed", handler: (r: RazorpayFailure) => void) => void
}

export interface RazorpaySuccess {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

type RazorpayConstructor = new (
  options: Record<string, unknown>
) => RazorpayInstance

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor
  }
}

let loading: Promise<RazorpayConstructor> | null = null

/** Loads checkout.js once, on demand; a failed load can be tried again. */
export function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(window.Razorpay)
  loading ??= new Promise<RazorpayConstructor>((resolve, reject) => {
    const script = document.createElement("script")
    script.src = SCRIPT
    script.async = true
    script.onload = () => {
      if (window.Razorpay) resolve(window.Razorpay)
      else reject(new RazorpayLoadError("Razorpay missing"))
    }
    script.onerror = () => {
      script.remove()
      reject(new RazorpayLoadError("Razorpay failed to load"))
    }
    document.head.append(script)
  }).catch((error: unknown) => {
    loading = null
    throw error
  })
  return loading
}

export type RazorpayResult =
  | { paid: true; proof: RazorpaySuccess }
  | { paid: false; failure: string | null; failed: boolean }

// Settles once: paid, or closed. Razorpay lets the payer retry a failed
// attempt inside its own window, so a failure only counts once it's closed.
export function openRazorpay(
  Razorpay: RazorpayConstructor,
  options: Record<string, unknown>
) {
  return new Promise<RazorpayResult>((resolve) => {
    let failure: RazorpayFailure | null = null
    const checkout = new Razorpay({
      ...options,
      handler: (proof: RazorpaySuccess) => {
        resolve({ paid: true, proof })
      },
      modal: {
        confirm_close: true,
        ondismiss: () => {
          resolve({
            paid: false,
            failed: failure !== null,
            failure: failure?.error?.description ?? null,
          })
        },
      },
    })
    checkout.on("payment.failed", (response) => {
      failure = response
    })
    checkout.open()
  })
}
