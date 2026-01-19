import React from 'react';
import { AgentStep } from '../../store/useWorkflowStore';
import { cn } from '../../lib/utils';
import {
    CheckCircle2,
    CircleDashed,
    Loader2,
    Lightbulb,
    ScanSearch,
    Target,
    Gem,
    Box,
    BarChart3,
    Map,
    Scale,
    Bot
} from 'lucide-react';

interface StepNodeProps {
    step: AgentStep;
    index: number;
    isSelected: boolean;
    onClick: () => void;
}

export const StepNode: React.FC<StepNodeProps> = ({ step, index, isSelected, onClick }) => {
    // Status Icon Logic
    const StatusIcon = () => {
        switch (step.status) {
            case 'complete': return <CheckCircle2 className="w-5 h-5 text-[#00C472]" />;
            case 'in-progress': return <Loader2 className="w-5 h-5 text-[#1F2ADE] animate-spin" />;
            default: return <CircleDashed className="w-5 h-5 text-gray-300" />;
        }
    };

    // Agent Icon Logic
    const AgentIcon = () => {
        const props = { className: "w-6 h-6 text-white" };
        switch (step.id) {
            case '1': return <Lightbulb {...props} />;     // Idea
            case '2': return <ScanSearch {...props} />;    // Assumption
            case '3': return <Target {...props} />;        // ICP
            case '4': return <Gem {...props} />;           // Value Prop
            case '5': return <Box {...props} />;           // MVP
            case '6': return <BarChart3 {...props} />;     // Metrics
            case '7': return <Map {...props} />;           // Roadmap
            case '8': return <Scale {...props} />;         // Decision
            default: return <Bot {...props} />;
        }
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                "relative w-[400px] bg-white rounded-lg border-2 transition-all cursor-pointer group hover:shadow-xl",
                isSelected
                    ? "border-[#FF4400] shadow-xl ring-1 ring-[#FF4400]/20"
                    : "border-transparent shadow-md hover:border-gray-200"
            )}
        >
            <div className={cn(
                "p-4 rounded-lg",
                !isSelected && "border border-gray-200"
            )}>
                <div className="flex items-start gap-4">
                    {/* Icon Box */}
                    <div className="w-10 h-10 rounded-lg bg-[#FF4400] flex items-center justify-center shrink-0 shadow-sm">
                        <AgentIcon />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                AGENT {index + 1}
                            </span>
                            <StatusIcon />
                        </div>

                        <h3 className="text-base font-bold text-gray-900 truncate mb-1">
                            {step.name}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2">
                            {step.description}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
