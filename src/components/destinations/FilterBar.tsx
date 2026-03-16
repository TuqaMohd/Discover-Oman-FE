import { useLanguage } from '@/contexts/LanguageContext';
import { categories, regions } from '@/data/destinations';
import type { Category } from '@/types/destination';

interface FilterBarProps {
  category: string;
  region: string;
  season: string;
  sort: string;
  onCategoryChange: (v: string) => void;
  onRegionChange: (v: string) => void;
  onSeasonChange: (v: string) => void;
  onSortChange: (v: string) => void;
}

export default function FilterBar({
  category, region, season, sort,
  onCategoryChange, onRegionChange, onSeasonChange, onSortChange,
}: FilterBarProps) {
  const { t } = useLanguage();

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const selectClass = "px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-copper/50 transition-all";

  return (
    <div className="flex flex-wrap gap-3 items-center p-4 rounded-xl bg-card border border-border">
      {/* Category Filter */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">{t('filterByCategory')}</label>
        <select value={category} onChange={e => onCategoryChange(e.target.value)} className={selectClass}>
          <option value="">{t('allCategories')}</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {t(cat === 'food' ? 'food_cat' : cat as any)}
            </option>
          ))}
        </select>
      </div>

      {/* Region Filter */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">{t('filterByRegion')}</label>
        <select value={region} onChange={e => onRegionChange(e.target.value)} className={selectClass}>
          <option value="">{t('allRegions')}</option>
          {regions.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* Season Filter */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">{t('filterBySeason')}</label>
        <select value={season} onChange={e => onSeasonChange(e.target.value)} className={selectClass}>
          <option value="">{t('allSeasons')}</option>
          {months.map(m => (
            <option key={m} value={m}>
              {t(`month${m}` as any)}
            </option>
          ))}
        </select>
      </div>

      {/* Sort */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">{t('sortBy')}</label>
        <select value={sort} onChange={e => onSortChange(e.target.value)} className={selectClass}>
          <option value="popularity">{t('popularity')}</option>
          <option value="cost">{t('cost')}</option>
        </select>
      </div>
    </div>
  );
}
