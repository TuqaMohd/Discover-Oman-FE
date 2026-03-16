import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { categoryInfo } from '@/data/destinations';
import type { Destination } from '@/types/destination';
import { MapPin, Clock } from 'lucide-react';
import SaveButton from './SaveButton';

interface DestinationCardProps {
  destination: Destination;
}

export default function DestinationCard({ destination: d }: DestinationCardProps) {
  const { t, bil } = useLanguage();

  // Crowd level dots
  const crowdDots = Array.from({ length: 5 }, (_, i) => (
    <span
      key={i}
      className={`crowd-dot ${i < d.crowd_level ? 'crowd-dot-active' : 'crowd-dot-inactive'}`}
    />
  ));

  return (
    <Link to={`/destination/${d.id}`} className="destination-card block">
      {/* Header bar */}
      <div className="h-3 bg-gradient-copper" />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-display text-lg font-semibold text-foreground leading-tight">
              {bil(d.name)}
            </h3>
            <span className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <MapPin className="w-3.5 h-3.5" />
              {bil(d.region)}
            </span>
          </div>
          <SaveButton destinationId={d.id} />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {d.categories.map(cat => (
            <span
              key={cat}
              className="text-xs px-2 py-0.5 rounded-full bg-sand text-foreground"
            >
              {categoryInfo[cat].emoji} {t(cat === 'food' ? 'food_cat' : cat as any)}
            </span>
          ))}
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            {d.avg_visit_duration_minutes >= 60
              ? `${Math.round(d.avg_visit_duration_minutes / 60)}h`
              : `${d.avg_visit_duration_minutes}m`}
          </span>
          <span className="text-copper font-semibold">
            {d.ticket_cost_omr === 0 ? t('free') : `${d.ticket_cost_omr} OMR`}
          </span>
        </div>

        {/* Crowd level */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs text-muted-foreground">{t('crowdLevel')}</span>
          <div className="flex gap-1">{crowdDots}</div>
        </div>
      </div>
    </Link>
  );
}
