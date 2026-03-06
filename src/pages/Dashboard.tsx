import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ArrowLeft, BarChart3, PieChart, TrendingUp, AlertTriangle } from "lucide-react";

interface FabricStat {
  fabric: string;
  total: number;
  corrected: number;
  high: number;
  medium: number;
  low: number;
  nullConf: number;
}

interface CorrectionItem {
  original_fabric: string;
  corrected_fabric: string;
  original_category: string | null;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<FabricStat[]>([]);
  const [corrections, setCorrections] = useState<CorrectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalAnalyses, setTotalAnalyses] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    // Fetch all history for stats
    const { data: historyData, count } = await supabase
      .from("analysis_history")
      .select("fabric_name_en, fabric_confidence", { count: "exact" });

    // Fetch all corrections
    const { data: corrData } = await supabase
      .from("fabric_corrections")
      .select("original_fabric, corrected_fabric, original_category, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    setTotalAnalyses(count || 0);
    setCorrections((corrData as CorrectionItem[]) || []);

    // Build fabric stats
    const fabricMap = new Map<string, FabricStat>();
    const correctionCounts = new Map<string, number>();

    (corrData || []).forEach((c: any) => {
      const key = c.original_fabric || "Unknown";
      correctionCounts.set(key, (correctionCounts.get(key) || 0) + 1);
    });

    (historyData || []).forEach((h: any) => {
      const fabric = h.fabric_name_en || "Unknown";
      if (!fabricMap.has(fabric)) {
        fabricMap.set(fabric, { fabric, total: 0, corrected: 0, high: 0, medium: 0, low: 0, nullConf: 0 });
      }
      const stat = fabricMap.get(fabric)!;
      stat.total++;
      const conf = (h.fabric_confidence || "").toLowerCase();
      if (conf === "high") stat.high++;
      else if (conf === "medium") stat.medium++;
      else if (conf === "low") stat.low++;
      else stat.nullConf++;
    });

    correctionCounts.forEach((count, fabric) => {
      if (fabricMap.has(fabric)) {
        fabricMap.get(fabric)!.corrected = count;
      }
    });

    const sorted = Array.from(fabricMap.values()).sort((a, b) => b.total - a.total);
    setStats(sorted);
    setLoading(false);
  };

  const summary = useMemo(() => {
    const totalCorrections = corrections.length;
    const correctionRate = totalAnalyses > 0 ? ((totalCorrections / totalAnalyses) * 100).toFixed(1) : "0";
    const topCorrected = stats
      .filter((s) => s.corrected > 0)
      .sort((a, b) => (b.corrected / b.total) - (a.corrected / a.total))
      .slice(0, 3);

    const confBreakdown = stats.reduce(
      (acc, s) => ({ high: acc.high + s.high, medium: acc.medium + s.medium, low: acc.low + s.low, nullConf: acc.nullConf + s.nullConf }),
      { high: 0, medium: 0, low: 0, nullConf: 0 }
    );

    return { totalCorrections, correctionRate, topCorrected, confBreakdown };
  }, [stats, corrections, totalAnalyses]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-hero text-primary-foreground py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-1.5 text-primary-foreground/60 hover:text-primary-foreground text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <h1 className="text-3xl md:text-4xl font-display font-bold">
            <span className="gold-shimmer bg-clip-text text-transparent">Fabric Accuracy</span> Dashboard
          </h1>
          <p className="text-primary-foreground/60 text-sm mt-2">Predicted fabric distribution, confidence breakdown, and correction rates.</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SummaryCard icon={BarChart3} label="Total Analyses" value={totalAnalyses.toString()} />
          <SummaryCard icon={PieChart} label="Unique Fabrics" value={stats.length.toString()} />
          <SummaryCard icon={AlertTriangle} label="Corrections" value={summary.totalCorrections.toString()} />
          <SummaryCard icon={TrendingUp} label="Correction Rate" value={`${summary.correctionRate}%`} />
        </div>

        {/* Confidence Breakdown */}
        <section className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-base font-display font-semibold text-foreground mb-4">Confidence Breakdown</h2>
          <div className="flex gap-2 flex-wrap">
            <ConfBadge label="High" count={summary.confBreakdown.high} total={totalAnalyses} color="bg-green-100 text-green-800 border-green-300" />
            <ConfBadge label="Medium" count={summary.confBreakdown.medium} total={totalAnalyses} color="bg-yellow-100 text-yellow-800 border-yellow-300" />
            <ConfBadge label="Low" count={summary.confBreakdown.low} total={totalAnalyses} color="bg-red-100 text-red-800 border-red-300" />
            {summary.confBreakdown.nullConf > 0 && (
              <ConfBadge label="N/A" count={summary.confBreakdown.nullConf} total={totalAnalyses} color="bg-muted text-muted-foreground border-border" />
            )}
          </div>
          {totalAnalyses > 0 && (
            <div className="mt-3 h-3 rounded-full bg-muted overflow-hidden flex">
              <div className="bg-green-500 transition-all" style={{ width: `${(summary.confBreakdown.high / totalAnalyses) * 100}%` }} />
              <div className="bg-yellow-400 transition-all" style={{ width: `${(summary.confBreakdown.medium / totalAnalyses) * 100}%` }} />
              <div className="bg-red-400 transition-all" style={{ width: `${(summary.confBreakdown.low / totalAnalyses) * 100}%` }} />
              <div className="bg-muted-foreground/20 transition-all" style={{ width: `${(summary.confBreakdown.nullConf / totalAnalyses) * 100}%` }} />
            </div>
          )}
        </section>

        {/* Fabric Distribution Table */}
        <section className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-base font-display font-semibold text-foreground">Fabric Distribution</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-2.5">Fabric</th>
                  <th className="text-center px-3 py-2.5">Count</th>
                  <th className="text-center px-3 py-2.5">%</th>
                  <th className="text-center px-3 py-2.5">🟢</th>
                  <th className="text-center px-3 py-2.5">🟡</th>
                  <th className="text-center px-3 py-2.5">🔴</th>
                  <th className="text-center px-3 py-2.5">Corrections</th>
                  <th className="text-center px-3 py-2.5">Error %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.map((s) => {
                  const pct = totalAnalyses > 0 ? ((s.total / totalAnalyses) * 100).toFixed(1) : "0";
                  const errPct = s.total > 0 ? ((s.corrected / s.total) * 100).toFixed(0) : "0";
                  return (
                    <tr key={s.fabric} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-2.5 font-medium text-foreground">{s.fabric}</td>
                      <td className="text-center px-3 py-2.5">{s.total}</td>
                      <td className="text-center px-3 py-2.5 text-muted-foreground">{pct}%</td>
                      <td className="text-center px-3 py-2.5 text-green-600">{s.high || "-"}</td>
                      <td className="text-center px-3 py-2.5 text-yellow-600">{s.medium || "-"}</td>
                      <td className="text-center px-3 py-2.5 text-red-600">{s.low || "-"}</td>
                      <td className="text-center px-3 py-2.5">{s.corrected || "-"}</td>
                      <td className="text-center px-3 py-2.5">
                        {s.corrected > 0 ? (
                          <span className="text-xs font-semibold text-destructive">{errPct}%</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Most Corrected Fabrics */}
        {summary.topCorrected.length > 0 && (
          <section className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-base font-display font-semibold text-foreground mb-3">⚠️ Most Corrected Fabrics</h2>
            <div className="space-y-2">
              {summary.topCorrected.map((s) => (
                <div key={s.fabric} className="flex items-center justify-between bg-destructive/5 border border-destructive/20 rounded-lg px-4 py-2.5">
                  <span className="font-medium text-foreground">{s.fabric}</span>
                  <span className="text-xs text-destructive font-semibold">
                    {s.corrected} correction{s.corrected > 1 ? "s" : ""} / {s.total} total ({((s.corrected / s.total) * 100).toFixed(0)}%)
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent Corrections */}
        {corrections.length > 0 && (
          <section className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-base font-display font-semibold text-foreground">Recent Corrections</h2>
            </div>
            <div className="divide-y divide-border max-h-64 overflow-y-auto">
              {corrections.slice(0, 20).map((c, i) => (
                <div key={i} className="px-4 py-3 flex items-center gap-3 text-sm">
                  <span className="text-destructive line-through">{c.original_fabric}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-green-600 font-medium">{c.corrected_fabric}</span>
                  {c.original_category && (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full ml-auto">{c.original_category}</span>
                  )}
                  <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

const SummaryCard: React.FC<{ icon: React.ElementType; label: string; value: string }> = ({ icon: Icon, label, value }) => (
  <div className="bg-card border border-border rounded-xl p-4">
    <div className="flex items-center gap-2 mb-2">
      <Icon className="w-4 h-4 text-accent" />
      <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-2xl font-display font-bold text-foreground">{value}</p>
  </div>
);

const ConfBadge: React.FC<{ label: string; count: number; total: number; color: string }> = ({ label, count, total, color }) => (
  <span className={`text-xs font-medium px-3 py-1.5 rounded-full border ${color}`}>
    {label}: {count} ({total > 0 ? ((count / total) * 100).toFixed(0) : 0}%)
  </span>
);

export default Dashboard;
