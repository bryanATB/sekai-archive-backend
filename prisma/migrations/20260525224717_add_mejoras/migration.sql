-- CreateEnum
CREATE TYPE "TipoMejora" AS ENUM ('MULTIPLICADOR', 'AUTO_CLICKER');

-- CreateTable
CREATE TABLE "mejoras" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" "TipoMejora" NOT NULL,
    "nivel" INTEGER NOT NULL DEFAULT 1,
    "compradaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mejoras_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mejoras_usuarioId_tipo_key" ON "mejoras"("usuarioId", "tipo");

-- AddForeignKey
ALTER TABLE "mejoras" ADD CONSTRAINT "mejoras_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
