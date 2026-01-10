import React, { useState } from 'react';
import { Modal, Input, Textarea, Button } from '../ui';
import { stacksApi } from '../../api';

interface CreateStackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateStackModal: React.FC<CreateStackModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Name is required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await stacksApi.create({ name, description });
            if (response.success) {
                onSuccess();
                onClose();
                setName('');
                setDescription('');
            } else {
                setError(response.error?.message || 'Failed to create stack');
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create New Stack"
            size="md"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSubmit} loading={loading}>
                        Create
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                    label="Name"
                    placeholder="Enter stack name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={error && !name.trim() ? 'Name is required' : undefined}
                />
                <Textarea
                    label="Description"
                    placeholder="Enter stack description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                />
                {error && <p className="text-accent-danger text-[13px] mt-1">{error}</p>}
            </form>
        </Modal>
    );
};
