import React from 'react';
import { NavLink } from 'react-router-dom';
import { Layers, Settings, Home } from 'lucide-react';

export const Sidebar: React.FC = () => {
    return (
        <div className="w-[260px] h-screen bg-bg-secondary border-r border-border-default flex flex-col shrink-0">
            <div className="h-16 flex items-center px-6 border-b border-border-default">
                <div className="flex items-center gap-2 text-text-primary">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-white">
                        <Layers size={20} />
                    </div>
                    <span className="font-bold text-lg tracking-tight">GenAI Stack</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                ? 'bg-accent-primary/10 text-accent-primary'
                                : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                            }`
                        }
                    >
                        <Home size={18} />
                        Home
                    </NavLink>
                    <NavLink
                        to="/stacks"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                ? 'bg-accent-primary/10 text-accent-primary'
                                : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                            }`
                        }
                    >
                        <Layers size={18} />
                        My Stacks
                    </NavLink>
                </div>

                <div>
                    <div className="px-3 mb-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
                        Configuration
                    </div>
                    <div className="flex flex-col gap-1">
                        <NavLink
                            to="/settings"
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? 'bg-accent-primary/10 text-accent-primary'
                                    : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                                }`
                            }
                        >
                            <Settings size={18} />
                            Settings
                        </NavLink>
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-border-default">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-bg-tertiary/50 border border-border-muted">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-success to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                        JD
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium text-text-primary truncate">John Doe</span>
                        <span className="text-xs text-text-secondary truncate">Pro Plan</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
