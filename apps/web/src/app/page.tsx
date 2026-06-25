import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold tracking-tight">
            Provider Verification Tool
          </span>
          <Button render={<a href="#verify" />}>Verify a provider</Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-16 px-6 py-16">
        <section className="flex flex-col gap-4">
          <Badge variant="secondary" className="w-fit">
            Credential Verification
          </Badge>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight">
            Verify healthcare provider credentials with confidence.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Look up license status, NPI registration, and sanction records for
            a provider before onboarding or credentialing.
          </p>
        </section>

        <section id="verify" className="grid gap-6 md:grid-cols-[2fr_3fr]">
          <Card>
            <CardHeader>
              <CardTitle>Verify a provider</CardTitle>
              <CardDescription>
                Enter an NPI or license number to start a verification.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="npi">NPI or license number</Label>
                <Input id="npi" name="npi" placeholder="e.g. 1234567890" />
              </div>
              <Button type="button" className="w-fit">
                Run verification
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What gets checked</CardTitle>
              <CardDescription>
                Each verification reviews the following sources.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
                <li>State medical license status and expiration</li>
                <li>NPI registry record (NPPES)</li>
                <li>Federal exclusion and sanction lists</li>
                <li>Malpractice and disciplinary history</li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto w-full max-w-5xl px-6 py-6 text-sm text-muted-foreground">
          Provider Verification Tool
        </div>
      </footer>
    </div>
  );
}
