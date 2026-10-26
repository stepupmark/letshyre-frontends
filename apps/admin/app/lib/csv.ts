export type CsvCell = string | number | boolean | null | undefined

// a leading = + - @ makes Excel treat the cell as a formula
const FORMULA = /^[=+\-@\t\r]/

function escapeCell(value: CsvCell) {
  if (value === null || value === undefined) return ""
  let text = String(value)
  if (typeof value === "string" && FORMULA.test(text)) text = `'${text}`
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function toCsv(rows: CsvCell[][]) {
  return rows.map((row) => row.map(escapeCell).join(",")).join("\r\n")
}

export function downloadCsv(filename: string, csv: string) {
  // the BOM makes Excel read the file as UTF-8, so ₹ and names survive
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  // revoking straight away can cancel the download in Firefox and Safari
  setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 0)
}
