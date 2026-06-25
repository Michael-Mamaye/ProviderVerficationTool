const NPPES_BASE_URL = "https://npiregistry.cms.hhs.gov/api/";
const REQUEST_TIMEOUT_MS = 8000;

export interface NormalizedProvider {
  npi: string;
  name: string;
  credential: string | null;
  state: string | null;
  primaryTaxonomy: string | null;
  enumerationType: "NPI-1" | "NPI-2";
}

export type NppesOutcome =
  | { kind: "ok"; resultCount: number; providers: NormalizedProvider[] }
  | { kind: "error"; message: string };

// Shape of the bits of the NPPES v2.1 response we actually use. The real
// response has many more fields (addresses, identifiers, endpoints, etc.)
// that we deliberately don't model since we don't display them.
interface NppesAddress {
  address_purpose: string;
  state: string;
}

interface NppesTaxonomy {
  desc: string;
  primary: boolean;
}

interface NppesBasic {
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  organization_name?: string;
  credential?: string;
}

interface NppesResult {
  number: string;
  enumeration_type: "NPI-1" | "NPI-2";
  basic: NppesBasic;
  addresses: NppesAddress[];
  taxonomies: NppesTaxonomy[];
}

interface NppesSuccessResponse {
  result_count: number;
  results: NppesResult[];
}

interface NppesErrorResponse {
  Errors: { description: string }[];
}

function normalizeProvider(result: NppesResult): NormalizedProvider {
  const { basic } = result;
  const name = basic.organization_name
    ? basic.organization_name
    : [basic.first_name, basic.middle_name, basic.last_name].filter(Boolean).join(" ");

  const location = result.addresses.find((a) => a.address_purpose === "LOCATION");
  const primaryTaxonomy = result.taxonomies.find((t) => t.primary);

  return {
    npi: result.number,
    name,
    credential: basic.credential ?? null,
    state: location?.state ?? result.addresses[0]?.state ?? null,
    primaryTaxonomy: primaryTaxonomy?.desc ?? null,
    enumerationType: result.enumeration_type,
  };
}

interface SearchParams {
  npi?: string;
  firstName?: string;
  lastName?: string;
}

export async function searchNppes(params: SearchParams): Promise<NppesOutcome> {
  const url = new URL(NPPES_BASE_URL);
  url.searchParams.set("version", "2.1");
  if (params.npi) url.searchParams.set("number", params.npi);
  if (params.firstName) url.searchParams.set("first_name", params.firstName);
  if (params.lastName) url.searchParams.set("last_name", params.lastName);
  url.searchParams.set("limit", "20");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      return { kind: "error", message: `NPI registry returned HTTP ${response.status}.` };
    }

    const body = (await response.json()) as NppesSuccessResponse | NppesErrorResponse;

    if ("Errors" in body) {
      return { kind: "error", message: body.Errors[0]?.description ?? "NPI registry rejected the request." };
    }

    return {
      kind: "ok",
      resultCount: body.result_count,
      providers: body.results.map(normalizeProvider),
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { kind: "error", message: "NPI registry took too long to respond." };
    }
    return { kind: "error", message: "Could not reach the NPI registry." };
  } finally {
    clearTimeout(timeout);
  }
}
