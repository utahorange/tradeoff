'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? 'bg-blue-700' : '';
  };

  return (
    <nav className="bg-blue-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="text-white font-bold text-xl">
                Tradeoff
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  href="/"
                  className={`text-white px-3 py-2 rounded-md text-sm font-medium ${isActive('/')}`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/portfolio"
                  className={`text-white px-3 py-2 rounded-md text-sm font-medium ${isActive('/portfolio')}`}
                >
                  Portfolio
                </Link>
                <Link
                  href="/competitions"
                  className={`text-white px-3 py-2 rounded-md text-sm font-medium ${isActive('/competitions')}`}
                >
                  Competitions
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <Link
                href="/profile"
                className={`text-white px-3 py-2 rounded-md text-sm font-medium ${isActive('/profile')}`}
              >
                My Profile
              </Link>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-700 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/"
              className={`text-white block px-3 py-2 rounded-md text-base font-medium ${isActive('/')}`}
            >
              Dashboard
            </Link>
            <Link
              href="/portfolio"
              className={`text-white block px-3 py-2 rounded-md text-base font-medium ${isActive('/portfolio')}`}
            >
              Portfolio
            </Link>
            <Link
              href="/competitions"
              className={`text-white block px-3 py-2 rounded-md text-base font-medium ${isActive('/competitions')}`}
            >
              Competitions
            </Link>
            <Link
              href="/profile"
              className={`text-white block px-3 py-2 rounded-md text-base font-medium ${isActive('/profile')}`}
            >
              My Profile
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
