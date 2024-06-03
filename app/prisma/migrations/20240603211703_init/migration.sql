-- CreateTable
CREATE TABLE "Entries" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ip" TEXT NOT NULL,
    "name" TEXT,
    "upSpeed" INTEGER,
    "downSpeed" INTEGER
);

-- CreateIndex
CREATE UNIQUE INDEX "Entries_ip_key" ON "Entries"("ip");
