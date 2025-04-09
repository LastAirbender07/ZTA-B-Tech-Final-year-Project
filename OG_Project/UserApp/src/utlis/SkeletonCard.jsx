import { Skeleton } from "@/components/ui/skeleton";
const SkeletonCard = () => {
  const auditors = new Array(9).fill(null);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {auditors.map((auditor) => (
        <div className={"auditor-card rounded-xl border p-2"}>
          <div className="flex items-center mb-4">
            <Skeleton className="w-14 h-14 object-cover rounded-full mr-4"></Skeleton>
            <Skeleton className="w-7 h-4 rounded-md" />
            <Skeleton className="w-7 h-4 rounded-md" />
          </div>

          <div className="space-y-1 mb-4">
            <Skeleton className="w-7 h-4 rounded-md" />
            <Skeleton className="w-7 h-4 rounded-md" />
            <Skeleton className="w-7 h-4 rounded-md" />
          </div>

          <Skeleton className="w-full py-2 rounded-md flex items-center justify-center">
            <Skeleton className="w-7 h-4 rounded-md" />
          </Skeleton>
        </div>
      ))}
    </div>
  );
};

export default SkeletonCard;
