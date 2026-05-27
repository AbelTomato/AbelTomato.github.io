import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import momentsDataurl from "../data/moments.json?url";

export type MomentItem = {
  text: string;
  author: string;
  source: string;
  image: string;
};

export type MomentsData = MomentItem[];

export const useMomentsData = (): UseQueryResult<MomentsData, Error> => {
  return useQuery({
    queryKey: ["momentsData"],
    queryFn: async () => {
      try {
        const response = await fetch(momentsDataurl);
        if (!response.ok) throw new Error(`状态码: ${response.status}`);
        return response.json();
      } catch (err) {
        throw err;
      }
    },
    staleTime: 1000 * 60 * 60,
  });
};
