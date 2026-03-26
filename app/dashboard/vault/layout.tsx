export default function VaultLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className="flex h-screen">
        <aside className="w-80 border-r border-gray-200 bg-white overflow-y-auto">
          {/* Journal entry list will go here */}                                                       
          <div className="p-4">                                                                         
            <h2 className="text-lg font-semibold">Work Journal</h2>                                     
          </div>                                                                                        
        </aside>                                                                                        
        <main className="flex-1 overflow-y-auto">
          {children}                                                                                    
        </main>   
      </div>
    );
  }