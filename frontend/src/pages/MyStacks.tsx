import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout';
import { Button } from '../components/ui';
import { CreateStackModal, StackCard } from '../components/stacks';
import { stacksApi } from '../api';
import type { Stack } from '../types';
import { Plus } from 'lucide-react';

export const MyStacks: React.FC = () => {
    const [stacks, setStacks] = useState<Stack[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchStacks = async () => {
        setLoading(true);
        try {
            const response = await stacksApi.getAll();
            if (response.success && response.data) {
                setStacks(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch stacks:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStacks();
    }, []);

    const handleDeleteStack = async (id: string) => {
        try {
            const response = await stacksApi.delete(id);
            if (response.success) {
                setStacks(stacks.filter((s) => s.id !== id));
            }
        } catch (error) {
            console.error('Failed to delete stack:', error);
        }
    };

    return (
        <Layout>
            <div className="p-8 max-w-[1400px] mx-auto w-full">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-text-primary">My Stacks</h1>
                    <Button
                        variant="primary"
                        icon={<Plus size={18} />}
                        onClick={() => setIsModalOpen(true)}
                    >
                        New Stack
                    </Button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-16 text-text-secondary">
                        <div className="w-8 h-8 border-2 border-text-muted border-t-accent-primary rounded-full animate-spin-custom" />
                        <span>Loading stacks...</span>
                    </div>
                ) : stacks.length === 0 ? (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div
                            className="flex flex-col items-center justify-center gap-4 p-8 bg-bg-card border-2 border-dashed border-border-default rounded-xl cursor-pointer transition-all duration-200 min-w-[300px] text-center hover:border-accent-primary hover:bg-bg-hover"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-white">
                                <Plus size={32} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-text-primary">Create New Stack</h3>
                                <p className="text-sm text-text-secondary mt-1">Build your first AI workflow</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
                        {stacks.map((stack) => (
                            <StackCard
                                key={stack.id}
                                stack={stack}
                                onDelete={handleDeleteStack}
                            />
                        ))}
                    </div>
                )}

                <CreateStackModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={fetchStacks}
                />
            </div>
        </Layout>
    );
};
