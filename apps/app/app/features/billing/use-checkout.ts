import { HttpError } from "@workspace/api"
import { readSession } from "@workspace/auth"
import { useTranslation } from "@workspace/i18n/react"
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"

import { creditsQuery } from "@/lib/credits"

import {
  createOrder,
  INVOICES_KEY,
  quoteQuery,
  verifyPayment,
  type Order,
  type OrderRequest,
} from "./api"
import { toPaise, type CheckoutItem } from "./checkout"
import {
  loadRazorpay,
  openRazorpay,
  RazorpayLoadError,
  type RazorpaySuccess,
} from "./razorpay"

export type Notice =
  | { kind: "cancelled" | "priceChanged" | "blocked" }
  | { kind: "failed" | "error"; detail: string | null }

interface Payment {
  order: Order
  proof: RazorpaySuccess
}

export type Stage =
  | { name: "review"; notice?: Notice }
  | { name: "paying" | "razorpay" }
  | { name: "verifying" | "paid" | "unconfirmed"; payment: Payment }

const BRAND = "#266FFF"

function prefill() {
  const session = readSession()
  if (session.status !== "signed-in") return {}
  const user = session.user as Record<string, unknown>
  const pick = (...keys: string[]) =>
    keys.map((key) => user[key]).find((v) => typeof v === "string" && v)
  return Object.fromEntries(
    Object.entries({
      name: pick("full_name", "name"),
      email: pick("email"),
      contact: pick("phone_number", "phone"),
    }).filter(([, value]) => value)
  )
}

const failureOf = (error: unknown): Notice =>
  error instanceof RazorpayLoadError
    ? { kind: "blocked" }
    : {
        kind: "error",
        detail:
          error instanceof HttpError ? (error.backendMessage ?? null) : null,
      }

/** review → paying → razorpay → verifying → paid | unconfirmed. Closing Razorpay goes back to review. */
export function useCheckout(item: CheckoutItem) {
  const { t } = useTranslation("billing")
  const queryClient = useQueryClient()
  const [coupon, setCoupon] = useState<string | null>(null)
  const [stage, setStage] = useState<Stage>({ name: "review" })
  const placed = useRef<{ signature: string; order: Order } | null>(null)
  const paying = useRef(false)

  const base: OrderRequest = { planId: item.planId, credits: item.credits }
  const quote = useQuery({
    ...quoteQuery({ ...base, coupon }),
    placeholderData: keepPreviousData,
  })
  const applied = coupon && quote.data?.coupon?.applied ? coupon : null
  const busy = stage.name === "paying" || stage.name === "verifying"

  useEffect(() => {
    void loadRazorpay().catch(() => undefined)
  }, [])

  // closing the tab mid-verification would leave the payment unconfirmed
  useEffect(() => {
    if (stage.name !== "verifying") return
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault()
    }
    window.addEventListener("beforeunload", warn)
    return () => {
      window.removeEventListener("beforeunload", warn)
    }
  }, [stage.name])

  const confirm = async (payment: Payment) => {
    setStage({ name: "verifying", payment })
    try {
      await verifyPayment(payment.proof, payment.order)
      setStage({ name: "paid", payment })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: creditsQuery().queryKey }),
        queryClient.invalidateQueries({ queryKey: INVOICES_KEY }),
      ])
    } catch {
      setStage({ name: "unconfirmed", payment })
    }
  }

  const pay = async () => {
    const shown = quote.data
    if (paying.current || !shown || quote.isPlaceholderData) return
    paying.current = true
    const total = toPaise(shown.total)
    const request = { ...base, coupon: applied }
    const signature = [request.planId, request.credits, applied, total].join(
      "|"
    )
    setStage({ name: "paying" })

    try {
      const razorpay = loadRazorpay()
      razorpay.catch(() => undefined)
      // paying again after closing Razorpay reuses the order instead of leaving one behind each time
      if (placed.current?.signature !== signature)
        placed.current = { signature, order: await createOrder(request) }
      const { order } = placed.current

      if (toPaise(order.amount) !== total) {
        placed.current = null
        await queryClient.invalidateQueries({
          queryKey: quoteQuery({ ...base, coupon }).queryKey,
        })
        setStage({ name: "review", notice: { kind: "priceChanged" } })
        return
      }

      const Razorpay = await razorpay
      setStage({ name: "razorpay" })
      const result = await openRazorpay(Razorpay, {
        key: order.razorpay_key,
        order_id: order.order_id,
        currency: order.currency,
        name: "LetsHyre",
        description: t("checkout.razorpay", { count: base.credits }),
        prefill: prefill(),
        notes: { purchase_id: order.purchase_id },
        theme: { color: BRAND },
      })

      if (!result.paid) {
        setStage({
          name: "review",
          notice: result.failed
            ? { kind: "failed", detail: result.failure }
            : { kind: "cancelled" },
        })
        return
      }
      placed.current = null
      await confirm({ order, proof: result.proof })
    } catch (error) {
      setStage({ name: "review", notice: failureOf(error) })
    } finally {
      paying.current = false
    }
  }

  return {
    quote,
    coupon: applied,
    rejected:
      coupon && quote.data?.coupon && !quote.data.coupon.applied
        ? (quote.data.coupon.error ?? t("checkout.coupon.rejected"))
        : null,
    stage,
    busy,
    pay: () => void pay(),
    applyCoupon: (code: string | null) => {
      setCoupon(code)
      setStage({ name: "review" })
    },
    retryConfirm: () => {
      if (stage.name === "unconfirmed") void confirm(stage.payment)
    },
  }
}

export type Checkout = ReturnType<typeof useCheckout>
