import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl">MiSeguro — en construcción</CardTitle>
          <CardDescription>Muy pronto vas a poder cotizar tu seguro desde acá.</CardDescription>
        </CardHeader>
      </Card>
    </main>
  );
}
