-- CreateEnum
CREATE TYPE "Rareza" AS ENUM ('COMUN', 'RARA', 'EPICA', 'MITICA', 'LEGENDARIA', 'SECRETA', 'EXCLUSIVA', 'SEKAI');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "puntos" INTEGER NOT NULL DEFAULT 0,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cartas" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "personaje" TEXT NOT NULL,
    "serie" TEXT NOT NULL,
    "rareza" "Rareza" NOT NULL,
    "imagenUrl" TEXT NOT NULL,
    "descripcion" TEXT,
    "limitada" BOOLEAN NOT NULL DEFAULT false,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cartas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sobres" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "costo" INTEGER NOT NULL,
    "cantCartas" INTEGER NOT NULL DEFAULT 5,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sobres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sobre_cartas" (
    "id" TEXT NOT NULL,
    "sobreId" TEXT NOT NULL,
    "cartaId" TEXT NOT NULL,
    "peso" INTEGER NOT NULL DEFAULT 100,

    CONSTRAINT "sobre_cartas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aperturas" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "sobreId" TEXT NOT NULL,
    "puntosGastados" INTEGER NOT NULL,
    "abiertaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aperturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apertura_resultados" (
    "id" TEXT NOT NULL,
    "aperturaId" TEXT NOT NULL,
    "cartaId" TEXT NOT NULL,
    "fueNueva" BOOLEAN NOT NULL,

    CONSTRAINT "apertura_resultados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventario" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "cartaId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "obtenidaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "albums" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "totalCartas" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "albums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "album_entradas" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "albumId" TEXT NOT NULL,
    "cartaId" TEXT NOT NULL,
    "posicion" INTEGER NOT NULL,
    "pegadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "album_entradas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pity" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "contadorSekai" INTEGER NOT NULL DEFAULT 0,
    "contadorExclusiva" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "pity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_username_key" ON "usuarios"("username");

-- CreateIndex
CREATE UNIQUE INDEX "sobre_cartas_sobreId_cartaId_key" ON "sobre_cartas"("sobreId", "cartaId");

-- CreateIndex
CREATE UNIQUE INDEX "inventario_usuarioId_cartaId_key" ON "inventario"("usuarioId", "cartaId");

-- CreateIndex
CREATE UNIQUE INDEX "album_entradas_usuarioId_albumId_posicion_key" ON "album_entradas"("usuarioId", "albumId", "posicion");

-- CreateIndex
CREATE UNIQUE INDEX "album_entradas_usuarioId_albumId_cartaId_key" ON "album_entradas"("usuarioId", "albumId", "cartaId");

-- CreateIndex
CREATE UNIQUE INDEX "pity_usuarioId_key" ON "pity"("usuarioId");

-- AddForeignKey
ALTER TABLE "sobre_cartas" ADD CONSTRAINT "sobre_cartas_sobreId_fkey" FOREIGN KEY ("sobreId") REFERENCES "sobres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sobre_cartas" ADD CONSTRAINT "sobre_cartas_cartaId_fkey" FOREIGN KEY ("cartaId") REFERENCES "cartas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aperturas" ADD CONSTRAINT "aperturas_sobreId_fkey" FOREIGN KEY ("sobreId") REFERENCES "sobres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aperturas" ADD CONSTRAINT "aperturas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apertura_resultados" ADD CONSTRAINT "apertura_resultados_aperturaId_fkey" FOREIGN KEY ("aperturaId") REFERENCES "aperturas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apertura_resultados" ADD CONSTRAINT "apertura_resultados_cartaId_fkey" FOREIGN KEY ("cartaId") REFERENCES "cartas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario" ADD CONSTRAINT "inventario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario" ADD CONSTRAINT "inventario_cartaId_fkey" FOREIGN KEY ("cartaId") REFERENCES "cartas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "album_entradas" ADD CONSTRAINT "album_entradas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "album_entradas" ADD CONSTRAINT "album_entradas_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "albums"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "album_entradas" ADD CONSTRAINT "album_entradas_cartaId_fkey" FOREIGN KEY ("cartaId") REFERENCES "cartas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pity" ADD CONSTRAINT "pity_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
