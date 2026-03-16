import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { categories, getByCategory, categoryInfo } from '@/data/destinations';
import type { Category } from '@/types/destination';
import { motion } from 'framer-motion';

/** Category descriptions for display */
const categoryDescriptions: Record<Category, { en: string; ar: string }> = {
  mountain: { en: 'Majestic peaks and winding wadis', ar: 'قمم شامخة وأودية متعرجة' },
  beach: { en: 'Pristine coastlines and turquoise waters', ar: 'سواحل بكر ومياه فيروزية' },
  culture: { en: 'Ancient forts and living heritage', ar: 'قلاع عريقة وتراث حي' },
  desert: { en: 'Endless dunes and starlit skies', ar: 'كثبان لا نهائية وسماء مرصعة بالنجوم' },
  nature: { en: 'Lush oases and diverse wildlife', ar: 'واحات خضراء وحياة برية متنوعة' },
  food: { en: 'Authentic flavors and spice souqs', ar: 'نكهات أصيلة وأسواق التوابل' },
};

export default function CategorySection() {
  const { t, bil } = useLanguage();

  return (
    <section className="py-20 bg-sand">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            {t('categoriesTitle')}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t('categoriesSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {categories.map((cat, i) => {
            const count = getByCategory(cat).length;
            const info = categoryInfo[cat];
            const desc = categoryDescriptions[cat];

            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <Link
                  to={`/destinations?category=${cat}`}
                  className="category-card flex flex-col items-center text-center group"
                >
                  <span className="text-4xl mb-3">{info.emoji}</span>
                  <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-copper transition-colors">
                    {cat === 'food' ? t('food_cat') : t(cat as 'mountain' | 'beach' | 'culture' | 'desert' | 'nature')}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {bil(desc)}
                  </p>
                  <span className="text-xs text-copper mt-2 font-medium">
                    {count} {t('destinations').toLowerCase()}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
