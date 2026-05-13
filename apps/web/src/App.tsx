import { useState, useEffect } from 'react';
import { ChatInterface } from './components/ChatInterface.tsx';

type ServerStatus = 'checking' | 'online' | 'offline';
type ServerPhase = 1 | 2;

interface ServerInfo {
  status: ServerStatus;
  phase: ServerPhase;
  dbConnected: boolean;
}

export default function App() {
  const [server, setServer] = useState<ServerInfo>({
    status: 'checking',
    phase: 2,
    dbConnected: false,
  });

  useEffect(() => {
    fetch('/health')
      .then((r) => r.json())
      .then((data) => {
        setServer({
          status: 'online',
          phase: data.phase ?? 1,
          dbConnected: data.dbConnected ?? false,
        });
      })
      .catch(() => setServer((s) => ({ ...s, status: 'offline' })));
  }, []);

  return (
    <div className="min-h-screen bg-bmw-black flex flex-col">
      {/* Header */}
      <header className="border-b border-bmw-border bg-bmw-dark/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <BmwLogo />
            <div>
              <h1 className="text-bmw-light font-bold text-base tracking-tight leading-none">
                BMW AI Assistant
              </h1>
              <p className="text-bmw-silver text-[10px] tracking-wider uppercase">Sheer Driving Pleasure</p>
            </div>
          </div>

          {/* Status indicators */}
          <div className="flex items-center gap-2">
            <StatusBadge server={server} />
            <span className="px-2 py-1 bg-bmw-blue/20 border border-bmw-blue/40 text-bmw-blue text-xs rounded-md font-semibold">
              Phase 2
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main
        className="flex-1 max-w-7xl mx-auto w-full flex flex-col"
        style={{ height: 'calc(100vh - 57px)' }}
      >
        {server.status === 'offline' ? (
          <OfflineState />
        ) : (
          <ChatInterface />
        )}
      </main>
    </div>
  );
}

function StatusBadge({ server }: { server: ServerInfo }) {
  if (server.status === 'checking') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-bmw-dark border border-bmw-border rounded-lg">
        <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
        <span className="text-bmw-silver text-xs">Connecting…</span>
      </div>
    );
  }

  if (server.status === 'offline') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-bmw-dark border border-red-500/30 rounded-lg">
        <span className="w-2 h-2 rounded-full bg-red-400" />
        <span className="text-red-400 text-xs">Server Offline</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-bmw-dark border border-bmw-border rounded-lg">
      <span className="w-2 h-2 rounded-full bg-emerald-400" />
      <span className="text-bmw-silver text-xs">
        MCP Connected
        {server.dbConnected && <span className="text-emerald-400 ml-1">· DB</span>}
      </span>
    </div>
  );
}

function OfflineState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6">
        <span className="text-2xl">⚡</span>
      </div>
      <h2 className="text-bmw-light text-xl font-bold mb-2">Server Not Running</h2>
      <p className="text-bmw-silver mb-6 max-w-md text-sm">
        The BMW AI server is offline. Start it to access vehicle search, dealer locator, and test drive booking.
      </p>
      <div className="bmw-card p-4 text-left max-w-sm w-full space-y-3">
        <div>
          <p className="text-bmw-silver text-xs uppercase tracking-widest mb-1">Start both servers</p>
          <code className="text-bmw-blue text-sm">npm run dev</code>
        </div>
        <div className="border-t border-bmw-border pt-3">
          <p className="text-bmw-silver text-xs uppercase tracking-widest mb-1">PostgreSQL (optional)</p>
          <code className="text-bmw-silver text-xs block">DATABASE_URL=postgresql://...</code>
          <code className="text-bmw-silver text-xs block">npm run db:push --workspace=server</code>
          <code className="text-bmw-silver text-xs block">npm run db:seed --workspace=server</code>
        </div>
      </div>
    </div>
  );
}

function BmwLogo() {
  return (
    <div className="w-9 h-9 rounded-full border-2 border-bmw-blue flex items-center justify-center bg-bmw-black flex-shrink-0">
      <svg viewBox="0 0 40 40" className="w-7 h-7">
        <circle cx="20" cy="20" r="19" fill="#1C69D4" />
        <circle cx="20" cy="20" r="14" fill="none" stroke="#fff" strokeWidth="1" />
        <path d="M20,6 A14,14 0 0,1 34,20 L20,20 Z" fill="#fff" />
        <path d="M6,20 A14,14 0 0,1 20,6 L20,20 Z" fill="#1C69D4" />
        <path d="M20,34 A14,14 0 0,1 6,20 L20,20 Z" fill="#fff" />
        <path d="M34,20 A14,14 0 0,1 20,34 L20,20 Z" fill="#1C69D4" />
        <circle cx="20" cy="20" r="14" fill="none" stroke="#fff" strokeWidth="1" />
      </svg>
    </div>
  );
}
