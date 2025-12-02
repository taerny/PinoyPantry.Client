import { ShoppingCart, Search, Menu, User, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "./CartContext";

interface HeaderProps {
  onCartClick?: () => void;
  onCategoryClick?: (category: string) => void;
  onLogoClick?: () => void;
  onUserClick?: () => void;
  selectedCategory?: string | null;
}

export function Header({
  onCartClick,
  onCategoryClick,
  onLogoClick,
  onUserClick,
  selectedCategory,
}: HeaderProps) {
  const { getCartCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const cartCount = getCartCount();

  return (
    <header className="sticky top-0 z-50 bg-[beige] shadow-md">
      {/* Top Bar */}
      <div className="bg-[#F9A825] py-2">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-[#3E2723]">
            Free shipping on orders over $100!
          </p>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-5">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <button onClick={onLogoClick} className="flex items-center gap-2">
            <img
              src="/images/logo.png"
              alt="PinoyPantry Logo"
              className="h-24  w-auto transition-transform duration-100 hover:[transform:rotate(3deg)] active:[transform:rotate(-3deg)_scale(0.95)]"
            />
          </button>
          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search Filipino favorites..."
                className="w-full px-4 py-3 pr-12 rounded-full text-[#3E2723] bg-white border-2 border-white/20 shadow-md focus:outline-none focus:ring-2 focus:ring-[#F9A825] focus:border-[#F9A825] transition-all"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#D32F2F] text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-[#B71C1C] transition-colors">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Icons */}
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-[#3E2723] hover:text-[#F9A825] transition-colors"
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            >
              <Search className="w-6 h-6" />
            </button>
            <button
              className="text-[#3E2723] hover:text-[#F9A825] transition-colors hidden md:block"
              onClick={onUserClick}
            >
              <User className="w-6 h-6" />
            </button>
            <button
              className="relative text-[#3E2723] hover:text-[#F9A825] transition-colors"
              onClick={onCartClick}
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#D32F2F] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              className="md:hidden text-[#3E2723] hover:text-[#F9A825] transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {isMobileSearchOpen && (
          <div className="md:hidden mt-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search Filipino favorites..."
                className="w-full px-4 py-3 pr-12 rounded-full text-[#3E2723] bg-white border-2 border-white/20 shadow-md focus:outline-none focus:ring-2 focus:ring-[#F9A825] focus:border-[#F9A825] transition-all"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#D32F2F] text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-[#B71C1C] transition-colors">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Navigation */}
      <nav className="bg-[#4A332E] border-t border-[#6D4C41] hidden md:block">
        <div className="container mx-auto px-4">
          <ul className="flex items-center gap-8 py-3 overflow-x-auto">
            <li>
              <button
                onClick={() => onCategoryClick?.("All Products")}
                className={`text-white hover:text-[#F9A825] transition-colors whitespace-nowrap pb-1 ${
                  selectedCategory === "All Products"
                    ? "text-[#F9A825] border-b-2 border-[#F9A825]"
                    : ""
                }`}
              >
                All Products
              </button>
            </li>
            <li>
              <button
                onClick={() => onCategoryClick?.("Canned Goods")}
                className={`text-white hover:text-[#F9A825] transition-colors whitespace-nowrap pb-1 ${
                  selectedCategory === "Canned Goods"
                    ? "text-[#F9A825] border-b-2 border-[#F9A825]"
                    : ""
                }`}
              >
                Canned Goods
              </button>
            </li>
            <li>
              <button
                onClick={() => onCategoryClick?.("Snacks & Chips")}
                className={`text-white hover:text-[#F9A825] transition-colors whitespace-nowrap pb-1 ${
                  selectedCategory === "Snacks & Chips"
                    ? "text-[#F9A825] border-b-2 border-[#F9A825]"
                    : ""
                }`}
              >
                Snacks & Chips
              </button>
            </li>
            <li>
              <button
                onClick={() => onCategoryClick?.("Instant Noodles")}
                className={`text-white hover:text-[#F9A825] transition-colors whitespace-nowrap pb-1 ${
                  selectedCategory === "Instant Noodles"
                    ? "text-[#F9A825] border-b-2 border-[#F9A825]"
                    : ""
                }`}
              >
                Instant Noodles
              </button>
            </li>
            <li>
              <button
                onClick={() => onCategoryClick?.("Beverages")}
                className={`text-white hover:text-[#F9A825] transition-colors whitespace-nowrap pb-1 ${
                  selectedCategory === "Beverages"
                    ? "text-[#F9A825] border-b-2 border-[#F9A825]"
                    : ""
                }`}
              >
                Beverages
              </button>
            </li>
            <li>
              <button
                onClick={() => onCategoryClick?.("Condiments")}
                className={`text-white hover:text-[#F9A825] transition-colors whitespace-nowrap pb-1 ${
                  selectedCategory === "Condiments"
                    ? "text-[#F9A825] border-b-2 border-[#F9A825]"
                    : ""
                }`}
              >
                Condiments
              </button>
            </li>
            <li>
              <button
                onClick={() => onCategoryClick?.("Sweets")}
                className={`text-white hover:text-[#F9A825] transition-colors whitespace-nowrap pb-1 ${
                  selectedCategory === "Sweets"
                    ? "text-[#F9A825] border-b-2 border-[#F9A825]"
                    : ""
                }`}
              >
                Sweets
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#4A332E] border-t border-[#6D4C41]">
          <div className="container mx-auto px-4 py-4">
            <ul className="space-y-4">
              <li>
                <button
                  onClick={() => {
                    onCategoryClick?.("All Products");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`text-white block py-2 hover:text-[#F9A825] transition-colors w-full text-left ${
                    selectedCategory === "All Products"
                      ? "text-[#F9A825] border-l-4 border-[#F9A825] pl-3"
                      : ""
                  }`}
                >
                  All Products
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onCategoryClick?.("Canned Goods");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`text-white block py-2 hover:text-[#F9A825] transition-colors w-full text-left ${
                    selectedCategory === "Canned Goods"
                      ? "text-[#F9A825] border-l-4 border-[#F9A825] pl-3"
                      : ""
                  }`}
                >
                  Canned Goods
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onCategoryClick?.("Snacks & Chips");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`text-white block py-2 hover:text-[#F9A825] transition-colors w-full text-left ${
                    selectedCategory === "Snacks & Chips"
                      ? "text-[#F9A825] border-l-4 border-[#F9A825] pl-3"
                      : ""
                  }`}
                >
                  Snacks & Chips
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onCategoryClick?.("Instant Noodles");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`text-white block py-2 hover:text-[#F9A825] transition-colors w-full text-left ${
                    selectedCategory === "Instant Noodles"
                      ? "text-[#F9A825] border-l-4 border-[#F9A825] pl-3"
                      : ""
                  }`}
                >
                  Instant Noodles
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onCategoryClick?.("Beverages");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`text-white block py-2 hover:text-[#F9A825] transition-colors w-full text-left ${
                    selectedCategory === "Beverages"
                      ? "text-[#F9A825] border-l-4 border-[#F9A825] pl-3"
                      : ""
                  }`}
                >
                  Beverages
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onCategoryClick?.("Condiments");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`text-white block py-2 hover:text-[#F9A825] transition-colors w-full text-left ${
                    selectedCategory === "Condiments"
                      ? "text-[#F9A825] border-l-4 border-[#F9A825] pl-3"
                      : ""
                  }`}
                >
                  Condiments
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onCategoryClick?.("Sweets");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`text-white block py-2 hover:text-[#F9A825] transition-colors w-full text-left ${
                    selectedCategory === "Sweets"
                      ? "text-[#F9A825] border-l-4 border-[#F9A825] pl-3"
                      : ""
                  }`}
                >
                  Sweets
                </button>
              </li>
              <li className="pt-4 border-t border-[#6D4C41]">
                <button
                  onClick={() => {
                    onUserClick?.();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-white block py-2 hover:text-[#F9A825] transition-colors flex items-center gap-2"
                >
                  <User className="w-5 h-5" />
                  My Account
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
