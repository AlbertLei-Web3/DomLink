import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Compass, MessageSquareText } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import React from "react";

/**
 * Sidebar component
 * 侧边栏组件
 *
 * - Renders navigation buttons for Messages and Discover (English-only labels)
 *   渲染 Messages 与 Discover 的导航按钮（界面文字仅英文）
 * - Highlights the active route based on current location
 *   根据当前路由高亮对应的按钮
 * - Uses slightly larger font-size for better readability
 *   使用更大的字体提高可读性
 */
const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    // EN: Consider root "/" as chat route so both "/" and "/chat" highlight Chat
    // ZH: 将根路径 "/" 视为 Chat 路由，因此 "/" 与 "/chat" 都高亮 Chat
    if (path === "/chat") {
      return location.pathname === "/" || location.pathname.startsWith("/chat");
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="h-full w-56 shrink-0 border-r bg-background/50 px-3 py-4 hidden md:flex md:flex-col gap-3">
      {/* EN: Section title (English only) / ZH: 区域标题（仅英文） */}
      <div className="px-2 text-sm font-semibold text-muted-foreground">Navigation</div>
      <div className="flex flex-col gap-1.5">
        <Button
          variant={isActive("/chat") ? "secondary" : "ghost"}
          className="justify-start text-[15px] font-medium h-10"
          onClick={() => navigate("/chat")}
        >
          <MessageSquareText className="mr-2 h-4 w-4" /> Messages
        </Button>
        <Button
          variant={isActive("/discover") ? "secondary" : "ghost"}
          className="justify-start text-[15px] font-medium h-10"
          onClick={() => navigate("/discover")}
        >
          <Compass className="mr-2 h-4 w-4" /> Discover
        </Button>
      </div>
      <Separator className="my-2" />
      {/* EN: Placeholder for future sections (keep English-only UI) / ZH: 预留未来分区（界面文字保持英文） */}
      <div className="px-2 text-xs text-muted-foreground">More</div>
    </div>
  );
};

export default Sidebar;


