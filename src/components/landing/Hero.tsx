import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import heroImage from '@/assets/hero-oman.jpg';

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <img
        src={heroImage}
        alt="Oman landscape with desert dunes and coast"
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
      />
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, rgba(20,15,10,0.55) 0%, rgba(20,15,10,0.3) 40%, rgba(20,15,10,0.65) 100%)'
      }} />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight" style={{ color: '#fff' }}>
            {t('heroTitle')}
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10" style={{ color: 'rgba(255,255,255,0.85)' }}>
            {t('heroSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/plan" className="btn-primary-copper text-lg">
              {t('startPlanning')}
            </Link>
            <Link
              to="/destinations"
              className="px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-300 border-2"
              style={{ borderColor: 'rgba(255,255,255,0.5)', color: '#fff', background: 'rgba(255,255,255,0.1)' }}
            >
              {t('exploreDestinations')}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
