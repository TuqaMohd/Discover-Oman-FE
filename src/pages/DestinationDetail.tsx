import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { getById, categoryInfo } from '@/data/destinations';
import MapView from '@/components/map/MapView';
import SaveButton from '@/components/destinations/SaveButton';
import { ArrowLeft, Clock, MapPin, Ticket, Users } from 'lucide-react';

export default function DestinationDetail() {
  const { id } = useParams<{ id: string }>();
  const { t, bil } = useLanguage();
  const dest = getById(id || '');

  if (!dest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Destination not found.</p>
      </div>
    );
  }

  const durationText = dest.avg_visit_duration_minutes >= 60
    ? `${Math.round(dest.avg_visit_duration_minutes / 60)} ${t('hours')}`
    : `${dest.avg_visit_duration_minutes} ${t('minutes')}`;

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link to="/destinations" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-copper mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {t('backToDestinations')}
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              {bil(dest.name)}
            </h1>
            <p className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {bil(dest.region)} · {bil(dest.company)}
            </p>
          </div>
          <SaveButton destinationId={dest.id} showLabel />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-card border border-border text-center">
            <Clock className="w-5 h-5 text-copper mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{t('visitDuration')}</p>
            <p className="font-semibold text-foreground">{durationText}</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border text-center">
            <Ticket className="w-5 h-5 text-copper mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{t('ticketCost')}</p>
            <p className="font-semibold text-foreground">
              {dest.ticket_cost_omr === 0 ? t('free') : `${dest.ticket_cost_omr} OMR`}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border text-center">
            <Users className="w-5 h-5 text-copper mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{t('crowdLevel')}</p>
            <div className="flex gap-1 justify-center mt-1">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className={`crowd-dot ${i < dest.crowd_level ? 'crowd-dot-active' : 'crowd-dot-inactive'}`} />
              ))}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border text-center">
            <span className="text-xl block mb-1">📅</span>
            <p className="text-sm text-muted-foreground">{t('recommendedMonths')}</p>
            <p className="font-semibold text-foreground text-sm">
              {dest.recommended_months.map(m => t(`month${m}` as any).substring(0, 3)).join(', ')}
            </p>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {dest.categories.map(cat => (
            <span key={cat} className="px-3 py-1.5 rounded-full bg-sand text-foreground text-sm font-medium">
              {categoryInfo[cat].emoji} {cat === 'food' ? t('food_cat') : t(cat as any)}
            </span>
          ))}
        </div>

        {/* Generated Description */}
        <div className="prose prose-warm mb-8">
          <p className="text-muted-foreground leading-relaxed">
            {bil(dest.name)} is a remarkable {dest.categories.join(' and ')} destination located in the {bil(dest.region)} region of Oman.
            {dest.ticket_cost_omr === 0 ? ' Entry is free, making it accessible to all visitors.' : ` Tickets are priced at ${dest.ticket_cost_omr} OMR.`}
            {' '}Plan approximately {durationText} for your visit.
            {dest.crowd_level >= 4 ? ' This is a popular destination — consider visiting during off-peak hours.' : ''}
            {dest.recommended_months.length > 0 ? ` Best visited during ${dest.recommended_months.map(m => t(`month${m}` as any)).join(', ')}.` : ''}
          </p>
        </div>

        {/* Map */}
        <div className="mb-8">
          <MapView destination={dest} height="350px" />
        </div>
      </div>
    </div>
  );
}
