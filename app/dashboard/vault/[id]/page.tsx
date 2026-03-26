export default async function EntryPage({
    params,
  }: {
    params: Promise<{ id: string }>;
  }) {                                                                                                  
    const { id } = await params;
                                                                                                        
    return (      
      <div className="p-6">
        <h1 className="text-2xl font-bold">Entry {id}</h1>
        {/* We'll fetch and display the actual entry here later */}                                     
      </div>
    );                                                                                                  
  }  