import React from 'react';

const Skeleton = ({ className, ...props }) => {
    return (
        <div
            className={`animate-pulse rounded-md bg-gray-100 ${className}`}
            {...props}
        />
    );
};

export const ProductCardSkeleton = () => (
    <div className="space-y-4">
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <div className="space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
        </div>
    </div>
);

export const OrdersSkeleton = () => (
    <div className="p-6 border border-gray-100 rounded-3xl space-y-4">
        <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-20" />
        </div>
        <div className="flex space-x-4">
            <Skeleton className="h-20 w-20 rounded-xl" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
            </div>
        </div>
    </div>
);

export default Skeleton;
