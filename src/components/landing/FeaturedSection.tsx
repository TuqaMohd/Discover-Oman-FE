import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { destinations, categoryInfo } from '@/data/destinations';
import { motion } from 'framer-motion';
import { MapPin, Clock } from 'lucide-react';
import SaveButton from '@/components/destinations/SaveButton';

/** Featured destinations: top crowd-level destinations with good category spread */
function getFeatured() {
  // Pick top destinations ensuring category variety
  const seen = new Set<string>();
  const featured: typeof destinations = [];

  // Sort by crowd_level desc (most popular)
  const sorted = [...destinations].sort((a, b) => b.crowd_level - a.crowd_level);

  for (const d of sorted) {
    if (featured.length >= 6) break;
    // Prefer unseen categories
    const newCat = d.categories.some(c => !seen.has(c));
    if (newCat || featured.length < 3) {
      featured.push(d);
      d.categories.forEach(c => seen.add(c));
    }
  }

  return featured;
}

export default function FeaturedSection() {
  const { t, bil } = useLanguage();
  const featured = getFeatured();

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            {t('featuredTitle')}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t('featuredSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {featured.map((dest, i) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="destination-card"
            >
              {/* Category gradient header */}
              <div className="h-40 bg-gradient-copper relative flex items-end p-5">
                <div className="absolute top-3 end-3">
                  <SaveButton destinationId={dest.id} />
                </div>
                <div className="flex gap-2">
                  {dest.categories.map(cat => (
                    <span
                      key={cat}
                      className="text-sm px-2 py-0.5 rounded-full bg-background/20 text-primary-foreground backdrop-blur-sm"
                    >
                      {categoryInfo[cat].emoji} {t(cat === 'food' ? 'food_cat' : cat as any)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  {bil(dest.name)}
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {bil(dest.region)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {dest.avg_visit_duration_minutes} {t('minutes')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-copper font-semibold">
                    {dest.ticket_cost_omr === 0 ? t('free') : `${dest.ticket_cost_omr} OMR`}
                  </span>
                  <Link
                    to={`/destination/${dest.id}`}
                    className="text-sm text-teal font-medium hover:underline"
                  >
                    {t('viewDetails')} →
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
