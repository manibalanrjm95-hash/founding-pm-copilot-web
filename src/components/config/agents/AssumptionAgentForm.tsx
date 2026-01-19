import React, { useState, useEffect } from 'react';
import { useWorkflowStore } from '../../../store/useWorkflowStore';
import { AlertTriangle, Play, Brain, ChevronRight, XCircle, CheckCircle2 } from 'lucide-react';
import { api, AIResponse } from '../../../lib/api';

export const AssumptionAgentForm: React.FC = () => {
    const { steps, selectedStepId, updateStep } = useWorkflowStore();
    const selectedStep = steps.find(s => s.id === selectedStepId);

    // Previous Step Context (from Agent 1)
    const ideaStep = steps.find(s => s.id === '1');
    const problemContext = ideaStep?.data?.problem || "Problem not defined yet.";

    // Form State
    const [trueFactors, setTrueFactors] = useState('');
    const [failurePoints, setFailurePoints] = useState('');

    // AI State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [aiResult, setAiResult] = useState<AIResponse | null>(null);

    // Load Data
    useEffect(() => {
        if (selectedStep?.data) {
            setTrueFactors(selectedStep.data.trueFactors || '');
            setFailurePoints(selectedStep.data.failurePoints || '');
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

    const runAgent = async () => {
        if (!selectedStepId) return;
        setLoading(true);
        setError(null);

        try {
            const result = await api.assumptions({
                problem: problemContext,
                true_factors: trueFactors,
                failure_points: failurePoints
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
    const isMissingInput = !trueFactors.trim() || !failurePoints.trim();

    return (
        <div className="space-y-8 pb-10">
            {/* AGENT GOAL */}
            <div className="bg-[#1F2ADE]/10 p-4 rounded-lg border border-[#1F2ADE]/20">
                <h3 className="text-sm font-extrabold text-[#1F2ADE] mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#1F2ADE]" />
                    Agent Goal
                </h3>
                <p className="text-sm text-[#1F2ADE] leading-relaxed font-medium">
                    I'm here to find the invisible landmines. What are we assuming is true, but might not be?
                </p>
            </div>

            {/* Context */}
            <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Context (from Agent 1)</p>
                <p className="text-sm text-gray-700 italic">"{problemContext}"</p>
            </div>

            {/* True Factors */}
            <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
                    What MUST be true for this to work?
                </label>
                <textarea
                    value={trueFactors}
                    onChange={(e) => {
                        setTrueFactors(e.target.value);
                        saveData({ trueFactors: e.target.value });
                    }}
                    className="w-full h-24 p-3 bg-white border border-gray-200 shadow rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none resize-none placeholder:text-gray-400"
                    placeholder="e.g. Users must be willing to share financial data..."
                />
            </div>

            {/* Failure Points */}
            <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Where will this fail?
                </label>
                <textarea
                    value={failurePoints}
                    onChange={(e) => {
                        setFailurePoints(e.target.value);
                        saveData({ failurePoints: e.target.value });
                    }}
                    className="w-full h-20 p-3 bg-white border border-gray-200 shadow rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none resize-none placeholder:text-gray-400"
                    placeholder="e.g. If API X is too slow, the experience breaks."
                />
            </div>

            {/* ACTIONS */}
            <div className="pt-6 border-t border-gray-200 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        Risk Analysis
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
                            Identifying Risks...
                        </>
                    ) : (
                        <>
                            <Play className="w-4 h-4" />
                            Run Assumption Agent
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
                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg">
                            <p className="text-sm text-amber-900 font-semibold leading-relaxed">
                                {aiResult.summary}
                            </p>
                        </div>

                        {/* Risks */}
                        {aiResult.risks.length > 0 && (
                            <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg">
                                <h4 className="text-xs font-bold text-red-800 uppercase mb-2 flex items-center gap-2">
                                    <AlertTriangle className="w-3 h-3" />
                                    Critical Failuire Points
                                </h4>
                                <ul className="space-y-1">
                                    {aiResult.risks.map((risk, i) => (
                                        <li key={i} className="text-xs text-red-900 font-medium">
                                            • {risk}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

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
                    </div>
                )}
            </div>

            {/* STATUS CHECK */}
            <div className="pt-4 mt-6 border-t border-gray-200">
                {aiResult ? (
                    <div className="bg-[#00C472]/10 border border-[#00C472]/20 p-3 rounded-lg flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#00C472]" />
                        <span className="text-sm font-bold text-[#00C472]">Risks Detected. Proceed to ICP.</span>
                    </div>
                ) : (
                    <div className="text-xs text-gray-400 text-center">
                        Run risk analysis to proceed.
                    </div>
                )}
            </div>
        </div>
    );
};
