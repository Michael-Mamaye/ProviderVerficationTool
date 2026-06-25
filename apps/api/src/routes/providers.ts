import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";

export const providersRouter = Router();

const createProviderSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  npiNumber: z.string().regex(/^\d{10}$/, "NPI must be 10 digits"),
  licenseNumber: z.string().min(1),
  licenseState: z.string().length(2),
});

providersRouter.get("/", async (_req, res) => {
  const providers = await prisma.provider.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json(providers);
});

providersRouter.get("/:id", async (req, res) => {
  const provider = await prisma.provider.findUnique({
    where: { id: req.params.id },
    include: { verifications: true },
  });

  if (!provider) {
    res.status(404).json({ error: "Provider not found" });
    return;
  }

  res.json(provider);
});

providersRouter.post("/", async (req, res) => {
  const parsed = createProviderSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const provider = await prisma.provider.create({ data: parsed.data });
  res.status(201).json(provider);
});
