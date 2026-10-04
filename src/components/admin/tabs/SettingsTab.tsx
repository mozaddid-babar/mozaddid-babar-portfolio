import React, { useState, useEffect } from 'react';
import { 
  KeyRound, 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  ShieldCheck, 
  Server, 
  Check, 
  AlertTriangle,
  Lock,
  Cloud,
  RefreshCw,
  Zap,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cpu
} from 'lucide-react';
import { PortfolioData, DatabaseStatus } from '../../../types';
import { 
  resetDatabaseAPI, 
  importDatabaseAPI, 
  getDatabaseStatusAPI, 
  reconnectDatabaseAPI 
} from '../../../api';

interface SettingsTabProps {
  data: PortfolioData;
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ data, onRefresh, showToast }) => {
  // Backup & Import state
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  // Cloud Database state
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [dbStatusLoading, setDbStatusLoading] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  const fetchDbStatus = async () => {
    try {
      setDbStatusLoading(true);
      const status = await getDatabaseStatusAPI();
      setDbStatus(status);
    } catch (err: any) {
      console.warn('Could not fetch DB status:', err.message);
    } finally {
      setDbStatusLoading(false);
    }
  };

  useEffect(() => {
    fetchDbStatus();
  }, []);

  const handleReconnect = async () => {
    try {
      setReconnecting(true);
      const res = await reconnectDatabaseAPI();
      setDbStatus(res.data);
      if (res.connected) {
        showToast('Successfully connected and synced with MongoDB Atlas!');
        onRefresh();
      } else {
        showToast(res.message || 'MongoDB connection failed', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Reconnect request failed', 'error');
    } finally {
      setReconnecting(false);
    }
  };

  const handleExportJSON = () => {
    try {
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(data, null, 2)
      )}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `portfolio_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Database backup downloaded successfully!');
    } catch (err: any) {
      showToast('Failed to export backup.', 'error');
    }
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      setImportLoading(true);
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = async (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          await importDatabaseAPI(parsed);
          showToast('Database restored successfully from backup!');
          fetchDbStatus();
          onRefresh();
        } catch (err: any) {
          showToast(`Import failed: ${err.message}`, 'error');
        } finally {
          setImportLoading(false);
        }
      };
    }
  };

  const handleResetDatabase = async () => {
    try {
      await resetDatabaseAPI();
      showToast('Database reset to original seed state.');
      setResetConfirmOpen(false);
      fetchDbStatus();
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Reset failed', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn" id="admin-settings-tab">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-brand-400" />
          <span>Security, Cloud Database & System Settings</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Serverless MongoDB Atlas persistence, environment authentication, and real-time data sync.
        </p>
      </div>

      {/* Cloud Database Persistence Banner / Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/95 via-slate-850 to-slate-900 border border-slate-700/80 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-700/70">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-bold text-white">MongoDB Atlas Cloud Database</h3>
                {dbStatus?.connected ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-semibold text-[11px] font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Live Cloud Connected
                  </span>
                ) : dbStatus?.hasUri ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 font-semibold text-[11px] font-mono">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    Connection Attention Needed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-700/70 border border-slate-600 text-slate-300 font-semibold text-[11px] font-mono">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    Local Storage Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Serverless persistence layer — updates made in this Admin Console are permanently saved across deployments.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReconnect}
              disabled={reconnecting}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-700 hover:bg-slate-650 active:bg-slate-600 border border-slate-600 transition-colors disabled:opacity-50"
              title="Test or Reconnect to MongoDB Atlas"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${reconnecting ? 'animate-spin' : ''}`} />
              <span>{reconnecting ? 'Testing...' : 'Test Connection'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowSetupGuide(!showSetupGuide)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-750 border border-slate-700 transition-colors"
            >
              <span>Setup Guide</span>
              {showSetupGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Status Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Read Latency
              </span>
              <span className="text-emerald-400 font-bold font-mono text-[11px]">0ms (Instant)</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Served from in-memory cache with zero roundtrip delay.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-brand-400" />
                Cluster & Database
              </span>
              <span className="text-slate-200 font-mono text-[11px]">
                {dbStatus?.dbName || 'portfolio'} / {dbStatus?.collection || 'portfolio_data'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Single document JSON persistence with automatic backup.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Auto-Seeding
              </span>
              <span className="text-emerald-400 font-bold text-[11px]">Active</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Empty clusters are automatically populated with current data.
            </p>
          </div>
        </div>

        {/* Error Notice if URI is set but connection fails */}
        {dbStatus?.error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-semibold text-red-200">MongoDB Atlas Connection Error</div>
              <div className="text-[11px] font-mono text-red-300/90 break-all">{dbStatus.error}</div>
              <div className="text-[11px] text-slate-400 pt-1">
                Tip: In MongoDB Atlas Network Access, ensure IP <code className="text-amber-300">0.0.0.0/0</code> (Allow Access from Anywhere) is whitelisted so cloud serverless instances can connect.
              </div>
            </div>
          </div>
        )}

        {/* Collapsible Setup Guide */}
        {showSetupGuide && (
          <div className="mt-5 pt-5 border-t border-slate-700/70 space-y-3.5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span>3-Minute Free MongoDB Atlas Setup Guide</span>
              </h4>
              <a 
                href="https://cloud.mongodb.com" 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
              >
                <span>MongoDB Atlas Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-700/60">
              <li>
                <span className="font-semibold text-white">Create a free cluster:</span> Sign up at <a href="https://cloud.mongodb.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline">cloud.mongodb.com</a> and choose the <strong className="text-emerald-300">M0 Free Tier</strong> (100% free forever).
              </li>
              <li>
                <span className="font-semibold text-white">Create a Database User:</span> Under <em>Security &gt; Database Access</em>, add a username and password (e.g., <code className="text-slate-200">portfolio_admin</code>).
              </li>
              <li>
                <span className="font-semibold text-white">Allow Network Access:</span> Under <em>Security &gt; Network Access</em>, click <strong className="text-white">Add IP Address</strong> and select <strong className="text-emerald-300">Allow Access from Anywhere (0.0.0.0/0)</strong> so your serverless deployment can read &amp; write.
              </li>
              <li>
                <span className="font-semibold text-white">Get Connection String:</span> Click <strong className="text-white">Connect &gt; Drivers &gt; Node.js</strong>, copy the string (e.g. <code className="text-slate-200 text-[11px]">mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority</code>).
              </li>
              <li>
                <span className="font-semibold text-white">Paste into Environment:</span> Add <code className="text-emerald-300">MONGODB_URI=&quot;your_connection_string&quot;</code> to your local <code className="text-white">.env.local</code> and to your deployment platform's Environment Variables (Netlify/Vercel/Render).
              </li>
            </ol>
          </div>
        )}
      </div>

      {/* Grid: Credentials + Database Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Environment Administrative Security */}
        <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Administrative Security</h3>
                <p className="text-xs text-slate-400">Environment variable authentication (.env)</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-700/60 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">Authentication Mode</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-[11px] font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Environment Variables
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-800">
                  <span className="text-slate-400 font-mono">Managed Keys</span>
                  <span className="text-slate-200 font-mono text-[11px]">ADMIN_USERNAME & ADMIN_PASSWORD</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/20 text-xs text-slate-300 leading-relaxed space-y-1.5">
                <div className="font-semibold text-blue-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Direct Editing Disabled</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  For server security best practices, admin credentials cannot be edited or exposed through the browser interface. Credentials are managed directly via server environment variables in your <code className="px-1.5 py-0.5 rounded bg-slate-800 text-blue-300 font-mono">.env.local</code> file.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-700/60 text-[11px] text-slate-500 flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-slate-400" />
            <span>Protected by server-side authentication</span>
          </div>
        </div>

        {/* Card 2: Database Backup & Restore */}
        <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Database Snapshots & Sync</h3>
                <p className="text-xs text-slate-400">Download or upload JSON database files</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              All portfolio content (publications, projects, bio narrative, timeline, and messages) is stored persistently. You can export a snapshot backup at any time.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleExportJSON}
                className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-700 hover:bg-slate-600 transition-colors"
                id="export-db-btn"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Export JSON Backup</span>
              </button>

              <label className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-700 hover:bg-slate-600 transition-colors cursor-pointer">
                <Upload className="w-4 h-4 text-blue-400" />
                <span>{importLoading ? 'Importing...' : 'Restore from JSON'}</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Reset Database Button */}
          <div className="pt-4 border-t border-slate-700 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              <span className="text-slate-300 font-semibold">Factory Reset:</span> Re-seed default demo data.
            </div>
            <button
              type="button"
              onClick={() => setResetConfirmOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-950/60 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Database</span>
            </button>
          </div>
        </div>

      </div>

      {/* Reset Confirmation Modal */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-4">
            <div className="flex items-center space-x-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Reset Portfolio Database?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will overwrite all custom publications, timeline items, and messages with the initial template for Md. Rashedul Islam.
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleResetDatabase}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-xl"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

