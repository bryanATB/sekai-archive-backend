/*
  Warnings:

  - A unique constraint covering the columns `[usuarioId,sobreId]` on the table `pity` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sobreId` to the `pity` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "pity_usuarioId_key";

-- AlterTable
ALTER TABLE "pity" ADD COLUMN     "sobreId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "pity_usuarioId_sobreId_key" ON "pity"("usuarioId", "sobreId");

-- AddForeignKey
ALTER TABLE "pity" ADD CONSTRAINT "pity_sobreId_fkey" FOREIGN KEY ("sobreId") REFERENCES "sobres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
