import { Link, useParams } from "react-router-dom";
import type { Product } from "../types/Product";

const products: Product[] = [
  {
    id: 1,
    name: "Samsung Galaxy A15",
    brand: "Samsung",
    price: 18500,
    rating: 4.6,
    reviews: 128,
    batch: "B2026-08",
    location: "Injibara",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
    category: "Electronics",
    subCategory: "Mobile Phones",
    description:
      "Samsung Galaxy A15 smartphone with a large display and reliable performance.",
  },

  {
    id: 2,
    name: "Nike Air Max",
    brand: "Nike",
    price: 4500,
    rating: 4.4,
    reviews: 86,
    batch: "B2026-07",
    location: "Injibara",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    category: "Fashion",
    subCategory: "Shoes",
    description:
      "Comfortable Nike Air Max shoes suitable for everyday use and casual activities.",
  },

  {
    id: 3,
    name: "Apple iPhone 15",
    brand: "Apple",
    price: 72000,
    rating: 4.8,
    reviews: 245,
    batch: "B2026-08",
    location: "Injibara",
    image:
      "https://images.unsplash.com/photo-1591337676887-a217a6970a8a",
    category: "Electronics",
    subCategory: "Mobile Phones",
    description:
      "Apple iPhone 15 with excellent performance, camera quality, and modern design.",
  },

  {
    id: 4,
    name: "Traditional Handwoven Basket",
    brand: "Local Artisan",
    price: 1200,
    rating: 4.5,
    reviews: 42,
    batch: "B2026-07",
    location: "Injibara",
    image:
      "https://images.unsplash.com/photo-1584302179602-e4c3d3fd629d",
    category: "Home & Living",
    subCategory: "Handicrafts",
    description:
      "Traditional handwoven basket made by local artisans in the Awi area.",
  },

  {
    id: 5,
    name: "Fresh Local Coffee",
    brand: "Awi Coffee",
    price: 850,
    rating: 4.8,
    reviews: 96,
    batch: "B2026-08",
    location: "Awi Zone",
    image:
      "https://images.unsplash.com/photo-1447933601403-0c6688de566e",
    category: "Food",
    subCategory: "Coffee",
    description:
      "Fresh locally produced coffee with a rich aroma and traditional Ethiopian character.",
  },

  {
    id: 6,
    name: "Men's Casual Shirt",
    brand: "Local Fashion",
    price: 1800,
    rating: 4.3,
    reviews: 31,
    batch: "B2026-06",
    location: "Injibara",
    image:
      "https://images.unsplash.com/photo-1603252110481-7ba873bf42ab",
    category: "Fashion",
    subCategory: "Men's Clothing",
    description:
      "Comfortable casual shirt suitable for everyday wear.",
  },
];

function ProductDetailPage() {
  const { id } = useParams();

  const product = products.find(
    (item) => item.id === Number(id)
  );

  /*
   * Product doesn't exist
   */
  if (!product) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-3xl rounded-xl bg-white p-10 text-center shadow-sm">

          <div className="text-5xl">
            🔍
          </div>

          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Product not found
          </h1>

          <p className="mt-2 text-gray-500">
            The product you are looking for does not exist.
          </p>

          <Link
            to="/products"
            className="mt-6 inline-block rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-700"
          >
            Back to Products
          </Link>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">

      {/* =========================
          BACK NAVIGATION
      ========================== */}

      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">

        <Link
          to="/products"
          className="text-sm font-medium text-gray-500 transition hover:text-brand-600"
        >
          ← Back to Products
        </Link>

      </div>


      {/* =========================
          PRODUCT DETAILS
      ========================== */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

          <div className="grid lg:grid-cols-2">

            {/* =========================
                IMAGE
            ========================== */}

            <div className="min-h-[400px] bg-gray-100 lg:min-h-[600px]">

              <img
                src={product.image}
                alt={product.name}
                className="h-full min-h-[400px] w-full object-cover lg:min-h-[600px]"
              />

            </div>


            {/* =========================
                INFORMATION
            ========================== */}

            <div className="p-6 sm:p-10 lg:p-12">

              {/* Category */}
              <div className="flex flex-wrap gap-2">

                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                  {product.category}
                </span>

                {product.subCategory && (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    {product.subCategory}
                  </span>
                )}

              </div>


              {/* Brand */}
              <p className="mt-6 text-sm font-medium uppercase tracking-wide text-gray-500">
                {product.brand}
              </p>


              {/* Product name */}
              <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
                {product.name}
              </h1>


              {/* Rating */}
              <div className="mt-4 flex items-center gap-3">

                <div className="flex items-center gap-1">

                  <span className="text-xl text-yellow-500">
                    ★
                  </span>

                  <span className="font-semibold text-gray-900">
                    {product.rating.toFixed(1)}
                  </span>

                </div>

                <span className="text-gray-500">
                  {product.reviews} reviews
                </span>

              </div>


              {/* Price */}
              <div className="mt-6">

                <span className="text-3xl font-bold text-brand-600">
                  {product.price.toLocaleString()} ETB
                </span>

              </div>


              {/* Divider */}
              <div className="my-8 border-t border-gray-200" />


              {/* Description */}
              <div>

                <h2 className="text-lg font-semibold text-gray-900">
                  Description
                </h2>

                <p className="mt-3 leading-7 text-gray-600">
                  {product.description}
                </p>

              </div>


              {/* Product information */}
              <div className="mt-8">

                <h2 className="text-lg font-semibold text-gray-900">
                  Product Information
                </h2>

                <div className="mt-4 divide-y divide-gray-200 rounded-lg border border-gray-200">

                  <div className="flex justify-between px-4 py-3">
                    <span className="text-sm text-gray-500">
                      Category
                    </span>

                    <span className="text-sm font-medium text-gray-900">
                      {product.category}
                    </span>
                  </div>

                  <div className="flex justify-between px-4 py-3">
                    <span className="text-sm text-gray-500">
                      Subcategory
                    </span>

                    <span className="text-sm font-medium text-gray-900">
                      {product.subCategory || "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between px-4 py-3">
                    <span className="text-sm text-gray-500">
                      Brand
                    </span>

                    <span className="text-sm font-medium text-gray-900">
                      {product.brand}
                    </span>
                  </div>

                  <div className="flex justify-between px-4 py-3">
                    <span className="text-sm text-gray-500">
                      Batch
                    </span>

                    <span className="text-sm font-medium text-gray-900">
                      {product.batch}
                    </span>
                  </div>

                  <div className="flex justify-between px-4 py-3">
                    <span className="text-sm text-gray-500">
                      Location
                    </span>

                    <span className="text-sm font-medium text-gray-900">
                      {product.location}
                    </span>
                  </div>

                </div>

              </div>


              {/* Actions */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                <button
                  type="button"
                  className="flex-1 rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-700"
                >
                  Contact Seller
                </button>

                <button
                  type="button"
                  className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  ♡ Save
                </button>

              </div>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}

export default ProductDetailPage;