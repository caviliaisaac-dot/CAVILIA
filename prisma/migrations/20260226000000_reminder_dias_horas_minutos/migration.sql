-- AlterTable
ALTER TABLE "reminder_settings" ADD COLUMN "quantidade_dias" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "reminder_settings" ADD COLUMN "quantidade_horas" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "reminder_settings" ADD COLUMN "quantidade_minutos" INTEGER NOT NULL DEFAULT 0;
