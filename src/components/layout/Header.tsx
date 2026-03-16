import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { getSavedInterests } from '@/lib/persistence';
import { Globe, Heart, Menu, Moon, Sun, X } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from 'next-themes';

export default function Header() {
  const { t, lang, setLang, isArabic } = useLanguage();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const savedCount = getSavedInterests().length;
  const { theme, setTheme } = useTheme();

  const navLinks = [
    { to: '/', label: t('home') },
    { to: '/destinations', label: t('destinations') },
    { to: '/plan', label: t('planTrip') },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b border-border backdrop-blur-md bg-background/90">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-foreground">
          <span className="text-copper">✦</span>
          <span>{t('discoverOman')}</span>
        </Link>

        {/* Desktop Nav */}
        <nav className={`hidden md:flex items-center gap-6 ${isArabic ? 'flex-row-reverse' : ''}`}>
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-colors ${
                isActive(link.to)
                  ? 'text-copper'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Saved Interests Badge */}
          <Link
            to="/plan"
            className="relative p-2 text-muted-foreground hover:text-copper transition-colors"
            title={t('savedInterests')}
          >
            <Heart className="w-5 h-5" />
            {savedCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-copper text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
                {savedCount > 9 ? '9+' : savedCount}
              </span>
            )}
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-copper transition-all"
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-copper transition-all"
          >
            <Globe className="w-4 h-4" />
            <span>{lang === 'en' ? 'العربية' : 'English'}</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-3">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`text-sm font-medium py-2 ${
                  isActive(link.to) ? 'text-copper' : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
