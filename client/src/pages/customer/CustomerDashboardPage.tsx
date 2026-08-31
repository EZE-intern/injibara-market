import CustomerNavbar from '../../components/customer/CustomerNavbar';
import CustomerFooter from '../../components/customer/CustomerFooter';
import CustomerHeroSection from '../../components/customer/CustomerHeroSection';
import CustomerCategoryGrid from '../../components/customer/CustomerCategoryGrid';
import CustomerFeaturedListings from '../../components/customer/CustomerFeaturedListings';
import CustomerTrustBanner from '../../components/customer/CustomerTrustBanner';

function CustomerDashboardPage() {
  return (
    <div className="min-h-screen">
      <CustomerNavbar />

      <main>
        <CustomerHeroSection />
        <CustomerCategoryGrid />
        <CustomerFeaturedListings />
        <CustomerTrustBanner />
      </main>

      <CustomerFooter />
    </div>
  );
}

export default CustomerDashboardPage;