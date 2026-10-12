export const isRecordId = (value: string | null | undefined): value is string =>
  /^[\w-]{1,64}$/.test(value ?? "")
