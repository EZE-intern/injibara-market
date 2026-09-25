import { useState } from "react";
import CustomerNavbar from "../components/customer/CustomerNavbar";
import CustomerFooter from "../components/customer/CustomerFooter";
import CustomerHeroSection from "../components/customer/CustomerHeroSection";
import CustomerCategoryGrid from "../components/customer/CustomerCategoryGrid";
import CustomerFeaturedListings from "../components/customer/CustomerFeaturedListings";
import CustomerTrustBanner from "../components/customer/CustomerTrustBanner";
import CustomerBottomNav from "../components/customer/CustomerBottomNav";

function HomePage() {
  const [selectedLocation, setSelectedLocation] = useState("injibara");

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col justify-between">
      <div>
        <CustomerNavbar
          selectedLocation={selectedLocation}
          onLocationChange={setSelectedLocation}
        />

        <main className="pb-20 md:pb-0">
          <CustomerHeroSection />
          <CustomerCategoryGrid />
          <CustomerFeaturedListings initialLocation={selectedLocation} />
          <CustomerTrustBanner />
        </main>
      </div>

      <CustomerFooter />

      {/* Dynamic Mobile Bottom Navigation Bar */}
      <CustomerBottomNav />
    </div>
  );
}

export default HomePage;
