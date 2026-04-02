-- CreateIndex
CREATE INDEX "location_idx" ON "Provider" USING GIST ("location");
