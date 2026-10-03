const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

export class RazorpayLoadError extends Error {
  name = "RazorpayLoadError";
}

let loading = null;

export function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(window.Razorpay);

  loading ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () =>
      window.Razorpay ? resolve(window.Razorpay) : reject(new RazorpayLoadError("Razorpay missing"));
    script.onerror = () => {
      script.remove();
      reject(new RazorpayLoadError("Razorpay failed to load"));
    };
    document.head.append(script);
  }).catch((error) => {
    loading = null;
    throw error;
  });

  return loading;
}

// Settles once: paid, or dismissed with the last failed attempt if there was
// one. Razorpay lets the payer retry a failed attempt inside its own modal.
export function openRazorpay(Razorpay, options) {
  return new Promise((resolve) => {
    let failure = null;
    const checkout = new Razorpay({
      ...options,
      handler: (response) => resolve({ paid: true, response }),
      modal: {
        confirm_close: true,
        ondismiss: () => resolve({ paid: false, failure }),
      },
    });
    checkout.on("payment.failed", (response) => {
      failure = response?.error ?? {};
    });
    checkout.open();
  });
}
