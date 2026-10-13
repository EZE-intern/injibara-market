import CustomerNavbar from "../../components/customer/CustomerNavbar";
import CustomerFooter from "../../components/customer/CustomerFooter";
import CustomerHeroSection from "../../components/customer/CustomerHeroSection";
import CustomerCategoryGrid from "../../components/customer/CustomerCategoryGrid";
import CustomerFeaturedListings from "../../components/customer/CustomerFeaturedListings";
import CustomerTrustBanner from "../../components/customer/CustomerTrustBanner";
import CustomerBottomNav from "../../components/customer/CustomerBottomNav";

function CustomerDashboardPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col justify-between">
      <div>
        <CustomerNavbar />

        <main className="pb-28 md:pb-0">
          <CustomerHeroSection />
          <CustomerCategoryGrid />
          <CustomerFeaturedListings />
          <CustomerTrustBanner />
        </main>
      </div>

      <CustomerFooter />
      <CustomerBottomNav />
    </div>
  );
}

export default CustomerDashboardPage;