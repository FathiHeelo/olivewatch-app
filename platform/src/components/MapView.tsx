// Map of the Nablus area: Leaflet + OpenStreetMap tiles (with attribution). If the tiles cannot be loaded
// (blocked or offline) it switches to a plain SVG schematic of the same points.
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';

export type MapPoint = { id: string; name: string; lat: number; lng: number; color: string; csi: number };

function Schematic({ points }: { points: MapPoint[] }) {
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const [minLat, maxLat, minLng, maxLng] = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)];
  const W = 640;
  const H = 360;
  const x = (lng: number) => 60 + ((lng - minLng) / (maxLng - minLng || 1)) * (W - 120);
  const y = (lat: number) => H - 50 - ((lat - minLat) / (maxLat - minLat || 1)) * (H - 100);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="map-schematic" role="img" aria-label="مخطط تقريبي لمواقع القرى حول نابلس">
      <rect width={W} height={H} fill="var(--raised)" />
      {points.map((p) => (
        <g key={p.id}>
          <circle cx={x(p.lng)} cy={y(p.lat)} r="9" fill={p.color} />
          <text x={x(p.lng)} y={y(p.lat) - 16} textAnchor="middle" className="axis-text">
            {p.name}
          </text>
        </g>
      ))}
      <text x={W - 12} y={H - 12} textAnchor="end" className="axis-text">
        مخطط تقريبي — تعذّر تحميل الخريطة
      </text>
    </svg>
  );
}

export default function MapView({ points }: { points: MapPoint[] }) {
  const host = useRef<HTMLDivElement>(null);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el || points.length === 0) return;
    const map = L.map(el, { scrollWheelZoom: false }).setView([32.2, 35.25], 10);
    let loaded = 0;
    let failed = 0;
    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });
    tiles.on('tileload', () => loaded++);
    tiles.on('tileerror', () => {
      failed++;
      if (failed >= 3 && loaded === 0) setBroken(true);
    });
    tiles.addTo(map);
    const group = L.featureGroup(
      points.map((p) =>
        L.circleMarker([p.lat, p.lng], { radius: 9, color: '#ffffff', weight: 2, fillColor: p.color, fillOpacity: 1 }).bindTooltip(`${p.name} · ${p.csi.toFixed(1)}`),
      ),
    ).addTo(map);
    map.fitBounds(group.getBounds().pad(0.3));
    return () => {
      map.remove();
    };
  }, [points]);

  if (broken) return <Schematic points={points} />;
  return <div ref={host} className="map" dir="ltr" role="img" aria-label="خريطة قرى الموردين حول نابلس" />;
}
