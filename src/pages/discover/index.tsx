import React, { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * Discover page (UI scaffold with minimal mock data)
 * Discover 页面（使用最小的本地假数据搭建 UI 结构）
 *
 * NOTE/注意：
 * - Per your approval, we use a few explicit mock items to shape the UI.
 *   经你的同意，这里仅用少量“固定假数据”支撑布局。
 * - No external services or new dependencies are used.
 *   不引入外部服务或新依赖。
 */

// EN: Minimal item type used to render the grid
// ZH: 用于渲染网格的最小数据结构
type DiscoverItem = {
  name: string;
  price: number;
  currency: string;
  usd: number;
  chain: string;
  length: number;
};

// EN: Doma official-like blue for primary action
// ZH: 主要操作按钮采用接近 Doma 官网的蓝色
const DOMA_BLUE = "#1F64FF";
const DOMA_BLUE_HOVER = "#184ED1";

const DiscoverPage: React.FC = () => {
  const mockItems = useMemo<DiscoverItem[]>(
    () => [
      {
        name: "alpha.xyz",
        price: 1,
        currency: "ETH",
        usd: 4517.927,
        chain: "Doma Testnet",
        length: 9,
      },
      {
        name: "play21.ape",
        price: 0.42,
        currency: "ETH",
        usd: 1896.12,
        chain: "Doma Testnet",
        length: 10,
      },
      {
        name: "exvo69.one",
        price: 2.5,
        currency: "ETH",
        usd: 11294.81,
        chain: "Doma Testnet",
        length: 9,
      },
      {
        name: "stack.dev",
        price: 0.88,
        currency: "ETH",
        usd: 3977.72,
        chain: "Doma Testnet",
        length: 9,
      },
      {
        name: "neon.io",
        price: 0.33,
        currency: "ETH",
        usd: 1491.75,
        chain: "Doma Testnet",
        length: 7,
      },
      {
        name: "orbit.ai",
        price: 3.1,
        currency: "ETH",
        usd: 13838.27,
        chain: "Doma Testnet",
        length: 7,
      },
    ],
    []
  );

  // EN: Items state; fallback to mock when API is not configured
  // ZH: 列表状态；未配置接口则回退到本地数据
  const [items, setItems] = useState<DiscoverItem[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  // EN: local toolbar states / ZH: 本地工具条状态
  const [query, setQuery] = useState<string>("");
  const [listedOnly, setListedOnly] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<string>("popularity");

  useEffect(() => {
    const url = (import.meta as any).env?.VITE_DOMA_GRAPHQL_URL as string | undefined;

    if (!url) {
      setItems(mockItems);
      return;
    }

    const controller = new AbortController();
    const run = async () => {
      try {
        setLoading(true);
        const query = `
          query NamesQuery($skip: Int, $take: Int, $listed: Boolean, $name: String, $tlds: [String!]) {
            names(skip: $skip, take: $take, listed: $listed, name: $name, tlds: $tlds, active: true) {
              items {
                name
                tokens {
                  chain { name networkId }
                  listings {
                    price
                    currency { symbol decimals usdExchangeRate }
                  }
                }
              }
            }
          }
        `;
        const variables = { skip: 0, take: 6, listed: true, name: "", tlds: null };
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, variables }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`GraphQL status ${res.status}`);
        const json = await res.json();
        if (json.errors?.length) throw new Error(json.errors[0].message);

        const normalized: DiscoverItem[] = (json.data?.names?.items || []).map(
          (n: any): DiscoverItem => {
            const token = n.tokens?.[0];
            const listing = token?.listings?.[0];
            let price = 0;
            let usd = 0;
            let currency = listing?.currency?.symbol || "ETH";
            if (listing?.price && listing?.currency?.decimals != null) {
              try {
                const decimals = Number(listing.currency.decimals);
                const denom = Math.pow(10, decimals);
                price = Number(String(listing.price)) / denom;
                usd = price * (Number(listing.currency.usdExchangeRate) || 0);
              } catch {
                price = 0;
                usd = 0;
              }
            }
            return {
              name: n.name,
              price,
              currency,
              usd,
              chain: token?.chain?.name || "Unknown",
              length: (n.name || "").length,
            };
          }
        );

        setItems(normalized.length ? normalized : mockItems);
      } catch (e) {
        setItems(mockItems);
      } finally {
        setLoading(false);
      }
    };
    run();
    return () => controller.abort();
  }, [mockItems]);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Title / 标题 */}
      <h1 className="text-2xl md:text-3xl font-bold mb-4">Discover</h1>
      {/* Toolbar / 工具条 */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Search domains..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity">Popularity</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="length">Length</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 accent-primary"
              checked={listedOnly}
              onChange={(e) => setListedOnly(e.target.checked)}
            />
            <span className="text-muted-foreground">Listed Only</span>
          </div>
        </div>
      </div>

      {/* Grid / 网格列表 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {(items || mockItems)
          // EN: local filter by name / ZH: 名称本地过滤
          .filter((it) => it.name.toLowerCase().includes(query.trim().toLowerCase()))
          // EN: local listed filter / ZH: 上架过滤
          .filter((it) => (listedOnly ? it.price > 0 : true))
          // EN: local sort / ZH: 本地排序
          .sort((a, b) => {
            if (sortBy === "price-high") return b.price - a.price;
            if (sortBy === "price-low") return a.price - b.price;
            if (sortBy === "length") return a.length - b.length;
            return 0; // popularity: keep as-is
          })
          .map((it) => {
          const hasListing = it.price > 0;
          return (
            <Card
              key={it.name}
              className={`p-4 transition hover:shadow ${
                hasListing ? "" : "opacity-90"
              }`}
            >
              <div className="space-y-3">
                {/* Header / 头部 */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-muted" />
                    <span className="font-semibold text-lg">{it.name}</span>
                  </div>
                  <div className="h-6 w-6 rounded-full bg-muted" />
                </div>

                {/* Badges / 标记 */}
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{it.length} chars</Badge>
                  <Badge>{it.chain}</Badge>
                </div>

                {/* Price / 价格 */}
                <div className="space-y-1">
                  {hasListing ? (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="text-xl font-bold">
                          {it.price} {it.currency}
                        </div>
                        <div className="text-xs text-muted-foreground">${it.usd.toLocaleString()} USD</div>
                      </div>
                    </>
                  ) : (
                    <div className="text-muted-foreground">Available for offers</div>
                  )}
                </div>

                {/* Actions / 操作 */}
                <div className="flex gap-2">
                  {hasListing ? (
                    <Button
                      className="flex-1 text-white"
                      style={{ backgroundColor: DOMA_BLUE }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = DOMA_BLUE_HOVER)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = DOMA_BLUE)}
                    >
                      Buy or Make Offer
                    </Button>
                  ) : (
                    <Button variant="ghost" className="flex-1">Watch</Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}

        {/* Loading skeleton samples / 加载骨架示例 */}
        {loading && [1, 2].map((k) => (
          <Card key={`s-${k}`} className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 flex-1" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DiscoverPage;


