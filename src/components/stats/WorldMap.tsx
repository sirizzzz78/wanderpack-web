import { useMemo, useState, useRef, useCallback } from 'react';
import { geoNaturalEarth1, geoPath, type GeoPermissibleObjects } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { FeatureCollection, Feature, Geometry } from 'geojson';
import topology from 'world-atlas/countries-110m.json';
import { isoToContinentMap } from '../../lib/isoToContinentMap';

interface TripPin {
  latitude: number;
  longitude: number;
  label: string;
}

interface WorldMapProps {
  visitedContinents: string[];
  countriesCount: number;
  tripPins?: TripPin[];
}

const WIDTH = 420;
const HEIGHT = 260;

interface CountryFeature extends Feature<Geometry> {
  id?: string;
}

export function WorldMap({ visitedContinents, countriesCount, tripPins = [] }: WorldMapProps) {
  const visitedSet = new Set(visitedContinents);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { projection, pathGen, countries } = useMemo(() => {
    const topo = topology as unknown as Topology<{ countries: GeometryCollection }>;
    const geo = feature(topo, topo.objects.countries) as FeatureCollection<Geometry>;
    const feats = geo.features as CountryFeature[];

    const sphere: GeoPermissibleObjects = { type: 'Sphere' };
    const proj = geoNaturalEarth1().fitSize([WIDTH, HEIGHT], sphere);
    const gen = geoPath(proj);

    return {
      projection: proj,
      pathGen: gen,
      countries: feats,
    };
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => {
      const next = Math.min(Math.max(prev * delta, 1), 5);
      if (next === 1) setTranslate({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (scale <= 1) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: translate.x, origY: translate.y };
  }, [scale, translate]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setTranslate({ x: dragRef.current.origX + dx, y: dragRef.current.origY + dy });
  }, []);

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const handleDoubleClick = useCallback(() => {
    if (scale > 1) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
    } else {
      setScale(2.5);
    }
  }, [scale]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-[20px] overflow-hidden relative"
      style={{ backgroundColor: 'var(--blue-tint)', aspectRatio: '16 / 10', touchAction: 'none' }}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDoubleClick={handleDoubleClick}
    >
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-full relative"
        role="img"
        aria-label={`World map showing ${countriesCount} countries visited`}
        style={{
          transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
          transformOrigin: 'center center',
          transition: dragRef.current ? 'none' : 'transform 0.2s ease-out',
        }}
      >
        {/* Country paths */}
        {countries.map((f, i) => {
          const continent = f.id ? isoToContinentMap[f.id] : undefined;
          const isVisited = continent ? visitedSet.has(continent) : false;
          const d = pathGen(f as GeoPermissibleObjects);
          if (!d) return null;
          return (
            <path
              key={f.id ?? i}
              d={d}
              fill="var(--blue-pale)"
              opacity={isVisited ? 0.35 : 0.28}
              stroke={isVisited ? 'var(--lavender)' : 'var(--blue-faint)'}
              strokeWidth={isVisited ? 0.75 : 0.5}
              strokeOpacity={isVisited ? 1 : 0.7}
            />
          );
        })}

      </svg>

      {/* Trip city pins — outside SVG so they don't scale with zoom */}
      {tripPins.map((pin, i) => {
        const pt = projection([pin.longitude, pin.latitude]);
        if (!pt) return null;
        const pctX = pt[0] / WIDTH;
        const pctY = pt[1] / HEIGHT;
        return (
          <div
            key={`pin-${i}`}
            style={{
              position: 'absolute',
              left: `${((pctX - 0.5) * scale + 0.5) * 100 + (translate.x / (containerRef.current?.offsetWidth ?? 1)) * 100}%`,
              top: `${((pctY - 0.5) * scale + 0.5) * 100 + (translate.y / (containerRef.current?.offsetHeight ?? 1)) * 100}%`,
              transform: 'translate(-50%, -100%)',
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: 'var(--salmon)' }} />
            <div style={{ width: 1.5, height: 6, backgroundColor: 'var(--salmon)', borderRadius: 1 }} />
          </div>
        );
      })}

      {/* Coverage text — bottom left */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: 20,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 1.5,
            color: 'var(--lavender)',
            fontFamily: 'var(--font-family)',
            marginBottom: 2,
          }}
        >
          Countries Visited
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span
            style={{
              fontSize: 'var(--text-hero)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-family)',
              lineHeight: 1,
            }}
          >
            {countriesCount}
          </span>
          <span
            style={{
              fontSize: 'var(--text-body-sm)',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-family)',
            }}
          >
            {countriesCount === 1 ? 'country' : 'countries'}
          </span>
        </div>
      </div>
    </div>
  );
}
