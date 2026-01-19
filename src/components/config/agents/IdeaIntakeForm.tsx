import React, { useState, useEffect } from 'react';
import { useWorkflowStore } from '../../../store/useWorkflowStore';
import { Lightbulb, Play, Brain, ChevronRight, AlertTriangle, XCircle, CheckCircle2 } from 'lucide-react';
import { api, AIResponse } from '../../../lib/api';

export const IdeaIntakeForm: React.FC = () => {
    const { steps, selectedStepId, updateStep } = useWorkflowStore();
    const selectedStep = steps.find(s => s.id === selectedStepId);

    // Form State
    const [problem, setProblem] = useState('');
    const [whyExists, setWhyExists] = useState('');
    const [whyNow, setWhyNow] = useState('');

    // AI State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [aiResult, setAiResult] = useState<AIResponse | null>(null);

    // Load Data
    useEffect(() => {
        if (selectedStep?.data) {
            setProblem(selectedStep.data.problem || '');
            setWhyExists(selectedStep.data.whyExists || '');
            setWhyNow(selectedStep.data.whyNow || '');
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
            const result = await api.ideaIntake({
                problem,
                why_exists: whyExists,
                why_now: whyNow
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
    const isMissingInput = !problem.trim() || !whyExists.trim() || !whyNow.trim();

    return (
        <div className="space-y-8 pb-10">
            {/* AGENT GOAL */}
            <div className="bg-[#1F2ADE]/10 p-4 rounded-lg border border-[#1F2ADE]/20">
                <h3 className="text-sm font-extrabold text-[#1F2ADE] mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-[#1F2ADE]" />
                    Agent Goal
                </h3>
                <p className="text-sm text-[#1F2ADE] leading-relaxed font-medium">
                    I'm here to capture your raw idea. I won't judge it yet. Just tell me what's wrong in the world.
                </p>
            </div>

            {/* Problem */}
            <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
                    The Problem
                </label>
                <textarea
                    value={problem}
                    onChange={(e) => {
                        setProblem(e.target.value);
                        saveData({ problem: e.target.value });
                    }}
                    className="w-full h-24 p-3 bg-white border border-gray-200 shadow rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none resize-none placeholder:text-gray-400"
                    placeholder="Describe the specific pain point. Don't mention your solution yet."
                />
            </div>

            {/* Why Exists */}
            <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Why does this problem exist?
                </label>
                <textarea
                    value={whyExists}
                    onChange={(e) => {
                        setWhyExists(e.target.value);
                        saveData({ whyExists: e.target.value });
                    }}
                    className="w-full h-20 p-3 bg-white border border-gray-200 shadow rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none resize-none placeholder:text-gray-400"
                    placeholder="Root cause analysis..."
                />
            </div>

            {/* Why Now */}
            <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Why now? (Timing)
                </label>
                <input
                    type="text"
                    value={whyNow}
                    onChange={(e) => {
                        setWhyNow(e.target.value);
                        saveData({ whyNow: e.target.value });
                    }}
                    className="w-full p-2 bg-white border border-gray-200 shadow rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none"
                    placeholder="e.g. New regulation, tech shift, market crash..."
                />
            </div>

            {/* ACTIONS */}
            <div className="pt-6 border-t border-gray-200 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        Analysis
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
                            Analyzing Idea...
                        </>
                    ) : (
                        <>
                            <Play className="w-4 h-4" />
                            Run Idea Intake Agent
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
                        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg">
                            <p className="text-sm text-indigo-900 font-semibold leading-relaxed">
                                {aiResult.summary}
                            </p>
                        </div>

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
                        <span className="text-sm font-bold text-[#00C472]">Idea Captured. Proceed to Assumptions.</span>
                    </div>
                ) : (
                    <div className="text-xs text-gray-400 text-center">
                        complete analysis to proceed.
                    </div>
                )}
            </div>
        </div>
    );
};
