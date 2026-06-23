import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "./authSlice.js";
import { resetCartState } from "./cartSlice.js";
import {
  ShoppingCart,
  Search,
  User,
  LogOut,
  Menu,
  X,
  Shield,
  RotateCcw,
  Heart,
} from "lucide-react";
import { getWishlistCount } from "./api.js";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const isApprovedSeller = user?.role === "seller" && user?.sellerApprovalStatus === "approved";
  const cartCount = useSelector((s) =>
    s.cart.items.reduce((acc, i) => acc + i.qty, 0),
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (user) {
      getWishlistCount()
        .then((res) => {
          console.log("🛍️ Wishlist count:", res.data?.count);
          setWishlistCount(res.data?.count || 0);
        })
        .catch((err) => console.error("Wishlist count error:", err));
    }
  }, [user]);

  // Refresh wishlist count when page gains focus
  useEffect(() => {
    const handleFocus = () => {
      console.log("📝 Page gained focus, refreshing wishlist count...");
      if (user) {
        getWishlistCount()
          .then((res) => setWishlistCount(res.data?.count || 0))
          .catch(() => {});
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) navigate(`/products?search=${searchQ}`);
  };

  const handleLogout = () => {
    dispatch(resetCartState());
    dispatch(logout());
    navigate("/");
  };

  if (isApprovedSeller) {
    return (
      <nav
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: "#f4f4f0",
          borderBottom: "4px solid #000",
          boxShadow: scrolled ? "0 3px 0 #000" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center gap-4">
          <Link to="/seller/dashboard" className="flex items-center gap-2 mr-4">
            <span className="font-display text-3xl uppercase tracking-tight">
              NEXUS<span style={{ color: "var(--accent-3)" }}>.</span>
            </span>
          </Link>

          <div className="flex-1" />

          <Link
            to="/seller/dashboard"
            className="hidden md:flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold"
            style={{
              background: "#00e5ff",
              color: "#000",
              border: "3px solid #000",
              boxShadow: "3px 3px 0 #000",
            }}
          >
            Seller Dashboard
          </Link>

          <Link
            to="/profile"
            className="p-2 rounded-lg transition-all"
            style={{
              background: "#fff",
              border: "3px solid #000",
              boxShadow: "3px 3px 0 #000",
            }}
          >
            <User size={20} />
          </Link>

          <button
            onClick={handleLogout}
            className="p-2 rounded-lg transition-all"
            style={{
              color: "var(--text-secondary)",
              background: "#fff",
              border: "3px solid #000",
              boxShadow: "3px 3px 0 #000",
            }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </nav>
    );
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "#f4f4f0",
        borderBottom: "4px solid #000",
        boxShadow: scrolled ? "0 3px 0 #000" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center gap-4">
        {/* Logo */}
        <button
          className="p-2 rounded-lg border-2 border-black bg-white md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link to="/" className="flex items-center gap-2 mr-4">
          <span className="font-display text-3xl uppercase tracking-tight">
            NEXUS<span style={{ color: "var(--accent-3)" }}>.</span>
          </span>
        </Link>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="flex-1 max-w-xl hidden md:flex"
        >
          <div className="relative w-full">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-secondary)" }}
            />
            <input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search products, brands, categories..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
              style={{
                background: "#fff",
                border: "3px solid #000",
                color: "var(--text-primary)",
              }}
            />
          </div>
        </form>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6 ml-4 text-xl font-bold">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          <Link to="/products" className="hover:underline">
            Shop
          </Link>
          <Link to="/collections" className="hover:underline">
            Collections
          </Link>
          <Link to="/about" className="hover:underline">
            About
          </Link>
        </div>

        <div className="flex-1" />

        {/* Wishlist */}
        {user && (
          <Link
            to="/wishlist"
            className="relative p-2 rounded-lg transition-all"
            style={{
              background: "#fff",
              border: "3px solid #000",
              boxShadow: "3px 3px 0 #000",
            }}
          >
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold pulse-dot"
                style={{
                  background: "#ff5722",
                  color: "white",
                  border: "2px solid #000",
                }}
              >
                {wishlistCount}
              </span>
            )}
          </Link>
        )}

        {/* Cart */}
        <Link
          to="/cart"
          className="relative p-2 rounded-lg transition-all"
          style={{
            background: "#fff",
            border: "3px solid #000",
            boxShadow: "3px 3px 0 #000",
          }}
        >
          <ShoppingCart size={20} />
          {cartCount > 0 && (
            <span
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold pulse-dot"
              style={{
                background: "var(--accent)",
                color: "black",
                border: "2px solid #000",
              }}
            >
              {cartCount}
            </span>
          )}
        </Link>

        {/* User menu */}
        {user ? (
          <div className="flex items-center gap-2">
            {user.role === "admin" && (
              <Link
                to="/admin"
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold"
                style={{
                  background: "#00e5ff",
                  color: "black",
                  border: "3px solid #000",
                  boxShadow: "3px 3px 0 #000",
                }}
              >
                <Shield size={12} /> Admin
              </Link>
            )}
            {user.role === "user" && (
              <span
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold"
                style={{
                  background: "#00e5ff",
                  color: "black",
                  border: "3px solid #000",
                  boxShadow: "3px 3px 0 #000",
                }}
              >
                <User size={12} /> User
              </span>
            )}
            {user.role === "seller" &&
              user.sellerApprovalStatus === "approved" && (
                <>
                  <Link
                    to="/seller/dashboard"
                    className="hidden md:flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold"
                    style={{
                      background: "#00e5ff",
                      color: "#000",
                      border: "3px solid #000",
                      boxShadow: "3px 3px 0 #000",
                    }}
                  >
                    Seller Dashboard
                  </Link>
                </>
              )}
            {user.role === "seller" &&
              user.sellerApprovalStatus !== "approved" && (
                <span
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold"
                  style={{
                    background: "#fff3cd",
                    color: "#7c5a00",
                    border: "3px solid #000",
                    boxShadow: "3px 3px 0 #000",
                  }}
                >
                  Pending Approval
                </span>
              )}
            {user.role === "user" && (
              <Link
                to="/returns"
                className="hidden md:flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold"
                style={{
                  background: "#fff",
                  color: "#000",
                  border: "3px solid #000",
                  boxShadow: "3px 3px 0 #000",
                }}
              >
                <RotateCcw size={14} /> Returns
              </Link>
            )}
            <Link
              to="/profile"
              className="p-2 rounded-lg transition-all"
              style={{
                background: "#fff",
                border: "3px solid #000",
                boxShadow: "3px 3px 0 #000",
              }}
            >
              <User size={20} />
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg transition-all"
              style={{
                color: "var(--text-secondary)",
                background: "#fff",
                border: "3px solid #000",
                boxShadow: "3px 3px 0 #000",
              }}
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-outline text-sm py-2 px-4">
              Login
            </Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-4">
              Sign Up
            </Link>
          </div>
        )}
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          className="md:hidden px-4 pb-4 flex flex-col gap-2"
          style={{
            background: "#f4f4f0",
            borderTop: "3px solid #000",
          }}
        >
          <form onSubmit={handleSearch} className="relative mt-2">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-secondary)" }}
            />
            <input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
              style={{
                background: "#fff",
                border: "3px solid #000",
                color: "var(--text-primary)",
              }}
            />
          </form>
          <Link
            to="/"
            className="py-2 text-sm px-2 rounded-lg font-semibold"
            style={{
              color: "#000",
              background: "#fff",
              border: "3px solid #000",
            }}
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/products"
            className="py-2 text-sm px-2 rounded-lg font-semibold"
            style={{
              color: "#000",
              background: "#fff",
              border: "3px solid #000",
            }}
            onClick={() => setMenuOpen(false)}
          >
            Products
          </Link>
          <Link
            to="/collections"
            className="py-2 text-sm px-2 rounded-lg font-semibold"
            style={{
              color: "#000",
              background: "#fff",
              border: "3px solid #000",
            }}
            onClick={() => setMenuOpen(false)}
          >
            Collections
          </Link>
          <Link
            to="/about"
            className="py-2 text-sm px-2 rounded-lg font-semibold"
            style={{
              color: "#000",
              background: "#fff",
              border: "3px solid #000",
            }}
            onClick={() => setMenuOpen(false)}
          >
            About
          </Link>
          {user && (
            <Link
              to="/wishlist"
              className="py-2 text-sm px-2 rounded-lg font-semibold"
              style={{
                color: "#000",
                background: "#fff",
                border: "3px solid #000",
              }}
              onClick={() => setMenuOpen(false)}
            >
              Wishlist ({wishlistCount})
            </Link>
          )}
          <Link
            to="/cart"
            className="py-2 text-sm px-2 rounded-lg font-semibold"
            style={{
              color: "#000",
              background: "#fff",
              border: "3px solid #000",
            }}
            onClick={() => setMenuOpen(false)}
          >
            Cart ({cartCount})
          </Link>
          {user && (
            <Link
              to="/my-returns"
              className="py-2 text-sm px-2 rounded-lg font-semibold"
              style={{
                color: "#000",
                background: "#fff",
                border: "3px solid #000",
              }}
              onClick={() => setMenuOpen(false)}
            >
              My Returns
            </Link>
          )}
          {user && (
            <Link
              to="/profile"
              className="py-2 text-sm px-2 rounded-lg font-semibold"
              style={{
                color: "#000",
                background: "#fff",
                border: "3px solid #000",
              }}
              onClick={() => setMenuOpen(false)}
            >
              Profile
            </Link>
          )}
          {user?.role === "seller" &&
            user?.sellerApprovalStatus === "approved" && (
              <>
                <Link
                  to="/seller/dashboard"
                  className="py-2 text-sm px-2 rounded-lg font-semibold"
                  style={{
                    color: "#000",
                    background: "#00e5ff",
                    border: "3px solid #000",
                  }}
                  onClick={() => setMenuOpen(false)}
                >
                  Seller Dashboard
                </Link>
              </>
            )}
          {!user && (
            <Link
              to="/login"
              className="btn-primary text-center text-sm"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
          )}
          {user && (
            <button
              onClick={handleLogout}
              className="text-left py-2 text-sm"
              style={{ color: "#ef4444" }}
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
