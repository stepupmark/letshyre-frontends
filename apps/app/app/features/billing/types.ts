export interface OrderRequest {
  planId: string | null
  credits: number
  coupon?: string | null
}

export interface RazorpayProof {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}
