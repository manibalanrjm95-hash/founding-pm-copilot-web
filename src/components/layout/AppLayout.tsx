import React, { ReactNode } from 'react';

interface AppLayoutProps {
    sidebar: ReactNode;
    header: ReactNode;
    main: ReactNode;
    configPanel: ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ sidebar, header, main, configPanel }) => {
    return (
        <div className="flex h-screen bg-[#F7F7F7] overflow-hidden">
            {/* Sidebar - Component handles its own sizing/expansion */}
            {sidebar}

            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 justify-between z-10">
                    {header}
                </header>

                {/* Main Content Area */}
                <main className="flex-1 flex overflow-hidden relative">
                    {/* Main Canvas Area - Component handles its own layout/scrolling */}
                    {main}

                    {/* Configuration Panel (Right Sidebar) */}
                    {/* Configuration Panel (Right Sidebar) */}
                    {configPanel && (
                        <aside className="w-[600px] bg-gray-50 border-l border-gray-200 shadow-xl z-20 flex flex-col">
                            {configPanel}
                        </aside>
                    )}
                </main>
            </div>
        </div>
    );
};
