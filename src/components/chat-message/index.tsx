import ListChats from "./components/list-chats";
import MessageComponent from "./components/message";
import { ChatProvider } from "./context/chat-context";

const ChatMessage = () => {
  return (
    <ChatProvider>
      <div className="flex h-full max-h-[calc(100%_-_var(--spacing)*10)] md:p-4 p-2 gap-4">
        <ListChats />
        <MessageComponent />
      </div>
    </ChatProvider>
  );
};

export default ChatMessage;
