"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  getSocialConnections,
  connectSocialProvider,
  disconnectSocialProvider,
} from "@/lib/connections";
import { SocialConnectionStatusItem } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  Instagram,
  Linkedin,
  Twitter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Link2,
  Unlink,
  ExternalLink,
  ShieldCheck,
  Code2,
  Copy,
  Check,
  Info,
} from "lucide-react";

function ConnectionsContent() {
  const { workspace } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();


  const [connections, setConnections] = useState<SocialConnectionStatusItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Config Modal state
  const [configModalProvider, setConfigModalProvider] = useState<SocialConnectionStatusItem | null>(null);
  const [copiedEnv, setCopiedEnv] = useState<boolean>(false);

  const fetchConnections = async () => {
    if (!workspace) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await getSocialConnections(workspace.id);
      setConnections(data.connections);
    } catch (err: any) {
      console.error("Failed to load connections:", err);
      setErrorMsg(err.response?.data?.detail?.message || err.response?.data?.detail || "Failed to load social connections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [workspace?.id]);

  // Handle OAuth callback redirect parameters
  useEffect(() => {
    const statusParam = searchParams.get("status");
    const providerParam = searchParams.get("provider");
    const messageParam = searchParams.get("message");

    if (statusParam === "success" && providerParam) {
      const formattedProvider = providerParam.charAt(0).toUpperCase() + providerParam.slice(1);
      setSuccessMsg(`Successfully connected your ${formattedProvider} account!`);
      // Clean query params
      router.replace("/connections");
      fetchConnections();
    } else if (statusParam === "error") {
      setErrorMsg(messageParam || "OAuth connection failed. Please try again.");
      router.replace("/connections");
    }
  }, [searchParams]);

  const handleConnect = async (item: SocialConnectionStatusItem) => {
    if (!workspace) return;

    if (!item.is_configured) {
      setConfigModalProvider(item);
      return;
    }

    setActionLoading(item.provider);
    setErrorMsg(null);
    try {
      const res = await connectSocialProvider(item.provider, workspace.id);
      if (res.authorization_url) {
        window.location.href = res.authorization_url;
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === "object" && detail?.is_configured === false) {
        setConfigModalProvider({
          ...item,
          is_configured: false,
          required_env_vars: detail.required_env_vars || item.required_env_vars,
        });
      } else {
        setErrorMsg(typeof detail === "string" ? detail : detail?.message || "Failed to initiate OAuth flow.");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisconnect = async (provider: string) => {
    if (!workspace) return;

    const formattedProvider = provider.charAt(0).toUpperCase() + provider.slice(1);
    if (!confirm(`Are you sure you want to disconnect your ${formattedProvider} account from workspace "${workspace.name}"?`)) {
      return;
    }

    setActionLoading(provider);
    setErrorMsg(null);
    try {
      await disconnectSocialProvider(provider, workspace.id);
      setSuccessMsg(`Disconnected ${formattedProvider} account.`);
      await fetchConnections();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || `Failed to disconnect ${formattedProvider}`);
    } finally {
      setActionLoading(null);
    }
  };

  const getProviderConfig = (provider: string) => {
    switch (provider.toLowerCase()) {
      case "instagram":
        return {
          name: "Instagram",
          icon: Instagram,
          bgColor: "from-purple-900/20 via-pink-900/20 to-orange-900/20",
          borderColor: "hover:border-pink-500/50",
          badgeColor: "bg-pink-500/10 text-pink-400 border-pink-500/20",
          iconBg: "bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600",
          description: "Connect Instagram Professional account for automated social media integration.",
        };
      case "linkedin":
        return {
          name: "LinkedIn",
          icon: Linkedin,
          bgColor: "from-blue-950/30 to-sky-900/10",
          borderColor: "hover:border-blue-500/50",
          badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
          iconBg: "bg-[#0A66C2]",
          description: "Connect LinkedIn Member profile or Company page for professional automation.",
        };
      case "x":
      case "twitter":
        return {
          name: "X (Twitter)",
          icon: Twitter,
          bgColor: "from-neutral-900/50 to-neutral-950/50",
          borderColor: "hover:border-neutral-500/50",
          badgeColor: "bg-neutral-500/10 text-neutral-300 border-neutral-500/20",
          iconBg: "bg-neutral-800",
          description: "Connect X/Twitter account to publish updates and manage your brand presence.",
        };
      default:
        return {
          name: provider,
          icon: Link2,
          bgColor: "from-neutral-900 to-neutral-950",
          borderColor: "hover:border-neutral-700",
          badgeColor: "bg-neutral-800 text-neutral-400",
          iconBg: "bg-neutral-800",
          description: "Social media platform connection.",
        };
    }
  };

  const copyEnvSnippet = (vars: string[]) => {
    const text = vars.map((v) => `${v}=your_${v.toLowerCase()}_here`).join("\n") + "\nOAUTH_REDIRECT_BASE_URL=http://localhost:8000/api/v1/social-connections";
    navigator.clipboard.writeText(text);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white">
              <Link2 className="w-5 h-5 text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Social Connections</h1>
            <Badge variant="green" className="text-xs">
              Stage 3 OAuth Architecture
            </Badge>
          </div>
          <p className="text-sm text-neutral-400">
            Connect and manage social media accounts for workspace{" "}
            <span className="font-semibold text-white">{workspace?.name || "Active Workspace"}</span>.
          </p>
        </div>

        <button
          onClick={fetchConnections}
          disabled={loading}
          className="self-start md:self-auto flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-neutral-300 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-400" : ""}`} />
          <span>Refresh Connections</span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-center justify-between text-sm text-emerald-300">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white text-xs">
            Dismiss
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-center justify-between text-sm text-rose-300">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Architecture Notice Banner */}
      <div className="p-4 rounded-xl bg-[#0d0d0d] border border-neutral-800 flex items-start space-x-3.5 text-xs text-neutral-400">
        <ShieldCheck className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-neutral-200 text-sm">Enterprise Token Security Boundary</p>
          <p className="leading-relaxed">
            All OAuth access and refresh tokens are encrypted using AES-256 Fernet cryptography before database persistence.
            Tokens are strictly isolated per workspace and are never exposed to the frontend.
          </p>
        </div>
      </div>

      {/* Platform Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-neutral-900/40 border border-neutral-800/60 animate-pulse p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-neutral-800" />
              <div className="h-4 bg-neutral-800 rounded w-1/2" />
              <div className="h-3 bg-neutral-800/60 rounded w-3/4" />
              <div className="h-10 bg-neutral-800 rounded mt-auto" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {connections.map((item) => {
            const config = getProviderConfig(item.provider);
            const Icon = config.icon;
            const isConnected = item.is_connected;
            const conn = item.connection;
            const isLoadingAction = actionLoading === item.provider;

            return (
              <div
                key={item.provider}
                className={`group relative rounded-2xl bg-gradient-to-b ${config.bgColor} border border-neutral-800 ${config.borderColor} transition-all duration-300 flex flex-col justify-between p-6 overflow-hidden shadow-lg`}
              >
                {/* Status Header */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl ${config.iconBg} text-white shadow-md`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    {isConnected ? (
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Connected</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-800 text-neutral-400 border border-neutral-700">
                        <XCircle className="w-3 h-3 text-neutral-500" />
                        <span>Not Connected</span>
                      </span>
                    )}
                  </div>

                  {/* Provider Info */}
                  <div>
                    <h3 className="text-lg font-bold text-white">{config.name}</h3>
                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{config.description}</p>
                  </div>

                  {/* Connected Account Details */}
                  {isConnected && conn && (
                    <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800/80 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase text-neutral-500 tracking-wider">Account</span>
                        <Badge variant="cyan" className="text-[10px] py-0 px-1.5">
                          Active
                        </Badge>
                      </div>

                      <p className="text-sm font-semibold text-white truncate">{conn.account_name || "Connected Account"}</p>
                      {conn.username && <p className="text-xs text-neutral-400 truncate font-mono">{conn.username}</p>}
                      {conn.updated_at && (
                        <p className="text-[10px] text-neutral-500 pt-1">
                          Connected {new Date(conn.updated_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}

                  {!item.is_configured && !isConnected && (
                    <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 flex items-center justify-between text-xs text-amber-300">
                      <div className="flex items-center space-x-2">
                        <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <span>OAuth config required</span>
                      </div>
                      <button
                        onClick={() => setConfigModalProvider(item)}
                        className="text-[11px] underline font-medium text-amber-200 hover:text-white"
                      >
                        Setup Guide
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="pt-6 border-t border-neutral-800/60 mt-6 flex items-center space-x-3">
                  {isConnected ? (
                    <>
                      <button
                        onClick={() => handleConnect(item)}
                        disabled={isLoadingAction}
                        className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white border border-neutral-700 transition disabled:opacity-50"
                      >
                        {isLoadingAction ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3.5 h-3.5" />
                        )}
                        <span>Reconnect</span>
                      </button>
                      <button
                        onClick={() => handleDisconnect(item.provider)}
                        disabled={isLoadingAction}
                        className="flex items-center justify-center p-2 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 text-rose-400 border border-rose-900/40 transition disabled:opacity-50"
                        title={`Disconnect ${config.name}`}
                      >
                        <Unlink className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleConnect(item)}
                      disabled={isLoadingAction}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition shadow-md disabled:opacity-50"
                    >
                      {isLoadingAction ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-black" />
                      ) : (
                        <ExternalLink className="w-4 h-4 text-black" />
                      )}
                      <span>Connect {config.name}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* OAuth Configuration Requirements Modal */}
      {configModalProvider && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full rounded-2xl bg-[#0f0f0f] border border-neutral-800 p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center space-x-2.5">
                <Code2 className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">
                  {configModalProvider.provider.toUpperCase()} OAuth Configuration
                </h3>
              </div>
              <button
                onClick={() => setConfigModalProvider(null)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-neutral-300">
              <p className="leading-relaxed">
                To enable live OAuth authentication for{" "}
                <span className="font-semibold text-white">{configModalProvider.provider.toUpperCase()}</span>, add the following environment variables to your backend <code className="text-indigo-300">.env</code> file:
              </p>

              {/* Env Code Box */}
              <div className="relative rounded-xl bg-black border border-neutral-800 p-4 font-mono text-neutral-300 space-y-1">
                <button
                  onClick={() => copyEnvSnippet(configModalProvider.required_env_vars)}
                  className="absolute top-2.5 right-2.5 flex items-center space-x-1 px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] text-neutral-200 transition"
                >
                  {copiedEnv ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedEnv ? "Copied!" : "Copy"}</span>
                </button>
                {configModalProvider.required_env_vars.map((v) => (
                  <div key={v} className="text-emerald-400">
                    {v}=<span className="text-neutral-400">your_client_credentials_here</span>
                  </div>
                ))}
                <div className="text-indigo-400 pt-1">
                  OAUTH_REDIRECT_BASE_URL=<span className="text-neutral-400">http://localhost:8000/api/v1/social-connections</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                <span className="font-semibold text-white">Authorized Callback URL:</span>
                <p className="font-mono text-neutral-400 break-all">
                  http://localhost:8000/api/v1/social-connections/{configModalProvider.provider}/callback
                </p>
              </div>

              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-indigo-200 space-y-1">
                <span className="font-semibold">Architecture Ready:</span>
                <p>
                  Once client credentials are provided in backend <code className="text-white">.env</code>, restarting the backend automatically activates live OAuth flow.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setConfigModalProvider(null)}
                className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-neutral-200 transition"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ConnectionsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto space-y-8 p-6">
          <div className="h-12 bg-neutral-900/60 rounded-xl animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-neutral-900/40 border border-neutral-800 animate-pulse" />
            ))}
          </div>
        </div>
      }
    >
      <ConnectionsContent />
    </Suspense>
  );
}

