/*
  Warnings:

  - A unique constraint covering the columns `[startDateTime,endDateTime]` on the table `schedules` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "schedules_startDateTime_endDateTime_key" ON "schedules"("startDateTime", "endDateTime");
