"use client";
import { createContext, useContext } from "react";

export type CategoryLite = { id: string; name: string; slug: string };

const CategoryContext = createContext<CategoryLite[]>([]);

export function CategoryProvider({ categories, children }: { categories: CategoryLite[]; children: React.ReactNode }) {
  return <CategoryContext.Provider value={categories}>{children}</CategoryContext.Provider>;
}

export const useCategories = () => useContext(CategoryContext);
