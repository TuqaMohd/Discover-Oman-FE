import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Destination, ItineraryDay } from '@/types/destination';

// Fix Leaflet default marker icon issue in bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface MapViewProps {
  /** Single destination to show */
  destination?: Destination;
  /** Full itinerary days to show routes */
  days?: ItineraryDay[];
  /** Currently active day (0-indexed) */
  activeDay?: number;
  /** Active stop index within the day */
  activeStop?: number;
  /** Height of the map */
  height?: string;
}

const DAY_COLORS = ['#b5651d', '#1a6b6a', '#c4963c', '#8b4513', '#2e8b57', '#cd853f', '#556b2f'];

export default function MapView({
  destination,
  days,
  activeDay = 0,
  activeStop,
  height = '400px',
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    const map = L.map(mapRef.current, {
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    mapInstanceRef.current = map;

    // Single destination mode
    if (destination && !days) {
      map.setView([destination.lat, destination.lng], 13);
      L.marker([destination.lat, destination.lng])
        .addTo(map)
        .bindPopup(`<strong>${destination.name.en}</strong><br/>${destination.name.ar}`);
      return;
    }

    // Itinerary mode
    if (days && days.length > 0) {
      const bounds = L.latLngBounds([]);

      days.forEach((day, dayIdx) => {
        const color = DAY_COLORS[dayIdx % DAY_COLORS.length];
        const isActive = dayIdx === activeDay;
        const opacity = isActive ? 1 : 0.3;

        const points: L.LatLng[] = [];

        day.stops.forEach((stop, stopIdx) => {
          const ll = L.latLng(stop.destination.lat, stop.destination.lng);
          points.push(ll);
          bounds.extend(ll);

          const isActiveStop = isActive && stopIdx === activeStop;

          const marker = L.circleMarker(ll, {
            radius: isActiveStop ? 10 : isActive ? 7 : 5,
            fillColor: isActiveStop ? '#e74c3c' : color,
            color: isActive ? '#fff' : color,
            weight: isActive ? 2 : 1,
            opacity,
            fillOpacity: isActive ? 0.9 : 0.4,
          }).addTo(map);

          marker.bindPopup(
            `<strong>Day ${day.dayNumber} - Stop ${stopIdx + 1}</strong><br/>` +
            `${stop.destination.name.en}<br/>` +
            `<em>${stop.destination.name.ar}</em>`
          );

          if (isActiveStop) {
            marker.openPopup();
          }
        });

        // Draw route polyline
        if (points.length > 1) {
          L.polyline(points, {
            color,
            weight: isActive ? 4 : 2,
            opacity,
            dashArray: isActive ? undefined : '8 4',
          }).addTo(map);
        }
      });

      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [destination, days, activeDay, activeStop]);

  return (
    <div
      ref={mapRef}
      style={{ height, width: '100%' }}
      className="rounded-xl border border-border z-0"
    />
  );
}
