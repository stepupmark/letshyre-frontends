import type { ViewerDocument } from "~/components/document-viewer"
import type { CompanyKyc } from "./schemas/kyc.schema"

export function kycDocuments(kyc: CompanyKyc): ViewerDocument[] {
  return [
    { label: "Registration certificate", url: kyc.registration_certificate },
    { label: "GST certificate", url: kyc.gst_certificate },
    { label: "Address proof", url: kyc.address_proof },
    { label: "Authorised ID proof", url: kyc.authorized_id_proof },
    { label: "Bank proof", url: kyc.bank_proof },
  ]
}
