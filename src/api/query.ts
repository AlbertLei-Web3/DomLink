import { useQuery } from "@tanstack/react-query";
import { QUERY_KEY } from "./query-key";
import { fetchAllDomainsFromAddress, fetchDomains } from "./endpoints";
import type { DomainName } from "./types";

const useSearchDomains = (name: string) => {
  return useQuery<DomainName[]>({
    queryKey: [QUERY_KEY.SEARCH_DOMAINS, name],
    queryFn: () => fetchDomains(name),
  });
};

const useGetAllDomainsFromAddress = (address: string) => {
  return useQuery<DomainName[]>({
    queryKey: [QUERY_KEY.GET_ALL_DOMAINS_FROM_ADDRESS, address],
    queryFn: () => fetchAllDomainsFromAddress(address),
    enabled: !!address,
  });
};

export { useSearchDomains, useGetAllDomainsFromAddress };
