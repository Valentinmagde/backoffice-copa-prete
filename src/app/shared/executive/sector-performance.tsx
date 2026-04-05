'use client';

import WidgetCard from '@core/components/cards/widget-card';
import { Title, Text } from 'rizzui';
import cn from '@core/utils/class-names';
import TrendingUpIcon from '@core/components/icons/trending-up';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { useMedia } from '@core/hooks/use-media';
import { CustomTooltip } from '@core/components/charts/custom-tooltip';
import { CustomYAxisTick } from '@core/components/charts/custom-yaxis-tick';
import { formatNumber } from '@core/utils/format-number';

// Données de performance par secteur
const sectorPerformanceData = [
    { month: 'Jan', tech: 120, health: 90, education: 60, finance: 85 },
    { month: 'Feb', tech: 145, health: 105, education: 75, finance: 95 },
    { month: 'Mar', tech: 165, health: 120, education: 85, finance: 110 },
    { month: 'Apr', tech: 185, health: 135, education: 95, finance: 125 },
    { month: 'May', tech: 210, health: 150, education: 110, finance: 140 },
    { month: 'Jun', tech: 235, health: 168, education: 128, finance: 158 },
];

const SECTOR_COLORS = {
    tech: '#3b82f6',
    health: '#10b981',
    education: '#f59e0b',
    finance: '#ec489a',
};

export default function SectorPerformance({ className }: { className?: string }) {
    const isTablet = useMedia('(max-width: 820px)', false);

    const latestData = sectorPerformanceData[sectorPerformanceData.length - 1];
    const totalLatest = Object.values(latestData).reduce((sum: number, val: any) =>
        typeof val === 'number' ? sum + val : sum, 0);

    return (
        <WidgetCard
            title="Performance par Secteur"
            titleClassName="font-normal sm:text-sm text-gray-500 mb-2.5 font-inter"
            className={className}
            description={
                <div className="flex items-center justify-start">
                    <Title as="h2" className="me-2 font-semibold">
                        {totalLatest.toLocaleString()}
                    </Title>
                    <Text className="flex items-center leading-none text-gray-500">
                        <Text
                            as="span"
                            className={cn(
                                'me-2 inline-flex items-center font-medium text-green'
                            )}
                        >
                            <TrendingUpIcon className="me-1 h-4 w-4" />
                            candidats
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
                        <LineChart
                            data={sectorPerformanceData}
                            margin={{ left: -15 }}
                            className="[&_.recharts-tooltip-cursor]:fill-opacity-20 dark:[&_.recharts-tooltip-cursor]:fill-opacity-10 [&_.recharts-cartesian-axis-tick-value]:fill-gray-500"
                        >
                            <CartesianGrid strokeDasharray="8 10" strokeOpacity={0.435} />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={({ payload, ...rest }) => {
                                    const pl = {
                                        ...payload,
                                        value: formatNumber(Number(payload.value)),
                                    };
                                    return <CustomYAxisTick payload={pl} {...rest} />;
                                }}
                            />
                            <Tooltip content={<CustomTooltip formattedNumber />} />
                            <Legend
                                wrapperClassName="pt-4"
                                formatter={(value) => {
                                    const labels: Record<string, string> = {
                                        tech: 'Technologie',
                                        health: 'Santé',
                                        education: 'Éducation',
                                        finance: 'Finance',
                                    };
                                    return labels[value as keyof typeof labels] || value;
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="tech"
                                stroke={SECTOR_COLORS.tech}
                                strokeWidth={2}
                                dot={false}
                                name="tech"
                            />
                            <Line
                                type="monotone"
                                dataKey="health"
                                stroke={SECTOR_COLORS.health}
                                strokeWidth={2}
                                dot={false}
                                name="health"
                            />
                            <Line
                                type="monotone"
                                dataKey="education"
                                stroke={SECTOR_COLORS.education}
                                strokeWidth={2}
                                dot={false}
                                name="education"
                            />
                            <Line
                                type="monotone"
                                dataKey="finance"
                                stroke={SECTOR_COLORS.finance}
                                strokeWidth={2}
                                dot={false}
                                name="finance"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Statistiques par secteur */}
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="space-y-1 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                    <Text className="text-xs text-blue-600">Technologie</Text>
                    <Text className="text-lg font-bold text-blue-900">{latestData.tech}</Text>
                </div>
                <div className="space-y-1 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                    <Text className="text-xs text-green-600">Santé</Text>
                    <Text className="text-lg font-bold text-green-900">{latestData.health}</Text>
                </div>
                <div className="space-y-1 rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
                    <Text className="text-xs text-amber-600">Éducation</Text>
                    <Text className="text-lg font-bold text-amber-900">{latestData.education}</Text>
                </div>
                <div className="space-y-1 rounded-lg bg-pink-50 p-3 dark:bg-pink-900/20">
                    <Text className="text-xs text-pink-600">Finance</Text>
                    <Text className="text-lg font-bold text-pink-900">{latestData.finance}</Text>
                </div>
            </div>
        </WidgetCard>
    );
}
