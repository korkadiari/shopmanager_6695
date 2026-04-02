'use client';
import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';
import { useChat } from '@/lib/hooks/useChat';
import { toast } from 'sonner';
import { Brain, TrendingUp, AlertTriangle, Package, Sparkles, ChevronRight, BarChart2, ShoppingBag, ArrowUpRight, ArrowDownRight, Minus, Loader2, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AIInsight {
  type: 'trend' | 'prediction' | 'anomaly' | 'stock';
  title: string;
  summary: string;
  details: string[];
  severity?: 'info' | 'warning' | 'success';
}

const SALES_DATA = [
  { day: 'Lun', ventes: 1850000, objectif: 2000000 },
  { day: 'Mar', ventes: 2340000, objectif: 2000000 },
  { day: 'Mer', ventes: 1620000, objectif: 2000000 },
  { day: 'Jeu', ventes: 2890000, objectif: 2000000 },
  { day: 'Ven', ventes: 3150000, objectif: 2000000 },
  { day: 'Sam', ventes: 4200000, objectif: 2000000 },
  { day: 'Dim', ventes: 980000, objectif: 2000000 },
];

const TOP_PRODUCTS = [
  { name: 'Riz 25kg', sales: 145, revenue: 14500000, trend: 'up' },
  { name: 'Huile 5L', sales: 98, revenue: 9800000, trend: 'up' },
  { name: 'Sucre 50kg', sales: 76, revenue: 7600000, trend: 'down' },
  { name: 'Farine 25kg', sales: 64, revenue: 6400000, trend: 'up' },
  { name: 'Lait en poudre', sales: 52, revenue: 5200000, trend: 'stable' },
];

const STOCK_DATA = [
  { product: 'Riz 25kg', current: 45, recommended: 80, status: 'low' },
  { product: 'Huile 5L', current: 120, recommended: 100, status: 'ok' },
  { product: 'Sucre 50kg', current: 8, recommended: 50, status: 'critical' },
  { product: 'Farine 25kg', current: 35, recommended: 60, status: 'low' },
  { product: 'Lait en poudre', current: 200, recommended: 80, status: 'excess' },
];

const SYSTEM_PROMPT = `Tu es un assistant IA spécialisé en analyse commerciale pour ShopManager Guinée, une application de gestion de boutique.
Tu analyses des données de ventes en GNF (Franc Guinéen) et fournis des insights actionnables.
Réponds toujours en français, de manière concise et structurée.
Format de réponse: JSON avec les champs: trends (tableau d'insights sur les tendances), predictions (top produits prédits), anomalies (anomalies détectées), stockRecommendations (recommandations de stock).
Chaque insight doit avoir: title (string), summary (string court), details (tableau de 2-3 points), severity (info|warning|success).`;

const ANALYSIS_PROMPT = `Analyse ces données de ventes de la semaine pour une boutique à Conakry, Guinée:

Ventes journalières (GNF):
- Lundi: 1,850,000 GNF
- Mardi: 2,340,000 GNF  
- Mercredi: 1,620,000 GNF
- Jeudi: 2,890,000 GNF
- Vendredi: 3,150,000 GNF
- Samedi: 4,200,000 GNF
- Dimanche: 980,000 GNF

Top produits vendus: Riz 25kg (145 unités), Huile 5L (98 unités), Sucre 50kg (76 unités, -15% vs semaine dernière), Farine 25kg (64 unités), Lait en poudre (52 unités)

Niveaux de stock critiques: Sucre 50kg (8 unités restantes, seuil: 50), Riz 25kg (45 unités, seuil: 80), Farine 25kg (35 unités, seuil: 60)

Fournis une analyse JSON avec:
1. trends: 2 insights sur les tendances de ventes
2. predictions: 2 prédictions sur les meilleurs produits à commander
3. anomalies: 1-2 anomalies détectées (ex: baisse dimanche, pic samedi)
4. stockRecommendations: 2-3 recommandations de réapprovisionnement urgentes

Réponds UNIQUEMENT avec le JSON, sans texte supplémentaire.`;

function formatGNF(amount: number): string {
  return new Intl.NumberFormat('fr-GN', { style: 'currency', currency: 'GNF', maximumFractionDigits: 0 }).format(amount);
}

const SEVERITY_STYLES = {
  info: { bg: 'bg-blue-50 border-blue-100', icon: 'text-blue-500', badge: 'bg-blue-100 text-blue-700' },
  warning: { bg: 'bg-amber-50 border-amber-100', icon: 'text-amber-500', badge: 'bg-amber-100 text-amber-700' },
  success: { bg: 'bg-green-50 border-green-100', icon: 'text-green-500', badge: 'bg-green-100 text-green-700' },
};

const SECTION_ICONS = {
  trend: TrendingUp,
  prediction: Sparkles,
  anomaly: AlertTriangle,
  stock: Package,
};

const SECTION_LABELS = {
  trend: 'Tendance',
  prediction: 'Prédiction',
  anomaly: 'Anomalie',
  stock: 'Stock',
};

// Retry with exponential backoff for rate limit errors
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, baseDelay = 2000): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      const isRateLimit = err?.message?.includes('429') || err?.message?.toLowerCase().includes('rate limit') || err?.statusCode === 429;
      if (isRateLimit && attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        toast.warning(`Limite de requêtes atteinte. Nouvelle tentative dans ${delay / 1000}s...`, { duration: delay });
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
  throw new Error('Max retries exceeded');
}

