import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


export const getEntries = async () => {
  const entries = await prisma.qosEntries.findMany();
  return entries;
}

export const createEntry = async (data: Prisma.QosEntriesCreateInput) => {
  const entry = await prisma.qosEntries.create({
    data: {
      ...data,
    }
  });
  return entry;
}

export const deleteEntry = async (id: number) => {
  const entry = await prisma.qosEntries.delete({
    where: {
      id
    }
  });
  return entry;
}

export const updateEntry = async (id: number, data: Prisma.QosEntriesUpdateInput) => {
  const entry = await prisma.qosEntries.update({
    where: {
      id
    },
    data: {
      ...data
    }
  });
  return entry;
}

export const getEntry = async (id: number) => {
  const entry = await prisma.qosEntries.findUnique({
    where: {
      id
    }
  });
  return entry;
}

export const getEntryByIp = async (ip: string) => {
  const entry = await prisma.qosEntries.findFirst({
    where: {
      ip
    }
  });
  return entry;
}

export const batchCreateEntries = async (data: Prisma.QosEntriesCreateManyInput[]) => {
    const entries = await prisma.qosEntries.createMany({
        data
    });
    return entries;
}

export const deleteAllEntries = async () => {
    const entries = await prisma.qosEntries.deleteMany();
    return entries;
}