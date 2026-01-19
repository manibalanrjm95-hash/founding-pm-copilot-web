import React, { useState, useEffect } from 'react';
import { useWorkflowStore } from '../../../store/useWorkflowStore';
import { BarChart3, AlertTriangle, TrendingUp, TrendingDown, Target, Play, Brain, XCircle, CheckCircle2 } from 'lucide-react';
import { api, AIResponse } from '../../../lib/api';

const VANITY_KEYWORDS = ['views', 'likes', 'followers', 'signups', 'downloads', 'visits', 'clicks'];

export const SuccessMetricsAgentForm: React.FC = () => {
    const { steps, selectedStepId, updateStep } = useWorkflowStore();
    const selectedStep = steps.find(s => s.id === selectedStepId);

    // Form State
    const [metric, setMetric] = useState('');
    const [measurement, setMeasurement] = useState('');
    const [timeframe, setTimeframe] = useState('');

    // AI State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [aiResult, setAiResult] = useState<AIResponse | null>(null);

    // Warnings
    const [warnings, setWarnings] = useState<string | null>(null);

    // Load Data
    useEffect(() => {
        if (selectedStep?.data) {
            setMetric(selectedStep.data.metric || '');
            setMeasurement(selectedStep.data.measurement || '');
            setTimeframe(selectedStep.data.timeframe || '');
            if (selectedStep.data.aiResult) {
                setAiResult(selectedStep.data.aiResult);
            }
        }
    }, [selectedStepId]);

    const saveData = (updates: any) => {
        if (selectedStepId) {
            const currentData = selectedStep?.data || {};
            updateStep(selectedStepId, { data: { ...currentData, ...updates } });
        }
    };

    const handleChangeMetric = (val: string) => {
        setMetric(val);
        saveData({ metric: val });

        // Vanity Check
        const lower = val.toLowerCase();
        const foundVanity = VANITY_KEYWORDS.find(k => lower.includes(k));
        if (foundVanity) {
            setWarnings(`Vanity Alert: '${foundVanity}' looks nice but pays no bills. Focus on value or revenue.`);
        } else {
            setWarnings(null);
        }
    };

    const runAgent = async () => {
        if (!selectedStepId) return;
        setLoading(true);
        setError(null);

        try {
            const result = await api.successMetrics({
                metric: metric,
                measurement: measurement,
                timeframe: timeframe
            });
            setAiResult(result);
            saveData({ aiResult: result });
        } catch (err: any) {
            setError(err.message || "Failed to run agent");
        } finally {
            setLoading(false);
        }
    };

    // Validation
    const isMissingInput = !metric.trim() || !measurement.trim() || !timeframe.trim();

    return (
        <div className="space-y-8 pb-10">
            {/* AGENT GOAL */}
            <div className="bg-[#1F2ADE]/10 p-4 rounded-lg border border-[#1F2ADE]/20">
                <h3 className="text-sm font-extrabold text-[#1F2ADE] mb-2 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#1F2ADE]" />
                    Agent Goal
                </h3>
                <p className="text-sm text-[#1F2ADE] leading-relaxed font-medium">
                    Define how success and failure will be measured. I will reject vanity metrics that feel good but mean nothing.
                </p>
            </div>

            {/* North Star Metric */}
            <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                    <Target className="w-3 h-3" />
                    One Metric That Matters (North Star)
                </label>
                <input
                    type="text"
                    value={metric}
                    onChange={(e) => handleChangeMetric(e.target.value)}
                    className="w-full p-2 bg-white border border-gray-200 shadow rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none"
                    placeholder="e.g. Weekly Active Workspaces (NOT Signups)"
                />
                {warnings && (
                    <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100">
                        <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                        <span>{warnings}</span>
                    </div>
                )}
            </div>

            {/* Measurement Method */}
            <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                    <TrendingUp className="w-3 h-3" />
                    How will you measure it?
                </label>
                <input
                    type="text"
                    value={measurement}
                    onChange={(e) => {
                        setMeasurement(e.target.value);
                        saveData({ measurement: e.target.value });
                    }}
                    className="w-full p-2 bg-white border border-gray-200 shadow rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none"
                    placeholder="e.g. Stripe API Event: Invoice Paid"
                />
            </div>

            {/* Timeframe */}
            <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                    <TrendingDown className="w-3 h-3" />
                    Review Cycle / Timeframe
                </label>
                <input
                    type="text"
                    value={timeframe}
                    onChange={(e) => {
                        setTimeframe(e.target.value);
                        saveData({ timeframe: e.target.value });
                    }}
                    className="w-full p-2 bg-white border border-gray-200 shadow rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none"
                    placeholder="e.g. Every Monday at 9AM"
                />
            </div>

            {/* ACTIONS */}
            <div className="pt-6 border-t border-gray-200 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        Metric Audit
                    </h3>
                </div>

                <button
                    onClick={runAgent}
                    disabled={loading || isMissingInput}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-black text-white hover:bg-gray-800 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Auditing Metrics...
                        </>
                    ) : (
                        <>
                            <Play className="w-4 h-4" />
                            Run Metric Agent
                        </>
                    )}
                </button>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs flex items-center gap-2 border border-red-100">
                        <XCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                {aiResult && (
                    <div className="space-y-4 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="bg-green-50 border border-green-100 p-4 rounded-lg">
                            <p className="text-sm text-green-900 font-semibold leading-relaxed">
                                {aiResult.summary}
                            </p>
                        </div>

                        {/* Risks */}
                        {aiResult.risks.length > 0 && (
                            <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r-lg">
                                <h4 className="text-xs font-bold text-amber-800 uppercase mb-2 flex items-center gap-2">
                                    <AlertTriangle className="w-3 h-3" />
                                    Metric Risks
                                </h4>
                                <ul className="space-y-1">
                                    {aiResult.risks.map((risk, i) => (
                                        <li key={i} className="text-xs text-amber-900 font-medium">
                                            • {risk}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Recommendations</h4>
                            <ul className="space-y-2">
                                {aiResult.recommendations.map((rec, i) => (
                                    <li key={i} className="text-xs bg-white border border-gray-200 p-2 rounded text-gray-600 shadow-sm">
                                        {rec}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            {/* STATUS CHECK */}
            <div className="pt-4 mt-6 border-t border-gray-200">
                {aiResult ? (
                    <div className="bg-[#00C472]/10 border border-[#00C472]/20 p-3 rounded-lg flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#00C472]" />
                        <span className="text-sm font-bold text-[#00C472]">Metric Validated. Proceed to Roadmap.</span>
                    </div>
                ) : (
                    <div className="text-xs text-gray-400 text-center">
                        Confirm your metric to proceed.
                    </div>
                )}
            </div>
        </div>
    );
};
