const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type QueryType = "NPI" | "NAME";
export type LookupStatus = "SUCCESS" | "NOT_FOUND" | "INVALID_QUERY" | "API_ERROR";

export interface NormalizedProvider {
  npi: string;
  name: string;
  credential: string | null;
  state: string | null;
  primaryTaxonomy: string | null;
  enumerationType: "NPI-1" | "NPI-2";
}

export interface Lookup {
  id: string;
  query: string;
  queryType: QueryType;
  status: LookupStatus;
  resultCount: number;
  results: NormalizedProvider[] | null;
  errorMessage: string | null;
  createdAt: string;
}

export async function searchProvider(query: string): Promise<Lookup> {
  const response = await fetch(`${API_URL}/api/lookups`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error("The search request failed unexpectedly.");
  }

  return response.json();
}

export async function getLookupHistory(status?: LookupStatus): Promise<Lookup[]> {
  const url = new URL(`${API_URL}/api/lookups`);
  if (status) {
    url.searchParams.set("status", status);
  }

  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Could not load lookup history.");
  }

  return response.json();
}
