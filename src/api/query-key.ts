export const QUERY_KEY = {
    SEARCH_DOMAINS: "search-domains",
    GET_ALL_DOMAINS_FROM_ADDRESS: "get-all-domains-from-address",
} as const;

export type QueryKey = typeof QUERY_KEY[keyof typeof QUERY_KEY];