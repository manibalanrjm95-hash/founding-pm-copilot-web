import React, { useState, useEffect } from 'react';
import { useWorkflowStore } from '../../../store/useWorkflowStore';
import { Box, Plus, Trash2, AlertTriangle, ShieldBan, CheckCircle2, Play, Brain, ChevronRight, XCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { callMvpScopeAgent, MvpScopeResponse } from '../../../lib/api';

export const MvpScopeAgentForm: React.FC = () => {
    const { steps, selectedStepId, updateStep } = useWorkflowStore();
    const selectedStep = steps.find(s => s.id === selectedStepId);

    // Form State
    const [mustHaves, setMustHaves] = useState<string[]>([]);
    const [exclusions, setExclusions] = useState<string[]>([]);
    const [outcome, setOutcome] = useState('');

    // AI State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [aiResult, setAiResult] = useState<MvpScopeResponse | null>(null);

    // Input State
    const [newItem, setNewItem] = useState('');
    const [newExclusion, setNewExclusion] = useState('');

    // Load Data
    useEffect(() => {
        if (selectedStep?.data) {
            setMustHaves(selectedStep.data.mustHaves || []);
            setExclusions(selectedStep.data.exclusions || []);
            setOutcome(selectedStep.data.outcome || '');
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

    // Actions
    const addMustHave = () => {
        if (!newItem.trim()) return;
        const updated = [...mustHaves, newItem.trim()];
        setMustHaves(updated);
        saveData({ mustHaves: updated });
        setNewItem('');
    };

    const addExclusion = () => {
        if (!newExclusion.trim()) return;
        const updated = [...exclusions, newExclusion.trim()];
        setExclusions(updated);
        saveData({ exclusions: updated });
        setNewExclusion('');
    };

    const removeItem = (index: number, type: 'must' | 'exclusion') => {
        if (type === 'must') {
            const updated = mustHaves.filter((_, i) => i !== index);
            setMustHaves(updated);
            saveData({ mustHaves: updated });
        } else {
            const updated = exclusions.filter((_, i) => i !== index);
            setExclusions(updated);
            saveData({ exclusions: updated });
        }
    };

    const runMvpScopeAgent = async () => {
        if (!selectedStepId) return;

        setLoading(true);
        setError(null);

        try {
            // In a real app we might pull target_user/value_proposition from previous agents
            const payload = {
                problem: outcome,
                target_user: "First-time SaaS founders", // Defaulting for MVP Scope context if not available
                value_proposition: "Reduce time to first value" // Defaulting
            };

            const result = await callMvpScopeAgent(payload);
            setAiResult(result);

            // Persist AI result
            const currentData = selectedStep?.data || {};
            updateStep(selectedStepId, {
                data: {
                    ...currentData,
                    aiResult: result
                }
            });

        } catch (err: any) {
            setError(err.message || "Failed to run MVP Scope Agent");
        } finally {
            setLoading(false);
        }
    };

    // Validation Logic
    const isBloated = mustHaves.length > 5;
    const isMissingExclusions = exclusions.length === 0;
    const isMissingOutcome = !outcome.trim();

    // Blocking Logic
    const isBlocked = isBloated || isMissingExclusions || isMissingOutcome;

    // Helper to get blocking reason
    const getBlockReason = () => {
        if (isBloated) return `Too many features (${mustHaves.length}/5). Reduce scope.`;
        if (isMissingExclusions) return "You must explicitly exclude things.";
        if (isMissingOutcome) return "Define the outcome first.";
        return "";
    };

    return (
        <div className="space-y-8 pb-10">
            {/* AGENT GOAL */}
            <div className="bg-[#1F2ADE]/10 p-4 rounded-lg border border-[#1F2ADE]/20">
                <h3 className="text-sm font-extrabold text-[#1F2ADE] mb-2 flex items-center gap-2">
                    <Box className="w-4 h-4 text-[#1F2ADE]" />
                    Agent Goal
                </h3>
                <p className="text-sm text-[#1F2ADE] leading-relaxed font-medium">
                    Decide what to build — and what to explicitly NOT build. I will block you if you try to do too much.
                </p>
            </div>

            {/* Desired Outcome */}
            <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Desired MVP Outcome (Learning Goal)
                </label>
                <input
                    type="text"
                    value={outcome}
                    onChange={(e) => {
                        setOutcome(e.target.value);
                        saveData({ outcome: e.target.value });
                    }}
                    className="w-full p-2 bg-white border border-gray-200 shadow rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none"
                    placeholder="e.g. Prove that users will enter credit card details..."
                />
            </div>

            {/* MUST HAVES */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Must-Have Capabilities (Max 5)
                    </label>
                    <span className={cn("text-xs font-bold", isBloated ? "text-red-600" : "text-gray-400")}>
                        {mustHaves.length} / 5 items
                    </span>
                </div>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addMustHave()}
                        className="flex-1 p-2 bg-white border border-gray-200 shadow rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none"
                        placeholder="Add core feature..."
                    />
                    <button
                        onClick={addMustHave}
                        disabled={!newItem.trim()}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black disabled:opacity-50"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                {isBloated && (
                    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100 font-medium">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        Scope Bloat Detected! Remove {mustHaves.length - 5} item(s) to proceed.
                    </div>
                )}

                <div className="space-y-2">
                    {mustHaves.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-200 shadow-sm rounded-lg group">
                            <span className="text-sm text-gray-800">{item}</span>
                            <button onClick={() => removeItem(idx, 'must')} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    {mustHaves.length === 0 && (
                        <div className="text-center py-4 text-xs text-gray-400 italic border-2 border-dashed border-gray-100 rounded-lg">
                            No core features added yet.
                        </div>
                    )}
                </div>
            </div>

            {/* EXCLUSIONS */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Explicit Exclusions (Mandatory)
                    </label>
                    {isMissingExclusions && (
                        <span className="text-xs font-bold text-red-500 flex items-center gap-1">
                            <ShieldBan className="w-3 h-3" /> Required
                        </span>
                    )}
                </div>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newExclusion}
                        onChange={(e) => setNewExclusion(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addExclusion()}
                        className="flex-1 p-2 bg-white border border-gray-200 shadow rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none"
                        placeholder="What are we NOT building?"
                    />
                    <button
                        onClick={addExclusion}
                        disabled={!newExclusion.trim()}
                        className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 disabled:opacity-50"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                <div className="space-y-2">
                    {exclusions.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-red-50/50 border border-red-100 shadow-sm rounded-lg group">
                            <span className="text-sm text-red-800 flex items-center gap-2">
                                <ShieldBan className="w-4 h-4 opacity-50" />
                                {item}
                            </span>
                            <button onClick={() => removeItem(idx, 'exclusion')} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    {exclusions.length === 0 && (
                        <div className="text-center py-4 text-xs text-gray-400 italic border-2 border-dashed border-gray-100 rounded-lg">
                            No exclusions added. You must list what you are NOT ignoring.
                        </div>
                    )}
                </div>
            </div>

            {/* DECISIONS / AI SECTION */}
            <div className="pt-6 border-t border-gray-200 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        Decisions & Analysis
                    </h3>
                </div>

                {isBlocked ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center text-center gap-2">
                        <ShieldBan className="w-8 h-8 text-gray-300" />
                        <p className="text-sm font-medium text-gray-600">Action Blocked</p>
                        <p className="text-xs text-gray-500">{getBlockReason()}</p>
                    </div>
                ) : (
                    <button
                        onClick={runMvpScopeAgent}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 p-3 bg-black text-white hover:bg-gray-800 rounded-lg text-sm font-medium transition-all disabled:opacity-70"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Consult MVP Agent...
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4" />
                                Run MVP Scope Agent
                            </>
                        )}
                    </button>
                )}

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs flex items-center gap-2 border border-red-100">
                        <XCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                {aiResult && (
                    <div className="space-y-4 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {/* Summary */}
                        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg">
                            <p className="text-sm text-indigo-900 font-semibold leading-relaxed">
                                {aiResult.summary}
                            </p>
                        </div>

                        {/* Key Points */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Key Insights</h4>
                            <ul className="space-y-1">
                                {aiResult.key_points.map((pt, i) => (
                                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                        <ChevronRight className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                                        {pt}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Risks */}
                        {aiResult.risks.length > 0 && (
                            <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r-lg">
                                <h4 className="text-xs font-bold text-amber-800 uppercase mb-2 flex items-center gap-2">
                                    <AlertTriangle className="w-3 h-3" />
                                    Critical Risks
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

                        {/* Recommendations */}
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

                        {/* Next Steps */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Immediate Next Steps</h4>
                            <ol className="list-decimal list-inside space-y-1">
                                {aiResult.next_steps.map((step, i) => (
                                    <li key={i} className="text-xs text-gray-700 font-medium ml-1">
                                        {step}
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                )}
            </div>

            {/* STATUS CHECK */}
            <div className="pt-4 mt-6 border-t border-gray-200">
                {!isBlocked ? (
                    <div className="bg-[#00C472]/10 border border-[#00C472]/20 p-3 rounded-lg flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#00C472]" />
                        <span className="text-sm font-bold text-[#00C472]">MVP Scope Validated. Ready to build.</span>
                    </div>
                ) : (
                    <div className="text-xs text-gray-400 text-center">
                        Resolve scope issues to validate.
                    </div>
                )}
            </div>
        </div>
    );
};
