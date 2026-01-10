import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Layers, ChevronLeft, Save } from 'lucide-react';
import { Button } from '../ui';

interface HeaderProps {
    title?: string;
    showBack?: boolean;
    stackId?: string;
    onSave?: () => void;
    onBuild?: () => void;
    onChat?: () => void;
    isSaving?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
    title = 'GenAI Stack',
    showBack = false,
    stackId,
    onSave,
    onBuild,
    onChat,
    isSaving = false,
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const isWorkflowPage = location.pathname.includes('/stack/');

    return (
        <header className="flex items-center justify-between h-16 px-6 bg-bg-secondary border-b border-border-default sticky top-0 z-40">
            <div className="flex items-center gap-3">
                {showBack ? (
                    <button
                        className="flex items-center justify-center w-8 h-8 rounded-md text-text-secondary transition-all hover:bg-bg-hover hover:text-text-primary"
                        onClick={() => navigate('/')}
                    >
                        <ChevronLeft size={20} />
                    </button>
                ) : null}
                <Link to="/" className="flex items-center gap-3 no-underline text-text-primary group">
                    <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-md text-white group-hover:scale-105 transition-transform duration-200">
                        <Layers size={24} />
                    </div>
                    <span className="text-lg font-bold bg-gradient-to-br from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                        {title}
                    </span>
                </Link>
            </div>

            <div className="flex-1 flex justify-center">
                {isWorkflowPage && stackId && (
                    <div className="text-base font-semibold text-text-primary">{title}</div>
                )}
            </div>

            <div className="flex items-center gap-3">
                {isWorkflowPage && (
                    <>
                        {onSave && (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={onSave}
                                loading={isSaving}
                                icon={<Save size={16} />}
                            >
                                Save
                            </Button>
                        )}
                        {onBuild && (
                            <Button variant="secondary" size="sm" onClick={onBuild}>
                                Build Stack
                            </Button>
                        )}
                        {onChat && (
                            <Button variant="primary" size="sm" onClick={onChat}>
                                Chat with Stack
                            </Button>
                        )}
                    </>
                )}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-success to-emerald-600 flex items-center justify-center font-semibold text-sm text-white ml-2 ring-2 ring-bg-secondary ring-offset-2 ring-offset-bg-primary">
                    S
                </div>
            </div>
        </header>
    );
};
