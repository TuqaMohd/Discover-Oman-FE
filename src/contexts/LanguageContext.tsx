/**
 * Language Context
 * 
 * Provides bilingual support (English/Arabic) throughout the app.
 * Handles RTL layout switching for Arabic.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Language, Bilingual } from '@/types/destination';
import { saveLanguage, getSavedLanguage } from '@/lib/persistence';

/** UI translation strings */
const translations = {
  en: {
    discoverOman: 'Discover Oman',
    planTrip: 'Plan Your Trip',
    destinations: 'Destinations',
    home: 'Home',
    heroTitle: 'Discover the Beauty of Oman',
    heroSubtitle: 'From ancient forts to pristine beaches, explore a land of timeless wonder',
    startPlanning: 'Start Planning Your Trip',
    exploreDestinations: 'Explore Destinations',
    featuredTitle: 'Featured Destinations',
    featuredSubtitle: 'Hand-picked locations that capture the essence of Oman',
    categoriesTitle: 'Explore by Category',
    categoriesSubtitle: 'Find experiences that match your interests',
    filterByCategory: 'Category',
    filterByRegion: 'Region',
    filterBySeason: 'Season',
    sortBy: 'Sort by',
    popularity: 'Popularity',
    cost: 'Cost',
    allCategories: 'All Categories',
    allRegions: 'All Regions',
    allSeasons: 'All Seasons',
    saveInterest: 'Save',
    saved: 'Saved',
    recommendedMonths: 'Recommended Months',
    crowdLevel: 'Crowd Level',
    visitDuration: 'Visit Duration',
    ticketCost: 'Ticket Cost',
    free: 'Free',
    minutes: 'min',
    hours: 'hours',
    perDay: '/day',
    tripDuration: 'Trip Duration',
    days: 'days',
    budgetTier: 'Budget',
    travelMonth: 'Travel Month',
    travelIntensity: 'Intensity',
    preferredCategories: 'Preferred Categories',
    generateItinerary: 'Generate Itinerary',
    yourItinerary: 'Your Itinerary',
    day: 'Day',
    totalDistance: 'Total Distance',
    costBreakdown: 'Cost Breakdown',
    fuel: 'Fuel',
    tickets: 'Tickets',
    food: 'Food',
    hotel: 'Hotel',
    total: 'Total',
    withinBudget: 'Within Budget',
    overBudget: 'Over Budget',
    regionPlan: 'Region Plan',
    whySelected: 'Why Selected',
    relaxed: 'Relaxed',
    balanced: 'Balanced',
    packed: 'Packed',
    low: 'Low',
    medium: 'Medium',
    luxury: 'Luxury',
    savedInterests: 'Saved Interests',
    noSavedInterests: 'No saved interests yet. Browse destinations to save some!',
    viewDetails: 'View Details',
    backToDestinations: 'Back to Destinations',
    mountain: 'Mountain',
    beach: 'Beach',
    culture: 'Culture',
    desert: 'Desert',
    nature: 'Nature',
    food_cat: 'Food',
    month1: 'January', month2: 'February', month3: 'March', month4: 'April',
    month5: 'May', month6: 'June', month7: 'July', month8: 'August',
    month9: 'September', month10: 'October', month11: 'November', month12: 'December',
    footerText: 'Explore the Sultanate of Oman — where tradition meets natural wonder.',
    copyright: '© 2026 Discover Oman. All rights reserved.',
    stops: 'stops',
    kmDriven: 'km driven',
    arrivalTime: 'Arrival',
    departureTime: 'Departure',
    distFrom: 'Distance from previous',
  },
  ar: {
    discoverOman: 'اكتشف عُمان',
    planTrip: 'خطط لرحلتك',
    destinations: 'الوجهات',
    home: 'الرئيسية',
    heroTitle: 'اكتشف جمال عُمان',
    heroSubtitle: 'من القلاع القديمة إلى الشواطئ البكر، استكشف أرض العجائب الخالدة',
    startPlanning: 'ابدأ التخطيط لرحلتك',
    exploreDestinations: 'استكشف الوجهات',
    featuredTitle: 'وجهات مميزة',
    featuredSubtitle: 'مواقع مختارة بعناية تجسد جوهر عُمان',
    categoriesTitle: 'استكشف حسب الفئة',
    categoriesSubtitle: 'اعثر على تجارب تتناسب مع اهتماماتك',
    filterByCategory: 'الفئة',
    filterByRegion: 'المنطقة',
    filterBySeason: 'الموسم',
    sortBy: 'ترتيب حسب',
    popularity: 'الشعبية',
    cost: 'التكلفة',
    allCategories: 'جميع الفئات',
    allRegions: 'جميع المناطق',
    allSeasons: 'جميع المواسم',
    saveInterest: 'حفظ',
    saved: 'محفوظ',
    recommendedMonths: 'الأشهر المُوصى بها',
    crowdLevel: 'مستوى الازدحام',
    visitDuration: 'مدة الزيارة',
    ticketCost: 'سعر التذكرة',
    free: 'مجاني',
    minutes: 'دقيقة',
    hours: 'ساعات',
    perDay: '/يوم',
    tripDuration: 'مدة الرحلة',
    days: 'أيام',
    budgetTier: 'الميزانية',
    travelMonth: 'شهر السفر',
    travelIntensity: 'كثافة السفر',
    preferredCategories: 'الفئات المفضلة',
    generateItinerary: 'إنشاء خط السير',
    yourItinerary: 'خط سيرك',
    day: 'اليوم',
    totalDistance: 'المسافة الإجمالية',
    costBreakdown: 'تفصيل التكلفة',
    fuel: 'الوقود',
    tickets: 'التذاكر',
    food: 'الطعام',
    hotel: 'الفندق',
    total: 'الإجمالي',
    withinBudget: 'ضمن الميزانية',
    overBudget: 'تجاوز الميزانية',
    regionPlan: 'خطة المناطق',
    whySelected: 'لماذا تم اختياره',
    relaxed: 'مريح',
    balanced: 'متوازن',
    packed: 'مكثف',
    low: 'منخفض',
    medium: 'متوسط',
    luxury: 'فاخر',
    savedInterests: 'الاهتمامات المحفوظة',
    noSavedInterests: 'لا توجد اهتمامات محفوظة بعد. تصفح الوجهات لحفظ بعضها!',
    viewDetails: 'عرض التفاصيل',
    backToDestinations: 'العودة للوجهات',
    mountain: 'جبل',
    beach: 'شاطئ',
    culture: 'ثقافة',
    desert: 'صحراء',
    nature: 'طبيعة',
    food_cat: 'طعام',
    month1: 'يناير', month2: 'فبراير', month3: 'مارس', month4: 'أبريل',
    month5: 'مايو', month6: 'يونيو', month7: 'يوليو', month8: 'أغسطس',
    month9: 'سبتمبر', month10: 'أكتوبر', month11: 'نوفمبر', month12: 'ديسمبر',
    footerText: 'استكشف سلطنة عُمان — حيث يلتقي التراث بعجائب الطبيعة.',
    copyright: '© 2026 اكتشف عُمان. جميع الحقوق محفوظة.',
    stops: 'محطات',
    kmDriven: 'كم مقطوعة',
    arrivalTime: 'الوصول',
    departureTime: 'المغادرة',
    distFrom: 'المسافة من السابق',
  },
} as const;

type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  bil: (bilingual: Bilingual) => string;
  dir: 'ltr' | 'rtl';
  isArabic: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(getSavedLanguage() as Language);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    saveLanguage(newLang);
  }, []);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback((key: TranslationKey): string => {
    return translations[lang][key] || key;
  }, [lang]);

  const bil = useCallback((bilingual: Bilingual): string => {
    return bilingual[lang];
  }, [lang]);

  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const isArabic = lang === 'ar';

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, bil, dir, isArabic }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
