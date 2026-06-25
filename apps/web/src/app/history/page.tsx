import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getLookupHistory, type Lookup, type LookupStatus } from "@/lib/api";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<LookupStatus, string> = {
  SUCCESS: "Success",
  NOT_FOUND: "Not found",
  INVALID_QUERY: "Invalid query",
  API_ERROR: "API error",
};

const STATUS_VARIANT: Record<LookupStatus, "default" | "secondary" | "destructive" | "outline"> = {
  SUCCESS: "default",
  NOT_FOUND: "secondary",
  INVALID_QUERY: "destructive",
  API_ERROR: "destructive",
};

export default async function HistoryPage() {
  let lookups: Lookup[] = [];
  let loadError: string | null = null;

  try {
    lookups = await getLookupHistory();
  } catch {
    loadError = "Could not reach the API. Is the backend running?";
  }

  return (
    <div className="flex flex-1 flex-col bg-background">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-16">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Lookup history</h1>
          <p className="text-muted-foreground">
            The 50 most recent searches, including failed and invalid ones.
          </p>
        </div>

        {loadError && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Could not load history</AlertTitle>
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
        )}

        {!loadError && lookups.length === 0 && (
          <p className="text-sm text-muted-foreground">No lookups yet.</p>
        )}

        {!loadError && lookups.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Query</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Results</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lookups.map((lookup) => (
                <TableRow key={lookup.id}>
                  <TableCell className="font-medium">{lookup.query}</TableCell>
                  <TableCell>{lookup.queryType}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[lookup.status]}>
                      {STATUS_LABEL[lookup.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>{lookup.resultCount}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(lookup.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </main>
    </div>
  );
}
