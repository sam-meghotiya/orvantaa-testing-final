import React, { useState, useMemo, useEffect } from 'react';
import { Conversation } from '../types.ts';
import { TrashIcon, LoadIcon, SearchIcon, AiSparkleIcon, HistoryIcon } from './icons/Icons.tsx';

interface HistoryViewProps {
  history: Conversation[];
  onLoad: (conversation: Conversation) => void;
  onDelete: (id: string) => void;
  onSearch: (searchTerm: string) => Promise<string[]>;
}

const ConversationCard: React.FC<{
  conversation: Conversation;
  onLoad: () => void;
  onDelete: () => void;
  index: number;
}> = ({ conversation, onLoad, onDelete, index }) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div 
      className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex flex-col gap-3 group transition-all duration-300 hover:border-white/50 focus-within:border-white/50 shadow-lg hover:shadow-white/10"
      style={{ animation: `fade-in-up 0.5s ${(index % 12) * 0.05}s ease-out backwards` }}
    >
      <div className="flex-grow">
        <h3 className="font-bold text-md text-white line-clamp-2">{conversation.title}</h3>
        <p className="text-xs text-[var(--text-muted)] mt-1">{formatDate(conversation.updatedAt)}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {conversation.tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="px-2 py-0.5 text-xs bg-white/10 text-white rounded">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
        <button
          onClick={() => {
              if (navigator.vibrate) navigator.vibrate(5);
              onDelete();
          }}
          aria-label={`Delete conversation titled ${conversation.title}`}
          className="p-2 rounded-md text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-500 transition-colors"
        >
          <TrashIcon />
        </button>
        <button
          onClick={() => {
              if (navigator.vibrate) navigator.vibrate(5);
              onLoad();
          }}
          aria-label={`Load conversation titled ${conversation.title}`}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm bg-white text-black hover:bg-gray-300 transition-colors"
        >
          <LoadIcon />
          <span>Load</span>
        </button>
      </div>
    </div>
  );
};

const SkeletonCard: React.FC = () => (
    <div className="bg-black/30 border border-white/10 rounded-xl p-4 animate-pulse">
        <div className="h-5 w-3/4 bg-white/10 rounded"></div>
        <div className="h-3 w-1/2 bg-white/10 rounded mt-2"></div>
        <div className="flex gap-2 mt-4">
            <div className="h-4 w-16 bg-white/10 rounded"></div>
            <div className="h-4 w-20 bg-white/10 rounded"></div>
        </div>
    </div>
);


export const HistoryView: React.FC<HistoryViewProps> = ({ history, onLoad, onDelete, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [filteredIds, setFilteredIds] = useState<string[] | null>(null);

  useEffect(() => {
    setSearchTerm('');
    setFilteredIds(null);
  }, [history]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (navigator.vibrate) navigator.vibrate(10);
    setIsSearching(true);
    setFilteredIds(null);
    try {
      const ids = await onSearch(searchTerm);
      setFilteredIds(ids);
    } catch (error) {
      console.error("Search failed", error);
      setFilteredIds([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  const conversationsToDisplay = useMemo(() => {
    if (filteredIds === null) return history;
    const idSet = new Set(filteredIds);
    const relevantConversations = history.filter(c => idSet.has(c.id));
    return relevantConversations.sort((a, b) => filteredIds.indexOf(a.id) - filteredIds.indexOf(b.id));
  }, [history, filteredIds]);

  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in px-4 py-8 h-full flex flex-col">
       <style>{`
          @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
           .animate-fade-in { animation: fade-in 0.5s ease-out; }
        `}</style>
      <div className="text-center mb-8 md:mb-12 flex-shrink-0">
        <h1 className="font-poppins text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tighter">
          Conversation History
        </h1>
        <p className="text-sm md:text-base text-[var(--text-muted)] mt-2 tracking-tight">
          Revisit, continue, or search your past conversations.
        </p>
      </div>

      <div className="max-w-2xl mx-auto mb-8 w-full flex-shrink-0">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <input
              type="search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Describe a past conversation to find it..."
              className="w-full pl-12 pr-4 py-3 bg-black/30 border border-white/10 rounded-full outline-none focus:ring-2 focus:ring-white transition-all"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                {isSearching ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <SearchIcon />}
            </div>
             <button type="submit" disabled={isSearching} className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-1.5 bg-white text-black rounded-full text-sm hover:bg-gray-300 disabled:opacity-60">
                <AiSparkleIcon/>
                <span>AI Search</span>
             </button>
          </div>
        </form>
      </div>

      <div className="flex-grow overflow-y-auto no-scrollbar pr-2 -mr-2">
        {isSearching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : conversationsToDisplay.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {conversationsToDisplay.map((conv, index) => (
              <ConversationCard key={conv.id} conversation={conv} onLoad={() => onLoad(conv)} onDelete={() => onDelete(conv.id)} index={index}/>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 bg-black/20 border border-dashed border-white/10 rounded-2xl h-full flex flex-col justify-center">
              <div className="mx-auto w-fit p-4 bg-white/10 rounded-full text-white">
                  <HistoryIcon width={32} height={32}/>
              </div>
            <h3 className="mt-4 text-xl font-bold text-white">No History Found</h3>
            <p className="mt-2 text-[var(--text-muted)]">
              {filteredIds ? "Your search didn't match any conversations." : "Start a conversation to see your history here."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};