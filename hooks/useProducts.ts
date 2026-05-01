import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../utils/firebaseData";

export const useProducts = (category?: string) => {
  return useQuery({
    queryKey: ["products", category],
    queryFn: async () => {
      const options = category && category !== "All" ? { category } : {};
      return await getProducts(options);
    },
    // Keep stale data for 1 minute, but refetch on mount to ensure deletions are picked up
    staleTime: 1000 * 60, 
  });
};
