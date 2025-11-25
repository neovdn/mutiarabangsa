import { DashboardHero } from './_components/dashboard-hero';
import { DashboardSearch } from './_components/dashboard-search';
import { CategorySection } from './_components/category-section';
import { StatsSection } from './_components/stats-section';
import { RecentOrdersWidget } from './_components/recent-orders-widget';
import { FeaturedProducts } from './_components/featured-products';
import { PromoBanner } from './_components/promo-banner';

export default function CustomerDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 -m-8 p-8"> 
      {/* Note: -m-8 p-8 digunakan untuk override padding default dari layout jika diperlukan, atau sesuaikan dengan layout container kamu */}
      
      <DashboardHero />
      <DashboardSearch />
      <CategorySection />
      <StatsSection />
      <RecentOrdersWidget />
      <FeaturedProducts />
      <PromoBanner />
      
      {/* Spacer agar tidak mentok bawah */}
      <div className="h-12" />
    </div>
  );
}