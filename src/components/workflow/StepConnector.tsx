import React from 'react';
import { Plus } from 'lucide-react';

interface StepConnectorProps {
    onClickAdd: () => void;
}

export const StepConnector: React.FC<StepConnectorProps> = ({ onClickAdd }) => {
    return (
        <div className="flex flex-col items-center h-16 justify-center relative py-2">
            {/* Vertical Line */}
            <div className="absolute top-0 bottom-0 w-px bg-[#6C4DF6] opacity-50 z-0"></div>

            {/* Plus Button */}
            <button
                onClick={onClickAdd}
                className="relative z-10 w-6 h-6 bg-white border border-[#6C4DF6] rounded text-[#6C4DF6] flex items-center justify-center hover:bg-[#6C4DF6] hover:text-white transition-colors shadow-sm"
            >
                <Plus className="w-4 h-4" />
            </button>
        </div>
    );
};
