import React from 'react';

const LoadingSpinner = ({ fullPage = false, size = 'md' }) => {
    const sizeClasses = {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-3',
        lg: 'h-12 w-12 border-4'
    };

    const spinner = (
        <div className="flex items-center justify-center">
            <div className={`${sizeClasses[size]} animate-spin rounded-full border-primary-600 border-t-transparent`}></div>
        </div>
    );

    if (fullPage) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                {spinner}
            </div>
        );
    }

    return spinner;
};

export default LoadingSpinner;
