-- CreateEnum
CREATE TYPE "QueryType" AS ENUM ('NPI', 'NAME');

-- CreateEnum
CREATE TYPE "LookupStatus" AS ENUM ('SUCCESS', 'NOT_FOUND', 'INVALID_QUERY', 'API_ERROR');

-- CreateTable
CREATE TABLE "Lookup" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "queryType" "QueryType" NOT NULL,
    "status" "LookupStatus" NOT NULL,
    "resultCount" INTEGER NOT NULL DEFAULT 0,
    "results" JSONB,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lookup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lookup_createdAt_idx" ON "Lookup"("createdAt");
