-- CreateEnum
CREATE TYPE "Status" AS ENUM ('quero_ler', 'lendo', 'lido');

-- CreateTable
CREATE TABLE "Livro" (
    "id" UUID NOT NULL,
    "titulo" VARCHAR(150) NOT NULL,
    "titulo_normalizado" VARCHAR(150) NOT NULL,
    "autor" VARCHAR(150) NOT NULL,
    "autor_normalizado" VARCHAR(150) NOT NULL,
    "ano_publicacao" INTEGER,
    "numero_paginas" INTEGER,
    "resenha" TEXT,
    "status" "Status" NOT NULL DEFAULT 'quero_ler',
    "nota" SMALLINT,
    "data_inicio" DATE,
    "data_conclusao" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Livro_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "livros_status_idx" ON "Livro"("status");

-- CreateIndex
CREATE INDEX "livros_updated_at_idx" ON "Livro"("updated_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Livro_titulo_normalizado_autor_normalizado_key" ON "Livro"("titulo_normalizado", "autor_normalizado");
