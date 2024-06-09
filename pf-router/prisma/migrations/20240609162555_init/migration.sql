-- CreateTable
CREATE TABLE "IpRecord" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IpRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DomainName" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DomainName_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DomainNameToIpRecord" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "DomainName_name_key" ON "DomainName"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_DomainNameToIpRecord_AB_unique" ON "_DomainNameToIpRecord"("A", "B");

-- CreateIndex
CREATE INDEX "_DomainNameToIpRecord_B_index" ON "_DomainNameToIpRecord"("B");

-- AddForeignKey
ALTER TABLE "_DomainNameToIpRecord" ADD CONSTRAINT "_DomainNameToIpRecord_A_fkey" FOREIGN KEY ("A") REFERENCES "DomainName"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DomainNameToIpRecord" ADD CONSTRAINT "_DomainNameToIpRecord_B_fkey" FOREIGN KEY ("B") REFERENCES "IpRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
