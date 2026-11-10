import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="border-t border-stone-800 bg-stone-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-12 lg:px-16">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span className="text-amber-500">🌼</span>
              <span>Adey Market • አደይ ገበያ</span>
            </Link>

            <p className="mt-4 max-w-md text-sm leading-6 text-stone-400">
              Where Ethiopia shops. A national marketplace connecting verified buyers and sellers across all regions of Ethiopia.
            </p>
          </div>

          {/* Marketplace */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-400">Marketplace</h2>

            <ul className="mt-4 space-y-3 text-sm text-stone-400">
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
                <Link to="/seller" className="transition-colors hover:text-white">
                  Sell on Adey Market
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-400">Account</h2>

            <ul className="mt-4 space-y-3 text-sm text-stone-400">
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
        <div className="mt-10 border-t border-stone-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-stone-500">
          <p>
            © {new Date().getFullYear()} Adey Market (አደይ ገበያ). All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 text-xs text-stone-400">
            <span>Serving all regions of Ethiopia • መላው ኢትዮጵያ</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
