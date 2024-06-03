import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


export const getEntries = async () => {
  const entries = await prisma.entries.findMany();
  return entries;
}

export const createEntry = async (data: Prisma.EntriesCreateInput) => {
  const entry = await prisma.entries.create({
    data: {
      ...data,
    }
  });
  return entry;
}

export const deleteEntry = async (id: number) => {
  const entry = await prisma.entries.delete({
    where: {
      id
    }
  });
  return entry;
}

export const updateEntry = async (id: number, data: Prisma.EntriesUpdateInput) => {
  const entry = await prisma.entries.update({
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
  const entry = await prisma.entries.findUnique({
    where: {
      id
    }
  });
  return entry;
}

export const getEntryByIp = async (ip: string) => {
  const entry = await prisma.entries.findFirst({
    where: {
      ip
    }
  });
  return entry;
}

export const batchCreateEntries = async (data: Prisma.EntriesCreateManyInput[]) => {
    const entries = await prisma.entries.createMany({
        data
    });
    return entries;
}

export const deleteAllEntries = async () => {
    const entries = await prisma.entries.deleteMany();
    return entries;
}