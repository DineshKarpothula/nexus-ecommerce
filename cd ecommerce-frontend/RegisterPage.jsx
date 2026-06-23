import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Package,
  Sparkles,
} from "lucide-react";
import { registerUser } from "./api.js";
import { setCredentials } from "./authSlice.js";
import { initCart } from "./cartSlice.js";
import {
  generateStrongPassword,
  getPasswordStrength,
} from "./passwordUtils.js";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    sellerBusinessName: "",
  });
  const [show, setShow] = useState(false);
  const [accountType, setAccountType] = useState("user");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const passwordStrength = getPasswordStrength(form.password);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const applySuggestedPassword = () => {
    const nextPassword = generateStrongPassword();
    setForm((prev) => ({
      ...prev,
      password: nextPassword,
      confirm: nextPassword,
    }));
    setShow(true);
    toast.success("Strong password generated", {
      style: {
        background: "var(--bg-card)",
        color: "var(--text-primary)",
        border: "1px solid var(--border)",
      },
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!passwordStrength.isStrong) {
      toast.error("Choose a stronger password before creating your account", {
        style: {
          background: "var(--bg-card)",
          color: "#ef4444",
          border: "1px solid #ef444444",
        },
      });
      return;
    }
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match", {
        style: {
          background: "var(--bg-card)",
          color: "#ef4444",
          border: "1px solid #ef444444",
        },
      });
      return;
    }
    setLoading(true);
    try {
      const { data } = await registerUser({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        registerAsSeller: accountType === "seller",
        sellerBusinessName:
          accountType === "seller" ? form.sellerBusinessName : "",
      });

      if (data.token) {
        dispatch(setCredentials({ user: data.user, token: data.token }));
        dispatch(initCart(data.user._id));
        toast.success("Account created! Welcome!", {
          style: {
            background: "var(--bg-card)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
          },
        });
        navigate("/");
      } else {
        toast.success(
          data.message ||
            "Seller registration submitted. Wait for admin approval.",
          {
            style: {
              background: "var(--bg-card)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            },
          },
        );
        navigate("/login");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed", {
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

  const fields = [
    {
      name: "name",
      label: "Full Name",
      type: "text",
      icon: User,
      placeholder: "John Doe",
    },
    {
      name: "email",
      label: "Email Address",
      type: "email",
      icon: Mail,
      placeholder: "you@example.com",
    },
    {
      name: "phone",
      label: "Phone Number",
      type: "tel",
      icon: Phone,
      placeholder: "+91 9876543210",
    },
    {
      name: "password",
      label: "Password",
      type: show ? "text" : "password",
      icon: Lock,
      placeholder: "••••••••",
      hasToggle: true,
    },
    {
      name: "confirm",
      label: "Confirm Password",
      type: show ? "text" : "password",
      icon: Lock,
      placeholder: "••••••••",
    },
  ];

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div
        className="absolute top-20 right-10 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle,#f97316,transparent)" }}
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
          <h1 className="font-display font-bold text-2xl">Create Account</h1>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--text-secondary)" }}
          >
            Join millions of NEXUS shoppers
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">
              Account Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAccountType("user")}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold"
                style={{
                  background:
                    accountType === "user" ? "#00e5ff" : "var(--bg-elevated)",
                  border: "2px solid #000",
                  boxShadow: accountType === "user" ? "3px 3px 0 #000" : "none",
                }}
              >
                User
              </button>
              <button
                type="button"
                onClick={() => setAccountType("seller")}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold"
                style={{
                  background:
                    accountType === "seller" ? "#00e5ff" : "var(--bg-elevated)",
                  border: "2px solid #000",
                  boxShadow:
                    accountType === "seller" ? "3px 3px 0 #000" : "none",
                }}
              >
                Seller
              </button>
            </div>
          </div>

          {accountType === "seller" && (
            <div>
              <label className="text-sm font-medium block mb-1.5">
                Business Name
              </label>
              <div className="relative">
                <Package
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-secondary)" }}
                />
                <input
                  name="sellerBusinessName"
                  type="text"
                  value={form.sellerBusinessName}
                  onChange={handle}
                  required
                  placeholder="Your store name"
                  className="w-full pl-10 pr-4 py-3 rounded-xl outline-none text-sm transition-all"
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>
            </div>
          )}

          {fields.map(
            ({ name, label, type, icon: Icon, placeholder, hasToggle }) => (
              <div key={name}>
                <label className="text-sm font-medium block mb-1.5">
                  {label}
                </label>
                <div className="relative">
                  <Icon
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-secondary)" }}
                  />
                  <input
                    name={name}
                    type={type}
                    value={form[name]}
                    onChange={handle}
                    required
                    placeholder={placeholder}
                    className="w-full pl-10 pr-10 py-3 rounded-xl outline-none text-sm transition-all"
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                  />
                  {hasToggle && (
                    <button
                      type="button"
                      onClick={() => setShow(!show)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  )}
                </div>
              </div>
            ),
          )}

          <div
            className="space-y-3 rounded-2xl p-4"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Password strength</p>
                <p
                  className="text-xs"
                  style={{ color: passwordStrength.color }}
                >
                  {passwordStrength.label}
                </p>
              </div>
              <button
                type="button"
                onClick={applySuggestedPassword}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
                style={{
                  background: "rgba(249,115,22,0.12)",
                  color: "var(--accent)",
                  border: "1px solid rgba(249,115,22,0.25)",
                }}
              >
                <Sparkles size={14} /> Suggest strong password
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((step) => (
                <div
                  key={step}
                  className="h-2 rounded-full"
                  style={{
                    background:
                      step <= passwordStrength.score
                        ? passwordStrength.color
                        : "rgba(255,255,255,0.08)",
                    opacity: step <= passwordStrength.score ? 1 : 0.6,
                  }}
                />
              ))}
            </div>

            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs"
              style={{ color: "var(--text-secondary)" }}
            >
              <div
                style={{
                  color: passwordStrength.checks.length
                    ? "#22c55e"
                    : "var(--text-secondary)",
                }}
              >
                8+ characters
              </div>
              <div
                style={{
                  color: passwordStrength.checks.uppercase
                    ? "#22c55e"
                    : "var(--text-secondary)",
                }}
              >
                Uppercase letter
              </div>
              <div
                style={{
                  color: passwordStrength.checks.lowercase
                    ? "#22c55e"
                    : "var(--text-secondary)",
                }}
              >
                Lowercase letter
              </div>
              <div
                style={{
                  color: passwordStrength.checks.number
                    ? "#22c55e"
                    : "var(--text-secondary)",
                }}
              >
                Number
              </div>
              <div
                style={{
                  color: passwordStrength.checks.symbol
                    ? "#22c55e"
                    : "var(--text-secondary)",
                }}
              >
                Symbol
              </div>
            </div>
          </div>

          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            By creating an account you agree to our{" "}
            <span
              style={{ color: "var(--accent)" }}
              className="cursor-pointer hover:underline"
            >
              Terms
            </span>{" "}
            and{" "}
            <span
              style={{ color: "var(--accent)" }}
              className="cursor-pointer hover:underline"
            >
              Privacy Policy
            </span>
            .
          </p>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p
          className="text-center text-sm mt-6"
          style={{ color: "var(--text-secondary)" }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            style={{ color: "var(--accent)" }}
            className="font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
