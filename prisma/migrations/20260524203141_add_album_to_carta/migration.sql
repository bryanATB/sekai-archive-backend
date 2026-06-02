-- AlterTable
ALTER TABLE "cartas" ADD COLUMN     "albumId" TEXT;

-- AddForeignKey
ALTER TABLE "cartas" ADD CONSTRAINT "cartas_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "albums"("id") ON DELETE SET NULL ON UPDATE CASCADE;
