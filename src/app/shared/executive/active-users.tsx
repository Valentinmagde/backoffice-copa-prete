// app/shared/executive/active-users.tsx
'use client';

import { useEffect, useState } from 'react';
import WidgetCard from '@core/components/cards/widget-card';
import { useElementSize } from '@core/hooks/use-element-size';
import { Badge, Text, Loader } from 'rizzui';
import cn from '@core/utils/class-names';
import { useMedia } from '@core/hooks/use-media';
import { useRegionalInscriptions } from '@/lib/api/hooks/use-dashboard';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';

// URL du GeoJSON du monde
const WORLD_GEO_URL = "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";

// Coordonnées des provinces du Burundi (longitude, latitude)
const provincesCoordinates: Record<string, [number, number]> = {
  'Buhumuza': [30.2, -3.0],
  'Bujumbura': [29.35, -3.36],
  'Burunga': [29.7, -3.9],
  'Butanyerera': [29.9, -2.8],
  'Gitega': [29.93, -3.43],
};

// Centre du Burundi pour le zoom
const BURUNDI_CENTER: [number, number] = [29.8, -3.5];
const BURUNDI_SCALE = 10000;

const formaterValeur = (valeur: number | undefined | null): string => {
  if (valeur === undefined || valeur === null || isNaN(valeur)) return '0';
  return valeur.toLocaleString();
};

export default function ActiveUsers({ className }: { className?: string }) {
  const [ref, { width }] = useElementSize();
  const [isLoading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const isMobile = useMedia('(max-width: 768px)', false);
  const { data: regions, isLoading: regionsLoading } = useRegionalInscriptions();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (regionsLoading || isLoading) {
    return (
      <WidgetCard
        title="Inscriptions par province"
        className={cn('relative grid grid-cols-1 place-content-between gap-3', className)}
        titleClassName="font-semibold"
      >
        <div className="flex items-center justify-center h-96">
          <Loader variant="spinner" size="lg" />
        </div>
      </WidgetCard>
    );
  }

  // Créer un map des inscriptions par province
  const inscriptionsMap: Record<string, number> = {};
  regions?.forEach(region => {
    inscriptionsMap[region.province] = region.inscriptions || 0;
  });

  const totalInscriptions = regions?.reduce((sum, r) => sum + (r.inscriptions || 0), 0) || 0;

  const getMarkerSize = (inscriptions: number): number => {
    if (inscriptions === 0) return 5;
    return Math.min(22, 7 + (inscriptions / totalInscriptions) * 15);
  };

  const getMarkerColor = (inscriptions: number): string => {
    if (inscriptions === 0) return '#9ca3af';
    if (inscriptions < 5) return '#60a5fa';
    if (inscriptions < 15) return '#3b82f6';
    return '#2563eb';
  };

  return (
    <WidgetCard
      title="Inscriptions par province"
      className={cn('relative grid grid-cols-1 place-content-between gap-3', className)}
      titleClassName="font-semibold"
    >
      <div
        ref={ref}
        className="col-span-full flex flex-col [&>figure]:flex [&>figure]:items-center [&>figure]:justify-center [&_figure]:!bg-transparent [&_svg]:dark:invert"
      >
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: isMobile ? BURUNDI_SCALE * 0.8 : BURUNDI_SCALE,
            center: BURUNDI_CENTER,
          }}
          width={width || 800}
          height={isMobile ? 350 : 450}
          className="rounded-lg"
        >
          <ZoomableGroup center={BURUNDI_CENTER}
            zoom={zoom}
            onMoveEnd={(position) => {
              setZoom(position.zoom);
            }}>
            <Geographies geography={WORLD_GEO_URL}>
              {({ geographies }) =>
                geographies
                  .filter(geo => geo.properties.name === 'Burundi') // Filtrer uniquement le Burundi
                  .map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#e5e7eb"
                      stroke="#3b82f6"
                      strokeWidth={1.5}
                      style={{
                        default: { outline: 'none' },
                        hover: { fill: '#d1d5db', outline: 'none' },
                        pressed: { outline: 'none' },
                      }}
                    />
                  ))
              }
            </Geographies>

            {/* Marqueurs pour les provinces */}
            {Object.entries(provincesCoordinates).map(([province, coordinates]) => {
              const inscriptions = inscriptionsMap[province] || 0;
              return (
                <Marker key={province} coordinates={[coordinates[0], coordinates[1]]}>
                  <circle
                    r={getMarkerSize(inscriptions)}
                    fill={getMarkerColor(inscriptions)}
                    stroke="#ffffff"
                    strokeWidth={1.5}
                    className="cursor-pointer transition-all hover:r-8"
                  />
                  {inscriptions > 0 && (
                    <text
                      textAnchor="middle"
                      y={-10}
                      fontSize="11"
                      fontWeight="bold"
                      fill="#1f2937"
                      className="dark:fill-gray-200"
                    >
                      {inscriptions}
                    </text>
                  )}
                  <text
                    textAnchor="middle"
                    y={-22}
                    fontSize="9"
                    fill="#6b7280"
                    className="dark:fill-gray-400"
                  >
                    {province}
                  </text>
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>
      </div>
      <div className="absolute right-4 top-4 flex flex-col gap-2 z-10">
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.5, 5))}
          className="bg-white shadow px-3 py-1 rounded text-lg"
        >
          +
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.5, 1))}
          className="bg-white shadow px-3 py-1 rounded text-lg"
        >
          -
        </button>
      </div>

      <div className="col-span-full -mx-5 border-t border-dashed border-muted px-5 pt-5 lg:-mx-7 lg:px-7 dark:invert">
        <div className="mx-auto flex w-full max-w-md flex-wrap justify-center gap-x-3 gap-y-1.5 text-center">
          <div className="flex items-center gap-1">
            <Badge renderAsDot className="bg-blue-600" />
            <Text className="text-gray-500 dark:text-gray-600">
              Total inscriptions
              <Text
                as="span"
                className="ms-1 font-lexend font-medium text-gray-700"
              >
                {formaterValeur(totalInscriptions)}
              </Text>
            </Text>
          </div>
        </div>

        {/* Légende des couleurs */}
        <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-gray-400" />
            <Text className="text-xs text-gray-500">0 inscription</Text>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-blue-400" />
            <Text className="text-xs text-gray-500">1-4 inscriptions</Text>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-blue-600" />
            <Text className="text-xs text-gray-500">5-14 inscriptions</Text>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-blue-800" />
            <Text className="text-xs text-gray-500">15+ inscriptions</Text>
          </div>
        </div>

        {/* Liste des provinces */}
        <div className="mt-4 flex flex-wrap justify-center gap-x-3 gap-y-2">
          {regions?.map((region) => (
            <div key={region.province} className="flex items-center gap-1">
              <Badge
                renderAsDot
                className={cn(
                  region.inscriptions === 0 ? 'bg-gray-400' :
                    region.inscriptions < 5 ? 'bg-blue-400' :
                      region.inscriptions < 15 ? 'bg-blue-600' : 'bg-blue-800'
                )}
              />
              <Text className="text-xs text-gray-500">
                {region.province}
                <Text as="span" className="ms-1 font-medium text-gray-700">
                  {formaterValeur(region.inscriptions)}
                </Text>
              </Text>
            </div>
          ))}
        </div>
      </div>
    </WidgetCard>
  );
}