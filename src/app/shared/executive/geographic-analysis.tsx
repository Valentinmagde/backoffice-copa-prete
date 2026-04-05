'use client';

import { useState } from 'react';
import WidgetCard from '@core/components/cards/widget-card';
import { Title, Text } from 'rizzui';
import cn from '@core/utils/class-names';
import TrendingUpIcon from '@core/components/icons/trending-up';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { useMedia } from '@core/hooks/use-media';
import { CustomTooltip } from '@core/components/charts/custom-tooltip';
import { CustomYAxisTick } from '@core/components/charts/custom-yaxis-tick';
import { formatNumber } from '@core/utils/format-number';

// Données géographiques simulées
const geographicData = [
    { region: 'Port-Louis', count: 450, percentage: 18.5 },
    { region: 'Curepipe', count: 380, percentage: 15.6 },
    { region: 'Quatre Bornes', count: 320, percentage: 13.1 },
    { region: 'Vacoas', count: 280, percentage: 11.5 },
    { region: 'Beau Bassin', count: 240, percentage: 9.8 },
    { region: 'Moka', count: 200, percentage: 8.2 },
    { region: 'Grand Bay', count: 180, percentage: 7.4 },
    { region: 'Autre', count: 150, percentage: 6.1 },
];

const COLORS = ['#3b82f6', '#8b5cf6', '#ec489a', '#f59e0b', '#10b981', '#06b6d4', '#14b8a6', '#84cc16'];

export default function GeographicAnalysis({ className }: { className?: string }) {
    const isTablet = useMedia('(max-width: 820px)', false);
    const totalCandidates = geographicData.reduce((sum, item) => sum + item.count, 0);

    return (
        <WidgetCard
            title="Analyse Géographique"
            titleClassName="font-normal sm:text-sm text-gray-500 mb-2.5 font-inter"
            className={className}
            description={
                <div className="flex items-center justify-start">
                    <Title as="h2" className="me-2 font-semibold">
                        {totalCandidates.toLocaleString()}
                    </Title>
                    <Text className="flex items-center leading-none text-gray-500">
                        <Text
                            as="span"
                            className={cn(
                                'me-2 inline-flex items-center font-medium text-green'
                            )}
                        >
                            <TrendingUpIcon className="me-1 h-4 w-4" />
                            candidatures
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
                        <BarChart
                            data={geographicData}
                            margin={{ left: -15 }}
                            className="[&_.recharts-tooltip-cursor]:fill-opacity-20 dark:[&_.recharts-tooltip-cursor]:fill-opacity-10 [&_.recharts-cartesian-axis-tick-value]:fill-gray-500 [&_.recharts-cartesian-axis.yAxis]:-translate-y-3 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12 [&_.recharts-cartesian-grid-vertical]:opacity-0"
                        >
                            <CartesianGrid strokeDasharray="8 10" strokeOpacity={0.435} />
                            <XAxis dataKey="region" axisLine={false} tickLine={false} angle={-45} textAnchor="end" height={80} />
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
                            <Bar dataKey="count" barSize={40} radius={[4, 4, 0, 0]}>
                                {geographicData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Tableau récapitulatif */}
            <div className="mt-6 space-y-2">
                <div className="grid grid-cols-2 gap-4 border-b border-muted pb-4 md:grid-cols-4">
                    {geographicData.slice(0, 4).map((item) => (
                        <div key={item.region} className="space-y-1">
                            <Text className="text-xs text-gray-400">{item.region}</Text>
                            <Text className="text-lg font-semibold text-gray-900">
                                {item.count}
                            </Text>
                            <Text className="text-xs text-gray-500">{item.percentage}%</Text>
                        </div>
                    ))}
                </div>
            </div>
        </WidgetCard>
    );
}
