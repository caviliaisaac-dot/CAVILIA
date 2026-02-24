-- CreateEnum
CREATE TYPE "ReminderUnit" AS ENUM ('day', 'hour', 'minute');

-- CreateTable
CREATE TABLE "reminder_settings" (
    "id" TEXT NOT NULL,
    "unidade" "ReminderUnit" NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "reminder_settings_pkey" PRIMARY KEY ("id")
);
