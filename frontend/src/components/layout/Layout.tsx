import React from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface LayoutProps {
    children: React.ReactNode;
    title?: string;
    showBack?: boolean;
    stackId?: string;
    onSave?: () => void;
    onBuild?: () => void;
    onChat?: () => void;
    isSaving?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({
    children,
    title,
    showBack,
    stackId,
    onSave,
    onBuild,
    onChat,
    isSaving,
}) => {
    const location = useLocation();
    const isWorkflowPage = location.pathname.includes('/stack/') && stackId;

    if (isWorkflowPage) {
        return (
            <div className="flex flex-col min-h-screen bg-bg-primary">
                <Header
                    title={title}
                    showBack={showBack}
                    stackId={stackId}
                    onSave={onSave}
                    onBuild={onBuild}
                    onChat={onChat}
                    isSaving={isSaving}
                />
                <main className="flex-1 flex flex-col overflow-hidden h-[calc(100vh-64px)]">{children}</main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-bg-primary">
            <Sidebar />
            <main className="flex-1 flex flex-col h-screen overflow-y-auto">
                <header className="h-16 flex items-center justify-between px-8 bg-bg-primary border-b border-border-default sticky top-0 z-10 hidden">
                    {/* Mobile header placeholder if needed later */}
                    <span className="font-semibold text-text-primary">{title}</span>
                </header>
                {children}
            </main>
        </div>
    );
};
