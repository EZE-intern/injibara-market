import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

function CustomerCartPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/customer"
          className="text-sm text-gray-500 hover:text-brand-600 transition"
        >
          &larr; Dashboard
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          My Cart
        </h1>

        <div className="mt-8 rounded-xl bg-white p-12 text-center shadow-sm border border-gray-100">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <ShoppingCart size={32} />
          </div>

          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            Your cart is empty
          </h2>

          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            Browse products from local sellers in Injibara and add items to your cart.
          </p>

          <Link
            to="/products"
            className="mt-6 inline-block rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700 transition shadow-sm"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </main>
  );
}

export default CustomerCartPage;