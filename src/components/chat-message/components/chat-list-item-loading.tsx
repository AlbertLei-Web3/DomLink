import { Skeleton } from "@/components/ui/skeleton";

const ChatListItemLoading = () => {
  return (
    <div className="flex items-center gap-4 p-4 border-b">
      <Skeleton className="min-w-[40px] h-[40px] rounded-full" />

      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-full max-w-[200px]" />
      </div>
    </div>
  );
};

export default ChatListItemLoading;
