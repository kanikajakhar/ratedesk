import Link from "next/link";
import { notFound } from "next/navigation";
import { dataSource } from "@/lib/data/source";
import { PricingDesk } from "@/app/components/PricingDesk";

export default async function DeskPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;
  const store = dataSource.getStore(storeId);
  if (!store) notFound();

  const initial = dataSource.listRecommendations(storeId);

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6">
        <Link href="/" className="text-xs text-zinc-500 transition-colors hover:text-zinc-300">
          ← All stores
        </Link>
        <div className="mt-2 flex items-end justify-between">
          <div>
            <h1 className="text-xl font-semibold text-zinc-100">{store.name}</h1>
            <div className="text-xs text-zinc-500">
              {store.market} · {store.region}
            </div>
          </div>
          <div className="text-xs text-zinc-600">
            Opened {new Date(store.openedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
          </div>
        </div>
      </div>

      <PricingDesk storeId={storeId} initial={initial} />
    </main>
  );
}
