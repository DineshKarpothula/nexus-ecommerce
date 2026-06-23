import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, Package } from "lucide-react";
import { loginUser } from "./api.js";
import { setCredentials } from "./authSlice.js";
import { initCart } from "./cartSlice.js";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [enableSuggestions, setEnableSuggestions] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await loginUser(form);
      dispatch(setCredentials({ user: data.user, token: data.token }));
      dispatch(initCart(data.user._id));
      toast.success(`Welcome back, ${data.user.name}!`, {
        style: {
          background: "var(--bg-card)",
          color: "var(--text-primary)",
          border: "1px solid var(--border)",
        },
      });
      navigate(data.user.role === "admin" ? "/admin" : "/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed", {
        style: {
          background: "var(--bg-card)",
          color: "#ef4444",
          border: "1px solid #ef444444",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center px-4 relative overflow-hidden">
      <div
        className="absolute top-20 left-10 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle,#f97316,transparent)" }}
      />
      <div
        className="absolute bottom-10 right-10 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle,#3b82f6,transparent)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass p-8"
      >
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "linear-gradient(135deg,#f97316,#ef4444)" }}
          >
            <Package size={24} color="white" />
          </div>
          <h1 className="font-display font-bold text-2xl">Welcome back</h1>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--text-secondary)" }}
          >
            Sign in to your NEXUS account
          </p>
        </div>

        <form onSubmit={submit} autoComplete="off" className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">
              Email address
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-secondary)" }}
              />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handle}
                onPointerDown={() => setEnableSuggestions(true)}
                onFocus={() => setEnableSuggestions(true)}
                autoComplete={enableSuggestions ? "username" : "off"}
                readOnly={!enableSuggestions}
                required
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl outline-none text-sm transition-all"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Password</label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-secondary)" }}
              />
              <input
                name="password"
                type={show ? "text" : "password"}
                value={form.password}
                onChange={handle}
                onPointerDown={() => setEnableSuggestions(true)}
                onFocus={() => setEnableSuggestions(true)}
                autoComplete={enableSuggestions ? "current-password" : "off"}
                readOnly={!enableSuggestions}
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 rounded-xl outline-none text-sm transition-all"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-secondary)" }}
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p
          className="text-center text-sm mt-6"
          style={{ color: "var(--text-secondary)" }}
        >
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{ color: "var(--accent)" }}
            className="font-medium hover:underline"
          >
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
