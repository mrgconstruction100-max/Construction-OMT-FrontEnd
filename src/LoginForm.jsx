import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import API from "./axios";
const LoginForm = () => {
    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false); 
    const [showPassword, setShowPassword] = useState(false); //sp
    const navigate = useNavigate();
    const {login} = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
     try {
      const res = await API.post("/auth/login", form);
     
      if (res.data.success) {
      
        login(res.data.user); // set user context
        navigate('/'); // redirect
  }
   else {
      setError(res.data.message || "Login failed");
    }
    } catch (err) {
     setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false); // ✅ reset loading always
    }
  };

  return (
  
       <div className="min-h-screen flex items-center justify-center px-4
    bg-gradient-to-br from-[#00b090] via-[#00a080] to-[#008361]">
      <div className="w-full max-w-md">
        <div className="bg-[hsl(var(--card))] shadow-[var(--shadow-elevated)] rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-center text-[hsl(var(--primary))] mb-6">
            Login
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1"
              >
                Username
              </label>
              <input
                type="text"
                id="email"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-2 rounded-lg border border-[hsl(var(--border))]
                  bg-[hsl(var(--input))] text-[hsl(var(--foreground))]
                  focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]
                  transition-[var(--transition-smooth)]"
              />
            </div>

            {/* Password */}
       
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1"
              >
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2 pr-10 rounded-lg border border-[hsl(var(--border))]
                    bg-[hsl(var(--input))] text-[hsl(var(--foreground))]
                    focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]
                    transition-[var(--transition-smooth)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
                 {error && <p style={{color:'red'}}>{error}</p>}
            {/* Login Button */}
            <button
              disabled={loading}
              type="submit"
              className="w-full py-2.5 rounded-lg font-medium
                text-[hsl(var(--primary-foreground))]
                bg-[hsl(var(--primary))] shadow-[var(--shadow-construction)]
                hover:bg-[hsl(var(--primary-dark))]
                transition-[var(--transition-bounce)]"
            >
             {loading ? "Logging in..." : "LOGIN"}
            </button>
          </form>

          {/* Extra Links */}
          {/* <div className="mt-5 text-center text-sm text-[hsl(var(--muted-foreground))]">
            <a
              href="#"
              className="text-[hsl(var(--secondary))] hover:underline"
            >
              Forgot password?
            </a>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
