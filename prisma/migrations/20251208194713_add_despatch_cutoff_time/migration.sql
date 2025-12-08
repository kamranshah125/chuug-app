/*
  Warnings:

  - A unique constraint covering the columns `[shop]` on the table `Session` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "StoreSettings" ADD COLUMN     "despatchCutoffTime" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Session_shop_key" ON "Session"("shop");
