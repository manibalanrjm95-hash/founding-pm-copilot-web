import React from 'react';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { X, Bot, CheckCircle2, PlayCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { IdeaIntakeForm } from './agents/IdeaIntakeForm';
import { AssumptionAgentForm } from './agents/AssumptionAgentForm';
import { IcpAgentForm } from './agents/IcpAgentForm';
import { ValuePropositionAgentForm } from './agents/ValuePropositionAgentForm';
import { MvpScopeAgentForm } from './agents/MvpScopeAgentForm';
import { SuccessMetricsAgentForm } from './agents/SuccessMetricsAgentForm';
import { RoadmapAgentForm } from './agents/RoadmapAgentForm';
import { DecisionAgentForm } from './agents/DecisionAgentForm';

export const ConfigPanel: React.FC = () => {
    const { steps, selectedStepId, updateStep, selectStep } = useWorkflowStore();

    const selectedStep = steps.find(s => s.id === selectedStepId);
    if (!selectedStep) return null;

    const index = steps.findIndex(s => s.id === selectedStepId);

    const handleStatusChange = (status: 'not-started' | 'in-progress' | 'complete') => {
        updateStep(selectedStep.id, { status });
    };

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#2B2321] rounded flex items-center justify-center">
                        <span className="text-white font-bold text-xs">{(index + 1)}</span>
                    </div>
                    <div className="flex flex-col">
                        <h2 className="font-semibold text-gray-800 text-sm leading-tight">{selectedStep.name}</h2>
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest">{selectedStep.status.replace('-', ' ')}</span>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => selectStep(null)}
                        className="p-2 hover:bg-gray-100 rounded text-gray-400"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Content Form */}
            <div className="flex-1 overflow-y-auto p-6">

                {selectedStep.id === '1' ? (
                    <IdeaIntakeForm />
                ) : selectedStep.id === '2' ? (
                    <AssumptionAgentForm />
                ) : selectedStep.id === '3' ? (
                    <IcpAgentForm />
                ) : selectedStep.id === '4' ? (
                    <ValuePropositionAgentForm />
                ) : selectedStep.id === '5' ? (
                    <MvpScopeAgentForm />
                ) : selectedStep.id === '6' ? (
                    <SuccessMetricsAgentForm />
                ) : selectedStep.id === '7' ? (
                    <RoadmapAgentForm />
                ) : selectedStep.id === '8' ? (
                    <DecisionAgentForm />
                ) : (
                    <>
                        <div className="bg-[#1F2ADE]/10 p-4 rounded-lg border border-[#1F2ADE]/20 mb-6">
                            <h3 className="text-sm font-extrabold text-[#1F2ADE] mb-2 flex items-center gap-2">
                                <Bot className="w-4 h-4 text-[#1F2ADE]" />
                                Agent Guidance
                            </h3>
                            <p className="text-sm text-[#1F2ADE] leading-relaxed font-medium">
                                {selectedStep.description}
                            </p>
                        </div>

                        {/* Simulated Input */}
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                Founder Context
                            </label>
                            <textarea
                                className="w-full h-32 p-3 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none resize-none placeholder:text-gray-400 shadow"
                                placeholder="Share your initial thoughts, constraints, or hunches. Be honest—I'm here to help you vet this..."
                                onChange={() => {
                                    if (selectedStep.status === 'not-started') {
                                        handleStatusChange('in-progress');
                                    }
                                }}
                            />
                        </div>
                    </>
                )}



                {/* Actions */}
                <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Decisions</h4>

                    <button
                        onClick={() => handleStatusChange('in-progress')}
                        className={cn(
                            "w-full flex items-center justify-between p-3 rounded border text-left transition-all",
                            selectedStep.status === 'in-progress'
                                ? "bg-[#1F2ADE]/5 border-[#1F2ADE]/30 text-[#1F2ADE]"
                                : "hover:bg-gray-50 border-gray-200 text-gray-700"
                        )}
                    >
                        <span className="flex items-center gap-2 text-sm font-medium">
                            <PlayCircle className="w-4 h-4" />
                            Start / In Progress
                        </span>
                        {selectedStep.status === 'in-progress' && <div className="w-2 h-2 rounded-full bg-[#1F2ADE]" />}
                    </button>

                    <button
                        onClick={() => handleStatusChange('complete')}
                        className={cn(
                            "w-full flex items-center justify-between p-3 rounded border text-left transition-all",
                            selectedStep.status === 'complete'
                                ? "bg-[#00C472]/5 border-[#00C472]/30 text-[#00C472]"
                                : "hover:bg-gray-50 border-gray-200 text-gray-700"
                        )}
                    >
                        <span className="flex items-center gap-2 text-sm font-medium">
                            <CheckCircle2 className="w-4 h-4" />
                            Mark as Complete
                        </span>
                        {selectedStep.status === 'complete' && <div className="w-2 h-2 rounded-full bg-[#00C472]" />}
                    </button>
                </div>

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-white text-xs text-center text-gray-400">
                Founding PM Copilot Agent System
            </div>
        </div>
    );
};
