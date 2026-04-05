'use client';

import WidgetCard from '@core/components/cards/widget-card';
import { Text, Title } from 'rizzui';
import cn from '@core/utils/class-names';
import TrendingUpIcon from '@core/components/icons/trending-up';
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { useMedia } from '@core/hooks/use-media';

// Données de distribution
const distributionData = [
    { status: 'Registered', completionRate: 45, count: 250 },
    { status: 'Pending', completionRate: 65, count: 180 },
    { status: 'Validated', completionRate: 90, count: 150 },
    { status: 'Rejected', completionRate: 30, count: 80 },
    { status: 'Registered', completionRate: 50, count: 200 },
    { status: 'Pending', completionRate: 70, count: 160 },
    { status: 'Validated', completionRate: 95, count: 120 },
    { status: 'Registered', completionRate: 55, count: 220 },
];

const statusColors: Record<string, string> = {
    'Registered': '#94a3b8',
    'Pending': '#f59e0b',
    'Validated': '#10b981',
    'Rejected': '#ef4444',
};

export default function CandidateDistribution({ className }: { className?: string }) {
    const isTablet = useMedia('(max-width: 820px)', false);

    const statsPerStatus = {
        Registered: distributionData.filter(d => d.status === 'Registered').reduce((sum, d) => sum + d.count, 0),
        Pending: distributionData.filter(d => d.status === 'Pending').reduce((sum, d) => sum + d.count, 0),
        Validated: distributionData.filter(d => d.status === 'Validated').reduce((sum, d) => sum + d.count, 0),
        Rejected: distributionData.filter(d => d.status === 'Rejected').reduce((sum, d) => sum + d.count, 0),
    };

    const totalCount = Object.values(statsPerStatus).reduce((sum, val) => sum + val, 0);

    return (
        <WidgetCard
            title="Distribution Candidatures - Taux Complétude"
            titleClassName="font-normal sm:text-sm text-gray-500 mb-2.5 font-inter"
            className={className}
            description={
                <div className="flex items-center justify-start">
                    <Title as="h2" className="me-2 font-semibold">
                        {totalCount.toLocaleString()}
                    </Title>
                    <Text className="flex items-center leading-none text-gray-500">
                        <Text
                            as="span"
                            className={cn(
                                'me-2 inline-flex items-center font-medium text-green'
                            )}
                        >
                            <TrendingUpIcon className="me-1 h-4 w-4" />
                            total
                        </Text>
                    </Text>
                </div>
            }
        >
            <div className='custom-scrollbar overflow-x-auto scroll-smooth'>
                <div className="h-96 w-full pt-9">
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                        {...(isTablet && { minWidth: '600px' })}
                    >
                        <ScatterChart
                            margin={{ left: -15, bottom: 20 }}
                            className="[&_.recharts-cartesian-axis-tick-value]:fill-gray-500"
                        >
                            <CartesianGrid strokeDasharray="8 10" strokeOpacity={0.435} />
                            <XAxis
                                type="number"
                                dataKey="completionRate"
                                name="Taux Complétude (%)"
                                unit="%"
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                type="number"
                                dataKey="count"
                                name="Nombre de Candidatures"
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                cursor={{ strokeDasharray: '3 3' }}
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    padding: '8px',
                                }}
                                formatter={(value, name) => {
                                    if (name === 'count') return [value, 'Candidatures'];
                                    return [value, 'Taux (%)'];
                                }}
                            />
                            <Scatter
                                name="Registered"
                                data={distributionData.filter(d => d.status === 'Registered')}
                                fill={statusColors['Registered']}
                            />
                            <Scatter
                                name="Pending"
                                data={distributionData.filter(d => d.status === 'Pending')}
                                fill={statusColors['Pending']}
                            />
                            <Scatter
                                name="Validated"
                                data={distributionData.filter(d => d.status === 'Validated')}
                                fill={statusColors['Validated']}
                            />
                            <Scatter
                                name="Rejected"
                                data={distributionData.filter(d => d.status === 'Rejected')}
                                fill={statusColors['Rejected']}
                            />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Résumé par statut */}
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                {Object.entries(statsPerStatus).map(([status, count]) => (
                    <div
                        key={status}
                        className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                        style={{ borderLeftColor: statusColors[status], borderLeftWidth: '4px' }}
                    >
                        <Text className="text-xs text-gray-600">
                            {status === 'Registered' && 'Enregistré'}
                            {status === 'Pending' && 'En attente'}
                            {status === 'Validated' && 'Validé'}
                            {status === 'Rejected' && 'Rejeté'}
                        </Text>
                        <Text className="text-lg font-bold text-gray-900">{count}</Text>
                        <Text className="text-xs text-gray-500">
                            {((count / totalCount) * 100).toFixed(1)}%
                        </Text>
                    </div>
                ))}
            </div>
        </WidgetCard>
    );
}
