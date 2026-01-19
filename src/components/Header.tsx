import React from 'react';
import { RotateCcw, Download, Share2, Bot } from 'lucide-react';

export const Header: React.FC = () => {
    return (
        <>
            <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-800 tracking-tight">
                    <div className="w-8 h-8 bg-[#FF4400] rounded flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <span>Founding PM Copilot</span>
                </div>

                <div className="h-6 w-px bg-gray-200 mx-2"></div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="font-medium text-gray-900">New Product Workspace</span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                    <span className="text-gray-400 text-sm">Search</span>
                    <div className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded text-xs text-gray-500 border border-gray-200">
                        <span>Ctrl</span>
                        <span>K</span>
                    </div>
                </div>

                <div className="h-6 w-px bg-gray-200 mx-1"></div>

                <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded border border-gray-300 bg-white shadow-sm transition-all">
                    <RotateCcw className="w-4 h-4" />
                    Reset
                </button>

                <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded border border-gray-300 bg-white shadow-sm transition-all">
                    <Download className="w-4 h-4" />
                    Export
                </button>

                <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-[#FF4400] hover:bg-[#FF4400]/90 rounded shadow-sm transition-all">
                    <Share2 className="w-4 h-4" />
                    Share
                </button>
            </div>
        </>
    );
};


