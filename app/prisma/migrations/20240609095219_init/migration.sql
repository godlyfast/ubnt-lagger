-- CreateTable
CREATE TABLE "QosEntries" (
    "id" SERIAL NOT NULL,
    "ip" TEXT NOT NULL,
    "name" TEXT,
    "upSpeed" INTEGER,
    "downSpeed" INTEGER,

    CONSTRAINT "QosEntries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QosEntries_ip_key" ON "QosEntries"("ip");
