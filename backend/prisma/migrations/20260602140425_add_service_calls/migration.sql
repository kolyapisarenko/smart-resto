-- CreateEnum
CREATE TYPE "CallType" AS ENUM ('WAITER', 'BILL', 'HELP');

-- CreateTable
CREATE TABLE "ServiceCall" (
    "tableId" INTEGER NOT NULL,
    "type" "CallType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceCall_pkey" PRIMARY KEY ("tableId")
);
