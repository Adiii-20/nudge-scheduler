import { Skeleton } from "@/components/ui/skeleton";

export default function BoardLoading() {
  return (
    <main className="p-6">
      <Skeleton className="h-8 w-64" />
      <div className="mt-6 grid gap-4 xl:grid-cols-5">
        {[0, 1, 2, 3, 4].map((item) => (
          <Skeleton key={item} className="h-[520px]" />
        ))}
      </div>
    </main>
  );
}
