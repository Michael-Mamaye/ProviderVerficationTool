"use client";

import { useState } from "react";
import { AlertCircle, Search } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { type Lookup, searchProvider } from "@/lib/api";

export default function Home() {
  const [query, setQuery] = useState("");
  const [lookup, setLookup] = useState<Lookup | null>(null);
  const [loading, setLoading] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setRequestError(null);
    setLookup(null);

    try {
      const result = await searchProvider(query.trim());
      setLookup(result);
    } catch {
      setRequestError("Could not reach the API. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-background">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-16">
        <section className="flex flex-col gap-4">
          <Badge variant="secondary" className="w-fit">
            NPPES NPI Registry
          </Badge>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight">
            Verify healthcare provider credentials.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Search by NPI number or provider name to look up name, credentials,
            state, and specialty from the public NPI registry.
          </p>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Search</CardTitle>
            <CardDescription>
              Enter a 10-digit NPI number or a provider name (e.g. &ldquo;John
              Smith&rdquo;).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex flex-1 flex-col gap-2">
                <Label htmlFor="query">NPI or name</Label>
                <Input
                  id="query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. 1871538041 or Jack Smith"
                  autoComplete="off"
                />
              </div>
              <Button type="submit" disabled={loading} className="sm:w-fit">
                <Search className="size-4" />
                {loading ? "Searching..." : "Search"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {requestError && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Request failed</AlertTitle>
            <AlertDescription>{requestError}</AlertDescription>
          </Alert>
        )}

        {lookup && <LookupResult lookup={lookup} />}
      </main>
    </div>
  );
}

function LookupResult({ lookup }: { lookup: Lookup }) {
  if (lookup.status === "INVALID_QUERY") {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>Invalid search</AlertTitle>
        <AlertDescription>{lookup.errorMessage}</AlertDescription>
      </Alert>
    );
  }

  if (lookup.status === "API_ERROR") {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>NPI registry unavailable</AlertTitle>
        <AlertDescription>{lookup.errorMessage}</AlertDescription>
      </Alert>
    );
  }

  if (lookup.status === "NOT_FOUND") {
    return (
      <Alert>
        <AlertCircle className="size-4" />
        <AlertTitle>No results</AlertTitle>
        <AlertDescription>
          No provider matched &ldquo;{lookup.query}&rdquo; in the NPI registry.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        {lookup.resultCount} match{lookup.resultCount === 1 ? "" : "es"} for{" "}
        &ldquo;{lookup.query}&rdquo;
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {lookup.results?.map((provider) => (
          <Card key={provider.npi}>
            <CardHeader>
              <CardTitle className="text-base">{provider.name}</CardTitle>
              <CardDescription>NPI {provider.npi}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2 text-sm">
              {provider.credential && <Badge variant="secondary">{provider.credential}</Badge>}
              {provider.state && <Badge variant="outline">{provider.state}</Badge>}
              {provider.primaryTaxonomy && <Badge variant="outline">{provider.primaryTaxonomy}</Badge>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
