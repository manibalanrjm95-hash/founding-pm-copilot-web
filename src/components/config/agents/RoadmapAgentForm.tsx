import React, { useState, useEffect } from 'react';
import { useWorkflowStore } from '../../../store/useWorkflowStore';
import { Map, AlertTriangle, CalendarX, Play, Brain, XCircle, CheckCircle2 } from 'lucide-react';
import { api, AIResponse } from '../../../lib/api';

export const RoadmapAgentForm: React.FC = () => {
    const { steps, selectedStepId, updateStep } = useWorkflowStore();
    const selectedStep = steps.find(s => s.id === selectedStepId);

    // Form State
    const [milestones, setMilestones] = useState('');
    const [notBuilding, setNotBuilding] = useState('');

    // AI State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [aiResult, setAiResult] = useState<AIResponse | null>(null);

    // Warnings
    const [dateWarning, setDateWarning] = useState<string | null>(null);

    // Load Data
    useEffect(() => {
        if (selectedStep?.data) {
            setMilestones(selectedStep.data.milestones || '');
            setNotBuilding(selectedStep.data.notBuilding || '');
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

    const handleMilestonesChange = (val: string) => {
        setMilestones(val);
        saveData({ milestones: val });

        // Date Detection
        const datePattern = /(Q[1-4]|January|February|March|April|May|June|July|August|September|October|November|December|202\d|\d{1,2}\/\d{1,2})/i;
        if (datePattern.test(val)) {
            setDateWarning(`Startups die when they chase dates instead of outcomes. Remove timelines like "${val.match(datePattern)?.[0]}".`);
        } else {
            setDateWarning(null);
        }
    };

    const runAgent = async () => {
        if (!selectedStepId) return;
        setLoading(true);
        setError(null);

        try {
            const result = await api.roadmap({
                milestones: milestones,
                not_building: notBuilding
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
    const isMissingInput = !milestones.trim() || !notBuilding.trim();

    return (
        <div className="space-y-8 pb-10">
            {/* AGENT GOAL */}
            <div className="bg-[#1F2ADE]/10 p-4 rounded-lg border border-[#1F2ADE]/20">
                <h3 className="text-sm font-extrabold text-[#1F2ADE] mb-2 flex items-center gap-2">
                    <Map className="w-4 h-4 text-[#1F2ADE]" />
                    Agent Goal
                </h3>
                <p className="text-sm text-[#1F2ADE] leading-relaxed font-medium">
                    Sequence learning and delivery. Focus on OUTCOMES, not features. No dates allowed.
                </p>
            </div>

            {dateWarning && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-3 rounded border border-red-100 font-bold animate-pulse">
                    <CalendarX className="w-4 h-4 shrink-0" />
                    {dateWarning}
                </div>
            )}

            {/* Milestones */}
            <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
                    First 3 Milestones (Outcomes Only)
                </label>
                <textarea
                    value={milestones}
                    onChange={(e) => handleMilestonesChange(e.target.value)}
                    className="w-full h-32 p-3 bg-white border border-gray-200 shadow rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none resize-none placeholder:text-gray-400"
                    placeholder="1. Validate Problem (5 interviews)&#10;2. Validate Value (1 LOI)&#10;3. Validate Pricing (1 Payment)"
                />
            </div>

            {/* Not Building */}
            <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
                    What are you explicitly NOT building yet?
                </label>
                <textarea
                    value={notBuilding}
                    onChange={(e) => {
                        setNotBuilding(e.target.value);
                        saveData({ notBuilding: e.target.value });
                    }}
                    className="w-full h-24 p-3 bg-white border border-gray-200 shadow rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none resize-none placeholder:text-gray-400"
                    placeholder="e.g. Enterprise SSO, Mobile App, Dark Mode"
                />
            </div>

            {/* ACTIONS */}
            <div className="pt-6 border-t border-gray-200 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        Roadmap Analysis
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
                            Reviewing Sequence...
                        </>
                    ) : (
                        <>
                            <Play className="w-4 h-4" />
                            Run Roadmap Agent
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
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                            <p className="text-sm text-blue-900 font-semibold leading-relaxed">
                                {aiResult.summary}
                            </p>
                        </div>

                        {/* Risks */}
                        {aiResult.risks.length > 0 && (
                            <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r-lg">
                                <h4 className="text-xs font-bold text-amber-800 uppercase mb-2 flex items-center gap-2">
                                    <AlertTriangle className="w-3 h-3" />
                                    Sequence Risks
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
                        <span className="text-sm font-bold text-[#00C472]">Roadmap Sequenced. Proceed to Decision.</span>
                    </div>
                ) : (
                    <div className="text-xs text-gray-400 text-center">
                        Validate roadmap to proceed.
                    </div>
                )}
            </div>
        </div>
    );
};
