/*
  Warnings:

  - You are about to drop the column `imgUrl` on the `MenuItem` table. All the data in the column will be lost.
  - Added the required column `img_url` to the `MenuItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MenuItem" DROP COLUMN "imgUrl",
ADD COLUMN     "img_url" TEXT NOT NULL;
