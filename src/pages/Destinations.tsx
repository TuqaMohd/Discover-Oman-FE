import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { destinations } from '@/data/destinations';
import FilterBar from '@/components/destinations/FilterBar';
import DestinationCard from '@/components/destinations/DestinationCard';

export default function Destinations() {
  const { t } = useLanguage();
  const [params, setParams] = useSearchParams();

  const category = params.get('category') || '';
  const region = params.get('region') || '';
  const season = params.get('season') || '';
  const sort = params.get('sort') || 'popularity';

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  let filtered = [...destinations];
  if (category) filtered = filtered.filter(d => d.categories.includes(category as any));
  if (region) filtered = filtered.filter(d => d.region.en.toLowerCase() === region.toLowerCase());
  if (season) filtered = filtered.filter(d => d.recommended_months.includes(Number(season)));

  if (sort === 'popularity') filtered.sort((a, b) => b.crowd_level - a.crowd_level);
  else if (sort === 'cost') filtered.sort((a, b) => a.ticket_cost_omr - b.ticket_cost_omr);

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
          {t('destinations')}
        </h1>

        <FilterBar
          category={category} region={region} season={season} sort={sort}
          onCategoryChange={v => updateParam('category', v)}
          onRegionChange={v => updateParam('region', v)}
          onSeasonChange={v => updateParam('season', v)}
          onSortChange={v => updateParam('sort', v)}
        />

        <p className="text-sm text-muted-foreground mt-4 mb-6">
          {filtered.length} {t('destinations').toLowerCase()}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(d => (
            <DestinationCard key={d.id} destination={d} />
          ))}
        </div>
      </div>
    </div>
  );
}