export default function AIDashboardPage() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const { response, isLoading, error, sendMessage } = useChat('OPEN_AI', 'gpt-4o-mini', false);

  useEffect(() => {
    if (error) {
      const msg = error.message || '';
      const isRateLimit = msg.includes('429') || msg.toLowerCase().includes('rate limit') || msg.toLowerCase().includes('quota');
      if (isRateLimit) {
        if (retryCount < 2) {
          const delay = 3000 * Math.pow(2, retryCount);
          setIsRetrying(true);
          toast.warning(`Limite OpenAI atteinte. Nouvelle tentative dans ${delay / 1000}s...`, { duration: delay });
          setTimeout(() => {
            setRetryCount(c => c + 1);
            setIsRetrying(false);
            sendMessage([
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: ANALYSIS_PROMPT },
            ], { max_completion_tokens: 1200 });
          }, delay);
        } else {
          toast.error('Limite de requêtes OpenAI dépassée', {
            description: 'Veuillez patienter quelques minutes avant de réessayer.',
            duration: 8000,
          });
          setRetryCount(0);
          setIsRetrying(false);
        }
      } else {
        toast.error('Erreur IA: ' + (msg || 'Erreur inconnue'));
      }
    }
  }, [error]);

  useEffect(() => {
    if (response && !isLoading) {
      try {
        const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const data = JSON.parse(cleaned);
        const allInsights: AIInsight[] = [
          ...(data.trends || []).map((i: AIInsight) => ({ ...i, type: 'trend' as const })),
          ...(data.predictions || []).map((i: AIInsight) => ({ ...i, type: 'prediction' as const })),
          ...(data.anomalies || []).map((i: AIInsight) => ({ ...i, type: 'anomaly' as const })),
          ...(data.stockRecommendations || []).map((i: AIInsight) => ({ ...i, type: 'stock' as const })),
        ];
        setInsights(allInsights);
        setHasAnalyzed(true);
        setRetryCount(0);
      } catch {
        toast.error('Erreur lors du parsing de la réponse IA');
      }
    }
  }, [response, isLoading]);

  const handleAnalyze = () => {
    setRetryCount(0);
    setIsRetrying(false);
    sendMessage([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: ANALYSIS_PROMPT },
    ], { max_completion_tokens: 1200 });
  };

  const trendInsights = insights.filter(i => i.type === 'trend');
  const predictionInsights = insights.filter(i => i.type === 'prediction');
  const anomalyInsights = insights.filter(i => i.type === 'anomaly');
  const stockInsights = insights.filter(i => i.type === 'stock');

  const isAnalyzing = isLoading || isRetrying;

  return (
    <AppLayout>
      <Topbar title="Tableau de bord IA" subtitle="Analyse intelligente des ventes avec OpenAI" />
      <div className="px-4 lg:px-6 xl:px-8 py-6 max-w-screen-2xl mx-auto space-y-6">

        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Brain size={24} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Analyse IA des ventes</h2>
              <p className="text-slate-400 text-sm">Propulsé par OpenAI GPT-4o Mini — Données de la semaine en cours</p>
            </div>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-amber-500/20"
          >
            {isAnalyzing ? (
              <><Loader2 size={16} className="animate-spin" />{isRetrying ? 'Nouvelle tentative...' : 'Analyse en cours...'}</>
            ) : (
              <><Sparkles size={16} />{hasAnalyzed ? 'Réanalyser' : 'Lancer l\'analyse IA'}</>
            )}
          </button>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Sales Chart */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800">Ventes vs Objectif</h3>
                <p className="text-xs text-slate-400">7 derniers jours</p>
              </div>
              <BarChart2 size={18} className="text-slate-400" />
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={SALES_DATA} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(v: number) => formatGNF(v)} labelStyle={{ fontWeight: 600 }} />
                <Bar dataKey="ventes" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Ventes" />
                <Bar dataKey="objectif" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="Objectif" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800">Top Produits</h3>
                <p className="text-xs text-slate-400">Par chiffre d'affaires</p>
              </div>
              <ShoppingBag size={18} className="text-slate-400" />
            </div>
            <div className="space-y-3">
              {TOP_PRODUCTS.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700 truncate">{p.name}</span>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        {p.trend === 'up' && <ArrowUpRight size={13} className="text-green-500" />}
                        {p.trend === 'down' && <ArrowDownRight size={13} className="text-red-500" />}
                        {p.trend === 'stable' && <Minus size={13} className="text-slate-400" />}
                        <span className="text-xs text-slate-500">{p.sales} ventes</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className="bg-amber-500 h-1.5 rounded-full transition-all" style={{ width: `${(p.sales / TOP_PRODUCTS[0].sales) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-600 shrink-0 w-20 text-right">{(p.revenue / 1000000).toFixed(1)}M GNF</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stock Levels */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800">Niveaux de stock</h3>
              <p className="text-xs text-slate-400">Stock actuel vs recommandé</p>
            </div>
            <Package size={18} className="text-slate-400" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {STOCK_DATA.map(s => {
              const pct = Math.min((s.current / s.recommended) * 100, 150);
              const statusConfig = {
                critical: { color: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-50 border-red-100', label: 'Critique' },
                low: { color: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', label: 'Bas' },
                ok: { color: 'bg-green-500', text: 'text-green-600', bg: 'bg-green-50 border-green-100', label: 'OK' },
                excess: { color: 'bg-blue-500', text: 'text-blue-600', bg: 'bg-blue-50 border-blue-100', label: 'Excès' },
              }[s.status] ?? { color: 'bg-slate-400', text: 'text-slate-600', bg: 'bg-slate-50 border-slate-100', label: 'N/A' };
              return (
                <div key={s.product} className={`rounded-xl border p-3 ${statusConfig.bg}`}>
                  <p className="text-xs font-semibold text-slate-700 mb-2 truncate">{s.product}</p>
                  <div className="flex items-end justify-between mb-2">
                    <span className={`text-xl font-bold ${statusConfig.text}`}>{s.current}</span>
                    <span className="text-xs text-slate-400">/ {s.recommended}</span>
                  </div>
                  <div className="w-full bg-white/60 rounded-full h-2 mb-2">
                    <div className={`${statusConfig.color} h-2 rounded-full transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                  <span className={`text-xs font-medium ${statusConfig.text}`}>{statusConfig.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Insights */}
        {!hasAnalyzed && !isAnalyzing && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-4">
              <Brain size={28} className="text-amber-500" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-2">Prêt pour l'analyse IA</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">Cliquez sur "Lancer l'analyse IA" pour obtenir des insights sur les tendances de ventes, prédictions de produits, anomalies et recommandations de stock.</p>
            <button onClick={handleAnalyze} className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold text-sm transition-colors">
              <Sparkles size={16} />Lancer l'analyse IA
            </button>
          </div>
        )}

        {isAnalyzing && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
            <Loader2 size={32} className="animate-spin text-amber-500 mx-auto mb-4" />
            <p className="font-semibold text-slate-700">{isRetrying ? 'Nouvelle tentative en cours...' : 'Analyse en cours...'}</p>
            <p className="text-sm text-slate-400 mt-1">OpenAI analyse vos données de ventes</p>
            {isRetrying && (
              <p className="text-xs text-amber-600 mt-2 font-medium">Limite de taux dépassée — réessai automatique</p>
            )}
          </div>
        )}

        {hasAnalyzed && !isAnalyzing && insights.length > 0 && (
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-500" />
              <h3 className="font-bold text-slate-800">Insights IA — {insights.length} analyses générées</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Trends */}
              {trendInsights.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-600 flex items-center gap-2"><TrendingUp size={15} className="text-blue-500" />Tendances de ventes</h4>
                  {trendInsights.map((insight, i) => {
                    const sev = insight.severity ?? 'info';
                    const style = SEVERITY_STYLES[sev];
                    return (
                      <div key={i} className={`rounded-xl border p-4 ${style.bg}`}>
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold text-slate-800 text-sm">{insight.title}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.badge}`}>{sev === 'info' ? 'Info' : sev === 'warning' ? 'Attention' : 'Positif'}</span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{insight.summary}</p>
                        <ul className="space-y-1">
                          {insight.details?.map((d, j) => (
                            <li key={j} className="flex items-start gap-1.5 text-xs text-slate-500">
                              <ChevronRight size={12} className={`mt-0.5 shrink-0 ${style.icon}`} />{d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Predictions */}
              {predictionInsights.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-600 flex items-center gap-2"><Sparkles size={15} className="text-purple-500" />Prédictions produits</h4>
                  {predictionInsights.map((insight, i) => {
                    const sev = insight.severity ?? 'success';
                    const style = SEVERITY_STYLES[sev];
                    return (
                      <div key={i} className={`rounded-xl border p-4 ${style.bg}`}>
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold text-slate-800 text-sm">{insight.title}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.badge}`}>Prédiction</span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{insight.summary}</p>
                        <ul className="space-y-1">
                          {insight.details?.map((d, j) => (
                            <li key={j} className="flex items-start gap-1.5 text-xs text-slate-500">
                              <ChevronRight size={12} className={`mt-0.5 shrink-0 ${style.icon}`} />{d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Anomalies */}
              {anomalyInsights.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-600 flex items-center gap-2"><AlertTriangle size={15} className="text-amber-500" />Anomalies détectées</h4>
                  {anomalyInsights.map((insight, i) => {
                    const sev = insight.severity ?? 'warning';
                    const style = SEVERITY_STYLES[sev];
                    return (
                      <div key={i} className={`rounded-xl border p-4 ${style.bg}`}>
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold text-slate-800 text-sm">{insight.title}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.badge}`}>Anomalie</span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{insight.summary}</p>
                        <ul className="space-y-1">
                          {insight.details?.map((d, j) => (
                            <li key={j} className="flex items-start gap-1.5 text-xs text-slate-500">
                              <ChevronRight size={12} className={`mt-0.5 shrink-0 ${style.icon}`} />{d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Stock Recommendations */}
              {stockInsights.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-600 flex items-center gap-2"><Package size={15} className="text-red-500" />Recommandations stock</h4>
                  {stockInsights.map((insight, i) => {
                    const sev = insight.severity ?? 'warning';
                    const style = SEVERITY_STYLES[sev];
                    return (
                      <div key={i} className={`rounded-xl border p-4 ${style.bg}`}>
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold text-slate-800 text-sm">{insight.title}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.badge}`}>Stock</span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{insight.summary}</p>
                        <ul className="space-y-1">
                          {insight.details?.map((d, j) => (
                            <li key={j} className="flex items-start gap-1.5 text-xs text-slate-500">
                              <ChevronRight size={12} className={`mt-0.5 shrink-0 ${style.icon}`} />{d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
