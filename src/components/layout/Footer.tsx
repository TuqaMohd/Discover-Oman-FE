import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-start">
            <Link to="/" className="font-display text-lg font-bold text-foreground">
              <span className="text-copper">✦</span> {t('discoverOman')}
            </Link>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">
              {t('footerText')}
            </p>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-copper transition-colors">{t('home')}</Link>
            <Link to="/destinations" className="hover:text-copper transition-colors">{t('destinations')}</Link>
            <Link to="/plan" className="hover:text-copper transition-colors">{t('planTrip')}</Link>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          {t('copyright')}
        </div>
      </div>
    </footer>
  );
}
