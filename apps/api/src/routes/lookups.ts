import { Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { parseQuery } from "../lib/npi.js";
import { prisma } from "../prisma.js";
import { searchNppes } from "../services/nppes.js";

export const lookupsRouter = Router();

const searchSchema = z.object({
  query: z.string().min(1),
});

lookupsRouter.post("/", async (req, res) => {
  const parsed = searchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "A search query is required." });
    return;
  }

  const query = parsed.data.query.trim();
  const parsedQuery = parseQuery(query);

  if (parsedQuery.type === "INVALID") {
    const lookup = await prisma.lookup.create({
      data: {
        query,
        queryType: "NPI",
        status: "INVALID_QUERY",
        errorMessage: parsedQuery.reason,
      },
    });
    res.status(200).json(lookup);
    return;
  }

  const outcome =
    parsedQuery.type === "NPI"
      ? await searchNppes({ npi: parsedQuery.npi })
      : await searchNppes({ firstName: parsedQuery.firstName, lastName: parsedQuery.lastName });

  if (outcome.kind === "error") {
    const lookup = await prisma.lookup.create({
      data: {
        query,
        queryType: parsedQuery.type,
        status: "API_ERROR",
        errorMessage: outcome.message,
      },
    });
    res.status(200).json(lookup);
    return;
  }

  const lookup = await prisma.lookup.create({
    data: {
      query,
      queryType: parsedQuery.type,
      status: outcome.resultCount > 0 ? "SUCCESS" : "NOT_FOUND",
      resultCount: outcome.resultCount,
      results: outcome.providers as unknown as Prisma.InputJsonValue,
    },
  });

  res.status(200).json(lookup);
});

lookupsRouter.get("/", async (_req, res) => {
  const lookups = await prisma.lookup.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  res.json(lookups);
});
