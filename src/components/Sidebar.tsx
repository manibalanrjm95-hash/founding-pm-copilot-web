import React from 'react';
import { LayoutGrid, Zap, Folder, CheckSquare, Clock, Activity, Settings, LayoutList, LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

const SidebarItem = ({ icon: Icon, label, active = false }: { icon: LucideIcon, label: string, active?: boolean }) => (
    <div className={cn(
        "flex items-center gap-3 pl-2.5 pr-3 py-2 cursor-pointer transition-colors w-full h-9",
        active ? "text-white bg-white/10 border-l-4 border-[#FF4F00]" : "text-gray-400 hover:text-white hover:bg-white/5 border-l-4 border-transparent"
    )}>
        <Icon className="w-5 h-5 shrink-0" />
        <span className="whitespace-nowrap overflow-hidden opacity-0 group-hover:opacity-100 transition-all duration-300 w-0 group-hover:w-auto text-sm">
            {label}
        </span>
    </div>
);

export const Sidebar: React.FC = () => {
    return (
        <aside className="group w-12 hover:w-60 bg-[#2B2321] flex-shrink-0 flex flex-col items-start py-4 border-r border-gray-800 z-50 transition-all duration-300 h-full overflow-hidden shadow-2xl">
            <div className="mb-4 w-full">
                <SidebarItem icon={LayoutGrid} label="Dashboard" />
            </div>

            <div className="flex flex-col flex-1 w-full gap-1">
                <SidebarItem icon={Zap} label="Zaps" active />
                <SidebarItem icon={Folder} label="Transfers" />
                <SidebarItem icon={CheckSquare} label="Tasks" />
                <SidebarItem icon={LayoutList} label="Tables" />
                <SidebarItem icon={Clock} label="History" />
                <SidebarItem icon={Activity} label="Apps" />
            </div>

            <div className="mt-auto w-full">
                <SidebarItem icon={Settings} label="Settings" />
                <SidebarItem icon={LayoutGrid} label="More" />
            </div>
        </aside>
    );
};
