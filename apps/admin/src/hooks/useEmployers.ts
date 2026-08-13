import { useQuery } from "@tanstack/react-query";
import { fetchEmployers, fetchEmployerProfile, employerCards } from "../api/employers.api";

export const useEmployers = (page: number) => {
  return useQuery({
    queryKey: ["employers", { page }],
    queryFn: () => fetchEmployers(page),
  });
};

export const useEmployerProfile = (id: string) => {
  return useQuery({
    queryKey: ["employer_profile", id],
    queryFn: () => fetchEmployerProfile(id),
    enabled: !!id,
  });
};

export const useEmployerCards = () => {
  return useQuery({
    queryKey: ["employer-dashboard-cards"],
    queryFn: employerCards,
    staleTime: 1000 * 30, // 30 sec
  });
};
