import React, { useState, useEffect } from 'react';
import { useWorkflowStore } from '../../../store/useWorkflowStore';
import { Scale, CheckSquare, HelpCircle, AlertTriangle, ArrowRight, History, Play, Brain, XCircle, Flag } from 'lucide-react';

import { api, AIResponse } from '../../../lib/api';

interface Decision {
    id: string;
    text: string;
    date: string;
}

export const DecisionAgentForm: React.FC = () => {
    const { steps, selectedStepId, updateStep } = useWorkflowStore();
    const selectedStep = steps.find(s => s.id === selectedStepId);

    // Pull data from previous steps for context
    const assumptionStep = steps.find(s => s.id === '2');
    const highRisks = (assumptionStep?.data?.assumptions || []).filter((a: any) => a.risk === 'High');

    // Form State
    const [decisions, setDecisions] = useState<Decision[]>([]);
    const [openQuestions, setOpenQuestions] = useState<string[]>([]);

    // Inputs
    const [newDecision, setNewDecision] = useState('');
    const [newQuestion, setNewQuestion] = useState('');

    // AI State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [aiResult, setAiResult] = useState<AIResponse | null>(null);

    // Load data
    useEffect(() => {
        if (selectedStep?.data) {
            setDecisions(selectedStep.data.decisions || []);
            setOpenQuestions(selectedStep.data.openQuestions || []);
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

    const addDecision = () => {
        if (!newDecision.trim()) return;
        const updated = [...decisions, {
            id: crypto.randomUUID(),
            text: newDecision.trim(),
            date: new Date().toLocaleDateString()
        }];
        setDecisions(updated);
        saveData({ decisions: updated });
        setNewDecision('');
    };

    const addQuestion = () => {
        if (!newQuestion.trim()) return;
        const updated = [...openQuestions, newQuestion.trim()];
        setOpenQuestions(updated);
        saveData({ openQuestions: updated });
        setNewQuestion('');
    };

    const runAgent = async () => {
        if (!selectedStepId) return;
        setLoading(true);
        setError(null);

        try {
            // Aggregate all context
            // In a real app we might pass specific fields, but for now we pass the full steps array (simplified)
            // or we pick the crucial parts.
            const fullContext = steps.map(s => ({
                agent: s.name,
                data: s.data
            }));

            const result = await api.decisionRisk({
                decisions: decisions.map(d => d.text).join('; '),
                risks: highRisks.map((r: any) => r.text).join('; '),
                open_questions: openQuestions.join('; '),
                full_context: fullContext
            });

            setAiResult(result);
            saveData({ aiResult: result });
        } catch (err: any) {
            setError(err.message || "Failed to run agent");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 pb-10">
            {/* AGENT GOAL */}
            <div className="bg-[#1F2ADE]/10 p-4 rounded-lg border border-[#1F2ADE]/20">
                <h3 className="text-sm font-extrabold text-[#1F2ADE] mb-2 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-[#1F2ADE]" />
                    Agent Goal
                </h3>
                <p className="text-sm text-[#1F2ADE] leading-relaxed font-medium">
                    Create memory and accountability. Go or No-Go? Are you ready to commit?
                </p>
            </div>

            {/* UNRESOLVED HIGH RISKS */}
            {highRisks.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
                    <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wide flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Unresolved High Risks (Detected from Agent 2)
                    </h4>
                    <div className="space-y-2">
                        {highRisks.map((risk: any) => (
                            <div key={risk.id} className="text-sm text-amber-900 bg-white/50 p-2 rounded border border-amber-100 italic">
                                "{risk.text}"
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* DECISION LOG */}
            <div className="space-y-3">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                    <History className="w-3 h-3" />
                    Key Decision Log
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newDecision}
                        onChange={(e) => setNewDecision(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addDecision()}
                        className="flex-1 p-2 bg-white border border-gray-200 shadow rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none"
                        placeholder="e.g. Pivot to B2B..."
                    />
                    <button
                        onClick={addDecision}
                        disabled={!newDecision.trim()}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black disabled:opacity-50"
                    >
                        Log
                    </button>
                </div>
                <div className="space-y-2">
                    {decisions.map((item) => (
                        <div key={item.id} className="flex items-start gap-3 p-3 bg-white border border-gray-200 shadow-sm rounded-lg">
                            <CheckSquare className="w-4 h-4 text-[#00C472] mt-0.5 shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm text-gray-800 font-medium">{item.text}</p>
                                <p className="text-xs text-gray-400 mt-1">{item.date}</p>
                            </div>
                        </div>
                    ))}
                    {decisions.length === 0 && (
                        <div className="text-center py-4 text-xs text-gray-400 italic border-2 border-dashed border-gray-100 rounded-lg">
                            No major decisions logged.
                        </div>
                    )}
                </div>
            </div>

            {/* OPEN QUESTIONS */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                    <HelpCircle className="w-3 h-3" />
                    Open Questions / Unknowns
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addQuestion()}
                        className="flex-1 p-2 bg-white border border-gray-200 shadow rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none"
                        placeholder="e.g. Will API X support high volume?"
                    />
                    <button
                        onClick={addQuestion}
                        disabled={!newQuestion.trim()}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        Add
                    </button>
                </div>
                <ul className="space-y-2">
                    {openQuestions.map((q, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            <ArrowRight className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
                            {q}
                        </li>
                    ))}
                </ul>
            </div>

            {/* ACTIONS */}
            <div className="pt-6 border-t border-gray-200 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        Final Commitment Analysis
                    </h3>
                </div>

                <button
                    onClick={runAgent}
                    disabled={loading || (decisions.length === 0 && openQuestions.length === 0)}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-black text-white hover:bg-gray-800 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Judging your fate...
                        </>
                    ) : (
                        <>
                            <Play className="w-4 h-4" />
                            Run Decision Agent
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
                        <div className="bg-slate-800 text-white border border-slate-700 p-5 rounded-lg shadow-lg">
                            <div className="flex items-center gap-2 mb-2 text-brand-primary">
                                <Flag className="w-5 h-5" />
                                <span className="font-bold uppercase text-xs tracking-wider">Verdict</span>
                            </div>
                            <p className="text-sm font-medium leading-relaxed opacity-90">
                                {aiResult.summary}
                            </p>
                        </div>

                        {/* Risks */}
                        {aiResult.risks.length > 0 && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg">
                                <h4 className="text-xs font-bold text-red-800 uppercase mb-2 flex items-center gap-2">
                                    <AlertTriangle className="w-3 h-3" />
                                    Blocking Issues
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

            <div className="pt-4 mt-6 border-t border-gray-200">
                {aiResult ? (
                    <div className="text-center p-4">
                        <span className="text-sm font-bold text-gray-800">
                            Decision Recorded. Go build the future.
                        </span>
                    </div>
                ) : (
                    <div className="text-xs text-gray-400 text-center">
                        Commit to a direction to finish.
                    </div>
                )}
            </div>

        </div>
    );
};
