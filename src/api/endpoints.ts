import { apiClient } from "./client";

const fetchDomains = async (name: string) => {
  return apiClient()
    .post("", {
      query: `
            query {
                names(name: "${name}") {
                    items {
                        claimedBy
                        eoi
                        expiresAt
                        name
                        isFractionalized
                        tokenizedAt
                        tokens {
                            networkId
                            tokenAddress
                            tokenId
                        }
                    }
                }
            }
        `,
    })
    .then((res) => res.data.data.names.items);
};

const fetchAllDomainsFromAddress = async (address: string) => {
  return apiClient()
    .post("", {
      query: `
            query {
                names(ownedBy: "${address}") {
                    items {
                        claimedBy
                        eoi
                        expiresAt
                        name
                        isFractionalized
                        tokenizedAt
                        tokens {
                            networkId
                            tokenAddress
                            tokenId
                        }
                    }
                }
            }
        `,
    })
    .then((res) => res.data.data.names.items);
};

export { fetchDomains, fetchAllDomainsFromAddress };
