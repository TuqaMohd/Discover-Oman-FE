import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { categories as allCategories, destinations, getById } from '@/data/destinations';
import { getSavedInterests, saveTripPreferences, getTripPreferences, saveGeneratedPlan, getGeneratedPlan } from '@/lib/persistence';
import { generateItinerary } from '@/lib/planner';
import MapView from '@/components/map/MapView';
import type { TripPreferences, GeneratedItinerary, BudgetTier, Intensity, Category } from '@/types/destination';
import { MapPin, Clock, Route, DollarSign, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export default function PlanTrip() {
  const { t, bil } = useLanguage();

  // Load saved state
  const savedPrefs = getTripPreferences();
  const savedPlan = getGeneratedPlan();
  const savedInterests = getSavedInterests();

  // Derive preferred categories from saved interests
  const interestCategories = useMemo(() => {
    const cats = new Set<Category>();
    savedInterests.forEach(id => {
      const d = getById(id);
      d?.categories.forEach(c => cats.add(c));
    });
    return [...cats];
  }, [savedInterests]);

  const [days, setDays] = useState(savedPrefs?.days || 3);
  const [budget, setBudget] = useState<BudgetTier>(savedPrefs?.budget || 'medium');
  const [month, setMonth] = useState(savedPrefs?.month || new Date().getMonth() + 1);
  const [intensity, setIntensity] = useState<Intensity>(savedPrefs?.intensity || 'balanced');
  const [selectedCats, setSelectedCats] = useState<Category[]>(
    savedPrefs?.categories || (interestCategories.length > 0 ? interestCategories : ['culture', 'nature'])
  );
  const [plan, setPlan] = useState<GeneratedItinerary | null>(savedPlan);
  const [activeDay, setActiveDay] = useState(0);
  const [activeStop, setActiveStop] = useState<number | undefined>(undefined);

  const toggleCat = (cat: Category) => {
    setSelectedCats(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleGenerate = () => {
    const prefs: TripPreferences = { days, budget, month, intensity, categories: selectedCats };
    saveTripPreferences(prefs);
    const result = generateItinerary(prefs);
    setPlan(result);
    saveGeneratedPlan(result);
    setActiveDay(0);
    setActiveStop(undefined);
  };

  // Persist on unmount
  useEffect(() => {
    return () => {
      const prefs: TripPreferences = { days, budget, month, intensity, categories: selectedCats };
      saveTripPreferences(prefs);
    };
  }, [days, budget, month, intensity, selectedCats]);

  const selectClass = "px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-copper/50";

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
          {t('planTrip')}
        </h1>

        {savedInterests.length > 0 && (
          <p className="text-sm text-muted-foreground mb-6">
            {t('savedInterests')}: {savedInterests.length} {t('destinations').toLowerCase()}
          </p>
        )}

        {/* Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-5 rounded-xl bg-card border border-border mb-8">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">{t('tripDuration')}</label>
            <select value={days} onChange={e => setDays(Number(e.target.value))} className={selectClass}>
              {[1,2,3,4,5,6,7].map(d => (
                <option key={d} value={d}>{d} {t('days')}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">{t('budgetTier')}</label>
            <select value={budget} onChange={e => setBudget(e.target.value as BudgetTier)} className={selectClass}>
              <option value="low">{t('low')}</option>
              <option value="medium">{t('medium')}</option>
              <option value="luxury">{t('luxury')}</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">{t('travelMonth')}</label>
            <select value={month} onChange={e => setMonth(Number(e.target.value))} className={selectClass}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{t(`month${i + 1}` as any)}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">{t('travelIntensity')}</label>
            <select value={intensity} onChange={e => setIntensity(e.target.value as Intensity)} className={selectClass}>
              <option value="relaxed">{t('relaxed')}</option>
              <option value="balanced">{t('balanced')}</option>
              <option value="packed">{t('packed')}</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 lg:col-span-1">
            <label className="text-xs font-medium text-muted-foreground">{t('preferredCategories')}</label>
            <div className="flex flex-wrap gap-1.5">
              {allCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => toggleCat(cat)}
                  className={`text-xs px-2 py-1 rounded-full border transition-all ${
                    selectedCats.includes(cat)
                      ? 'bg-copper text-primary-foreground border-copper'
                      : 'bg-background text-muted-foreground border-border hover:border-copper'
                  }`}
                >
                  {cat === 'food' ? t('food_cat') : t(cat as any)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={handleGenerate} className="btn-primary-copper text-base mb-10">
          {t('generateItinerary')}
        </button>

        {/* Generated Plan */}
        {plan && (
          <div className="space-y-8">
            {/* Region Plan */}
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">{t('regionPlan')}</h2>
              <div className="flex flex-wrap gap-3">
                {plan.regionPlan.map((rp, i) => (
                  <div key={i} className="px-4 py-3 rounded-xl bg-card border border-border">
                    <p className="font-semibold text-foreground">{bil(rp.region)}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('day')} {rp.startDay}{rp.endDay !== rp.startDay ? `–${rp.endDay}` : ''} ({rp.days} {t('days')})
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Map */}
            <MapView days={plan.days} activeDay={activeDay} activeStop={activeStop} height="450px" />

            {/* Day Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {plan.days.map((day, i) => (
                <button
                  key={i}
                  onClick={() => { setActiveDay(i); setActiveStop(undefined); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeDay === i
                      ? 'bg-copper text-primary-foreground'
                      : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t('day')} {day.dayNumber} — {bil(day.region)}
                </button>
              ))}
            </div>

            {/* Active Day Itinerary */}
            {plan.days[activeDay] && (
              <div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1"><Route className="w-4 h-4" /> {plan.days[activeDay].totalKm} {t('kmDriven')}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {Math.round(plan.days[activeDay].totalVisitMinutes / 60)}h {t('visitDuration').toLowerCase()}</span>
                  <span>{plan.days[activeDay].stops.length} {t('stops')}</span>
                </div>

                <div className="space-y-4">
                  {plan.days[activeDay].stops.map((stop, si) => (
                    <div
                      key={stop.destination.id}
                      onClick={() => setActiveStop(si)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        activeStop === si
                          ? 'border-copper bg-copper/5 shadow-warm'
                          : 'border-border bg-card hover:border-copper/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-copper">#{si + 1}</span>
                            <h4 className="font-display font-semibold text-foreground">
                              {bil(stop.destination.name)}
                            </h4>
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                            <span>{t('arrivalTime')}: {stop.arrivalTime}</span>
                            <span>{t('departureTime')}: {stop.departureTime}</span>
                            <span>{stop.visitDuration} {t('minutes')}</span>
                            {stop.distanceFromPrev > 0 && (
                              <span>{t('distFrom')}: {stop.distanceFromPrev} km</span>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-copper font-medium">
                          {stop.destination.ticket_cost_omr === 0 ? t('free') : `${stop.destination.ticket_cost_omr} OMR`}
                        </span>
                      </div>
                      {/* Score explanation */}
                      <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                        <Info className="w-3 h-3" />
                        <span>{t('whySelected')}: {stop.scoreExplanation.join(' · ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cost Breakdown */}
            <div className="p-5 rounded-xl bg-card border border-border">
              <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-copper" />
                {t('costBreakdown')}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">{t('fuel')}</p>
                  <p className="font-semibold text-foreground">{plan.costBreakdown.fuel} OMR</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">{t('tickets')}</p>
                  <p className="font-semibold text-foreground">{plan.costBreakdown.tickets} OMR</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">{t('food')}</p>
                  <p className="font-semibold text-foreground">{plan.costBreakdown.food} OMR</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">{t('hotel')}</p>
                  <p className="font-semibold text-foreground">{plan.costBreakdown.hotel} OMR</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">{t('total')}</p>
                  <p className="font-bold text-lg text-copper">{plan.costBreakdown.total} OMR</p>
                </div>
              </div>
              <div className={`flex items-center gap-2 text-sm font-medium ${
                plan.costBreakdown.withinBudget ? 'text-teal' : 'text-destructive'
              }`}>
                {plan.costBreakdown.withinBudget
                  ? <><CheckCircle className="w-4 h-4" /> {t('withinBudget')} ({plan.costBreakdown.budgetThreshold} OMR)</>
                  : <><AlertTriangle className="w-4 h-4" /> {t('overBudget')} ({plan.costBreakdown.budgetThreshold} OMR)</>
                }
              </div>
            </div>

            {/* Total Distance */}
            <div className="text-center text-sm text-muted-foreground">
              {t('totalDistance')}: <span className="font-semibold text-foreground">{plan.totalKm} km</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
