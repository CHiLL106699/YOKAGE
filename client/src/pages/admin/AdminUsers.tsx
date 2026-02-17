
import React, { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { trpc } from '@/lib/trpc';

// A simple debounce hook
function useDebounce(value: string, delay: number): string {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

const AdminUsers = () => {
    const organizationId = 1; // TODO: from context
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const ITEMS_PER_PAGE = 10;

    const { data: usersData, isLoading } = (trpc as any).listAllUsers.useQuery({
        organizationId,
        page,
        limit: ITEMS_PER_PAGE,
        searchTerm: debouncedSearchTerm,
    }, {
        enabled: !!organizationId,
    });

    return (
        <div>
            {/* Render your user data here */}
            <table>
                <tbody>
                    {isLoading ? (
                        [...Array(ITEMS_PER_PAGE)].map((_, i) => (
                            <tr key={i}>
                                <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell"><Skeleton className="h-5 w-28" /></td>
                                <td className="px-6 py-4 whitespace-nowrap"><Skeleton className="h-6 w-16" /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><Skeleton className="h-8 w-8" /></td>
                            </tr>
                        ))
                    ) : usersData?.users.map((user: any) => (
                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                        <img className="h-10 w-10 rounded-full" src={`https://i.pravatar.cc/150?u=${user.id}`} alt="" />
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-200">{user.name}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminUsers;
