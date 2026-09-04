export default function SellerOrdersPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-2xl font-bold">
          Seller Orders
        </h1>

        <p className="text-gray-500 mt-2">
          Incoming customer orders will appear here.
        </p>

        <div className="mt-8 bg-white border rounded-xl p-8 text-center">
          <h2 className="font-semibold">
            No orders available
          </h2>

          <p className="text-gray-500 mt-2">
            Orders will appear here when customers purchase your products.
          </p>
        </div>

      </div>
    </main>
  );
}