import Layout from "@/components/layout";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import ChatMessage from "./components/chat-message";
import ConnectModal from "./components/connect-modal";
import { Toaster } from "sonner";
import useXmtp from "./hooks/useXmtp";
import DialogProfile from "./components/dialog-profile";
import ConnectXMTPLoader from "./components/connecti-xmtp-loader";
import { Route, Routes, Navigate } from "react-router";
import DiscoverPage from "./pages/discover";

const App = () => {
  const { isLoadingXmtp } = useXmtp();
  return (
    <Layout>
      {isLoadingXmtp && <ConnectXMTPLoader />}
      <Header />
      <div className="flex h-full max-h-[calc(100%_-_var(--spacing)*10)]">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <Routes>
            {/* EN: Redirect root to chat for clarity | ZH: 根路径重定向到 chat */}
            <Route path="/" element={<Navigate to="/chat" replace />} />
            <Route path="/chat" element={<ChatMessage />} />
            <Route path="/discover" element={<DiscoverPage />} />
          </Routes>
        </div>
      </div>
      <ConnectModal />
      <DialogProfile />
      <Toaster />
    </Layout>
  );
};

export default App;
