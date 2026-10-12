import { HttpError } from "@workspace/api"

import { api } from "@/lib/api"

import type { Body, CodePurpose, Role } from "../types"

// a few endpoints answer 200 with { success: false, message }
async function post(path: string, body: Body): Promise<Body> {
  const json = (await api.post(path, body, { auth: false })) as Body | null
  if (json?.success === false) throw new HttpError(400, json)
  const data = json?.data
  return typeof data === "object" && data !== null
    ? (data as Body)
    : (json ?? {})
}

// the code's session key has come back under a few names over time
function sessionKey(data: Body): string {
  const nested = data.data as Body | undefined
  const key =
    data.otp_session_key ?? data.session_key ?? nested?.otp_session_key
  if (typeof key !== "string" || !key)
    throw new HttpError(400, { message: "no otp session key" })
  return key
}

export const sendEmailCode = async (email: string, purpose: CodePurpose) =>
  sessionKey(await post("commonapp/v1/send_otp/", { email, otp_type: purpose }))

export const verifyEmailCode = (input: {
  email: string
  key: string
  code: string
  purpose: CodePurpose
}) =>
  post("commonapp/v1/verify_otp/", {
    email: input.email,
    otp_session_key: input.key,
    otp: input.code,
    otp_type: input.purpose,
  })

export const sendMobileCode = async (phone: string) =>
  sessionKey(
    await post("commonapp/v1/mobile_send_otp/", {
      phone_number: phone,
      otp_type: "Registration",
    })
  )

export const verifyMobileCode = (input: {
  phone: string
  key: string
  code: string
}) =>
  post("commonapp/v1/mobile_verify_otp/", {
    phone_number: input.phone,
    otp_session_key: input.key,
    otp: input.code,
  })

// field names the API expects, camelCase keys included
export const register = (input: {
  role: Role
  name: string
  email: string
  emailKey: string
  phone: string
  mobileKey: string
  password: string
}) =>
  post("user/v1/user_register/", {
    role: input.role,
    name: input.name,
    email: input.email,
    emailOtpSessionKey: input.emailKey,
    phone_number: input.phone,
    mobileOtpSessionKey: input.mobileKey,
    password: input.password,
    confirm_password: input.password,
    agreed_to_terms: true,
  })

export const resetPassword = (input: {
  email: string
  key: string
  password: string
}) =>
  post("user/v1/forgot_password/", {
    email: input.email,
    otp_session_key: input.key,
    new_password: input.password,
    confirm_password: input.password,
  })
