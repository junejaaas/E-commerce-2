import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';
import { useNavigate } from 'react-router-dom';

const EmptyState = ({ 
    icon: Icon = PackageOpen, 
    title, 
    description, 
    actionLabel, 
    actionPath 
}) => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="bg-gray-50 p-6 rounded-full mb-6">
                <Icon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500 max-w-sm mb-8">{description}</p>
            {actionLabel && actionPath && (
                <Button onClick={() => navigate(actionPath)}>
                    {actionLabel}
                </Button>
            )}
        </div>
    );
};

export default EmptyState;
