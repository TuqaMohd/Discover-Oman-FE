import { Heart } from 'lucide-react';
import { useState } from 'react';
import { toggleInterest, isInterestSaved } from '@/lib/persistence';
import { useLanguage } from '@/contexts/LanguageContext';

interface SaveButtonProps {
  destinationId: string;
  showLabel?: boolean;
}

export default function SaveButton({ destinationId, showLabel = false }: SaveButtonProps) {
  const { t } = useLanguage();
  const [saved, setSaved] = useState(() => isInterestSaved(destinationId));

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nowSaved = toggleInterest(destinationId);
    setSaved(nowSaved);
  };

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
        saved
          ? 'bg-copper text-primary-foreground'
          : 'bg-background/80 text-muted-foreground hover:text-copper backdrop-blur-sm border border-border'
      }`}
    >
      <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
      {showLabel && <span>{saved ? t('saved') : t('saveInterest')}</span>}
    </button>
  );
}
