import Hero from '@/components/landing/Hero';
import CategorySection from '@/components/landing/CategorySection';
import FeaturedSection from '@/components/landing/FeaturedSection';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <CategorySection />
      <FeaturedSection />
    </div>
  );
};

export default Index;
