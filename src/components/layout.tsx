const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="bg-secondary p-0 sm:p-0 md:p-0 lg:p-4 xl:p-4 w-screen h-screen">
      <div className="w-full h-full bg-background rounded-none sm:rounded-none md:rounded-none lg:rounded-xl xl:rounded-xl flex flex-col">
        {children}
      </div>
    </div>
  );
};
export default Layout;
