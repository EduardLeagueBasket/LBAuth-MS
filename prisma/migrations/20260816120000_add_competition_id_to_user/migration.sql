-- Add competitionId so league/team staff belong to a catalog competition
ALTER TABLE "users" ADD COLUMN "competitionId" TEXT;

CREATE INDEX "users_competitionId_idx" ON "users"("competitionId");
