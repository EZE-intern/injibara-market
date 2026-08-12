import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import HeroSection from "../components/home/HeroSection";
import CategoryGrid from "../components/home/CategoryGrid";
import FeaturedListings from "../components/home/FeaturedListings";
import TrustBanner from "../components/home/TrustBanner";

function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main>
        <HeroSection />
        <CategoryGrid />
        <FeaturedListings />
        <TrustBanner />
      </main>

      <Footer />
    </div>
  );
}

export default HomePage;