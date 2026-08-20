import { useState } from "react";
import { Link } from "react-router-dom";

function ProductDetailPage() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const images = [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77",
    "https://images.unsplash.com/photo-1495555961986-6d4c1ecb7be3",
    "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2",
    "https://images.unsplash.com/photo-1549298916-b41d501d3772",
  ];

  const description =
    "This is a sample product description. The real product description will come from the backend. We can use this area to provide detailed information about the product, its quality, specifications, usage instructions, condition, origin, and other information that customers need before making a purchase.";

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

          <Link
            to="/"
            className="text-xl font-bold text-gray-900"
          >
            Injibara Market
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              to="/"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-brand-600"
            >
              Home
            </Link>

            <Link
              to="/products"
              className="text-sm font-medium text-brand-600"
            >
              Products
            </Link>

            <Link
              to="/categories"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-brand-600"
            >
              Categories
            </Link>
          </nav>

          <Link
            to="/cart"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Cart
          </Link>

        </div>
      </header>


      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-6 pt-6">
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">

          <Link
            to="/"
            className="transition-colors hover:text-brand-600"
          >
            Home
          </Link>

          <span>/</span>

          <Link
            to="/products"
            className="transition-colors hover:text-brand-600"
          >
            Products
          </Link>

          <span>/</span>

          <span className="text-gray-900">
            Product
          </span>

        </div>
      </div>


      {/* Product */}
      <main className="mx-auto max-w-7xl px-6 py-8">

        <div className="grid gap-10 lg:grid-cols-2">


          {/* =========================
              IMAGE SECTION
          ========================= */}

          <section>

            {/* Main image */}
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-white">

              <img
                src={images[selectedImage]}
                alt="Product"
                className="h-full w-full object-cover"
              />

            </div>


            {/* Thumbnails */}
            <div className="mt-4 grid grid-cols-5 gap-3">

              {images.map((image, index) => (

                <button
                  key={image}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square overflow-hidden rounded-lg border-2 bg-white ${
                    selectedImage === index
                      ? "border-brand-600"
                      : "border-gray-200"
                  }`}
                >

                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="h-full w-full object-cover"
                  />

                </button>

              ))}

            </div>

          </section>


          {/* =========================
              PRODUCT INFORMATION
          ========================= */}

          <section>

            {/* Category */}
            <p className="text-sm font-medium text-brand-600">
              Electronics / Mobile Phones
            </p>


            {/* Product name */}
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Sample Product Name
            </h1>


            {/* Brand */}
            <p className="mt-3 text-sm text-gray-500">
              Brand: <span className="font-medium text-gray-900">Example Brand</span>
            </p>


            {/* Price */}
            <div className="mt-6">
              <span className="text-3xl font-bold text-brand-600">
                15,000 ETB
              </span>
            </div>


            {/* Product information */}
            <div className="mt-8 border-y border-gray-200 py-6">

              <h2 className="text-lg font-semibold text-gray-900">
                Product Information
              </h2>

              <dl className="mt-5 space-y-4">

                <div className="flex justify-between gap-6">
                  <dt className="text-sm text-gray-500">
                    Category
                  </dt>

                  <dd className="text-right text-sm font-medium text-gray-900">
                    Electronics
                  </dd>
                </div>


                <div className="flex justify-between gap-6">
                  <dt className="text-sm text-gray-500">
                    Subcategory
                  </dt>

                  <dd className="text-right text-sm font-medium text-gray-900">
                    Mobile Phones
                  </dd>
                </div>


                <div className="flex justify-between gap-6">
                  <dt className="text-sm text-gray-500">
                    Brand
                  </dt>

                  <dd className="text-right text-sm font-medium text-gray-900">
                    Example Brand
                  </dd>
                </div>


                <div className="flex justify-between gap-6">
                  <dt className="text-sm text-gray-500">
                    Batch
                  </dt>

                  <dd className="text-right text-sm font-medium text-gray-900">
                    2026
                  </dd>
                </div>

              </dl>

            </div>


            {/* Description */}
            <div className="mt-8">

              <h2 className="text-lg font-semibold text-gray-900">
                Description
              </h2>

              <div className="mt-3">

                <p
                  className={`text-sm leading-7 text-gray-600 ${
                    !showFullDescription ? "line-clamp-3" : ""
                  }`}
                >
                  {description}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setShowFullDescription(!showFullDescription)
                  }
                  className="mt-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
                >
                  {showFullDescription ? "See less" : "See more"}
                </button>

              </div>

            </div>


            {/* Add to cart */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">

              <button
                type="button"
                className="flex-1 rounded-xl bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                Add to Cart
              </button>

              <button
                type="button"
                className="rounded-xl border border-gray-300 bg-white px-6 py-3.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
              >
                ♡
              </button>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}

export default ProductDetailPage;