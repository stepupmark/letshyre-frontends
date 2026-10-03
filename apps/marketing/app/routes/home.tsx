import { Button } from "@workspace/ui/components/button"

const brand = "LetsHyre"

export default function Home() {
  return (
    <main className="mx-auto flex min-h-svh max-w-5xl flex-col justify-center gap-4 px-4">
      <h1 className="text-4xl font-semibold tracking-tight">{brand}</h1>
      <Button className="w-fit">{brand}</Button>
    </main>
  )
}
