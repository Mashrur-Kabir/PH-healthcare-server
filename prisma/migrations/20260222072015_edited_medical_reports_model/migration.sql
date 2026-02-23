/*
  Warnings:

  - You are about to drop the column `appointmentId` on the `medical_reports` table. All the data in the column will be lost.
  - You are about to drop the column `doctorId` on the `medical_reports` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "medical_reports" DROP CONSTRAINT "medical_reports_appointmentId_fkey";

-- DropForeignKey
ALTER TABLE "medical_reports" DROP CONSTRAINT "medical_reports_doctorId_fkey";

-- DropIndex
DROP INDEX "idx_medical_reports_doctorId";

-- DropIndex
DROP INDEX "medical_reports_appointmentId_key";

-- AlterTable
ALTER TABLE "medical_reports" DROP COLUMN "appointmentId",
DROP COLUMN "doctorId",
ALTER COLUMN "diagnosis" DROP NOT NULL,
ALTER COLUMN "treatment" DROP NOT NULL;
