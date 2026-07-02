"use server";

import { db } from "@/lib/db";

export async function listProducts() {
  return db.product.findMany({ orderBy: { createdAt: "asc" } });
}

export async function getProductByKey(key: string) {
  return db.product.findUnique({ where: { key } });
}
