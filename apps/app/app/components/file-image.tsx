import { useCallback, type ComponentProps } from "react"

/** An <img> of a picked file; the object URL lives exactly as long as the img. */
export function FileImage({
  file,
  alt = "",
  ...props
}: { file: File } & Omit<ComponentProps<"img">, "src" | "ref">) {
  const attach = useCallback(
    (img: HTMLImageElement | null) => {
      if (!img) return
      const url = URL.createObjectURL(file)
      img.src = url
      return () => {
        URL.revokeObjectURL(url)
      }
    },
    [file]
  )
  return <img ref={attach} alt={alt} {...props} />
}
