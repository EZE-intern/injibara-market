import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-12 lg:px-16">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="text-2xl font-bold">
              Injibara Market
            </Link>

            <p className="mt-4 max-w-md text-sm leading-6 text-gray-400">
              A local marketplace connecting buyers and sellers throughout Injibara.
            </p>
          </div>

          {/* Marketplace */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide">Marketplace</h2>

            <ul className="mt-4 space-y-3 text-sm text-gray-400">
              <li>
                <Link to="/products" className="transition-colors hover:text-white">
                  Products
                </Link>
              </li>

              <li>
                <Link to="/categories" className="transition-colors hover:text-white">
                  Categories
                </Link>
              </li>

              <li>
                <Link to="/login" className="transition-colors hover:text-white">
                  Sell on Injibara Market
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide">Account</h2>

            <ul className="mt-4 space-y-3 text-sm text-gray-400">
              <li>
                <Link to="/login" className="transition-colors hover:text-white">
                  Login
                </Link>
              </li>

              <li>
                <Link to="/register" className="transition-colors hover:text-white">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 border-t border-gray-800 pt-6">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Injibara Market. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
