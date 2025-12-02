-- AlterTable
ALTER TABLE "Capacity" ADD COLUMN     "closed" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "StoreSettings" (
    "id" SERIAL NOT NULL,
    "shop" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Europe/London',
    "defaultDespatchLead" INTEGER NOT NULL DEFAULT 1,
    "defaultDeliveryLead" INTEGER NOT NULL DEFAULT 2,
    "countryOverrides" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Allocation" (
    "id" SERIAL NOT NULL,
    "orderId" TEXT NOT NULL,
    "capacityId" INTEGER NOT NULL,
    "despatchDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Allocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StoreSettings_shop_key" ON "StoreSettings"("shop");
