import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import ProductCard from "../common/ProductCard";
import { ArrowRight } from "lucide-react";

const API_URL = "http://localhost:5000";

const formatUrl = (imgObj: any): string => {
  if (!imgObj) {
    return `${API_URL}/uploads/placeholder.jpg`;
  }

  let imgName: any = imgObj;

  if (typeof imgObj === "object" && imgObj !== null) {
    imgName =
      imgObj.image_url ||
      imgObj.url ||
      imgObj.image ||
      imgObj.filename;
  }

  if (!imgName || typeof imgName !== "string") {
    return `${API_URL}/uploads/placeholder.jpg`;
  }

  imgName = imgName.trim();

  if (
    imgName.startsWith("http://") ||
    imgName.startsWith("https://")
  ) {
    return imgName;
  }

  if (imgName.startsWith("/uploads/")) {
    return `${API_URL}${imgName}`;
  }

  if (imgName.startsWith("uploads/")) {
    return `${API_URL}/${imgName}`;
  }

  imgName = imgName
    .replace(/^\/+/, "")
    .replace(/^uploads\/+/, "");

  return `${API_URL}/uploads/${imgName}`;
};

function FeaturedListings() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          `${API_URL}/api/products`
        );

        const items = response.data?.data || [];

        setProducts(items.slice(0, 10));
      } catch (error) {
        console.error(
          "Failed to load featured products:",
          error
        );

        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <section className="bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Featured Listings
          </h2>

          <Link
            to="/categories"
            className="flex items-center text-sm font-bold text-red-700 hover:text-red-800 transition-colors"
          >
            View all listings
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-10 text-gray-500">
            ምርቶች በመጫን ላይ ናቸው...
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            እስካሁን ምንም ምርት አልተመዘገበም።
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {products.map((product) => {
              
              const frontImage =
                product.product_images?.find(
                  (img: any) => img.side_angle === "front"
                ) ||
                product.product_images?.find(
                  (img: any) => img.is_primary === true
                ) ||
                product.product_images?.[0];

              const imageUrl = formatUrl(frontImage);

              const productForCard = {
                ...product,
                image: imageUrl,
              };

              return (
                <ProductCard
                  key={product.id}
                  product={productForCard}
                  showThumbnails={false}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default FeaturedListings;
