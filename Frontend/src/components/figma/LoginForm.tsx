import { useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import imgChatGptImageFeb72026034014Pm1 from "figma:asset/c47576d9fb019c19ae2380c4945c7cde9e97a55b.png";
import { login } from "../../api/auth";

interface LoginFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

export default function LoginForm({ onBack, onSuccess }: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.email || !formData.password) return;

    setError("");
    setIsLoading(true);

    try {
      await login({
        email: formData.email,
        password: formData.password,
      });

      onSuccess();
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { detail?: string }; status?: number };
      };
      if (axiosError.response?.status === 401) {
        setError("Invalid email or password.");
      } else if (axiosError.response?.data?.detail) {
        setError(axiosError.response.data.detail);
      } else {
        setError("Login failed. Please check your credentials.");
      }
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && formData.email && formData.password) {
      handleSubmit();
    }
  };

  return (
    <div className="bg-[var(--bg-primary)] flex items-center justify-center min-h-screen w-full">
      <div className="flex flex-col items-center gap-6 w-full max-w-[520px] px-6">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="self-start flex items-center gap-2 text-white hover:text-[#f3ff00] transition-colors"
        >
          <ArrowLeft size={24} />
          <span className="font-['Arimo:Bold',sans-serif] font-bold text-[16px] uppercase">
            Back
          </span>
        </button>

        {/* Mascot */}
        <div className="w-[180px] h-[180px] rounded-full overflow-hidden">
          <img
            alt="SuperBear mascot"
            className="w-full h-full object-cover"
            src={imgChatGptImageFeb72026034014Pm1}
          />
        </div>

        {/* Title */}
        <h1 className="font-['Arimo:Bold',sans-serif] font-bold text-[48px] leading-[48px] text-center text-white tracking-[-1.2px] uppercase">
          LOGIN
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-2">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="h-[60px] rounded-[12px] border-[5px] border-black bg-white px-4 font-['Arimo:Bold',sans-serif] font-bold text-[18px] text-black placeholder:text-black/40 focus:outline-none focus:border-[#f3ff00] transition-colors shadow-[4px_4px_0px_#000000]"
              placeholder="Enter email"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              required
              disabled={isLoading}
              minLength={4}
              className="h-[60px] rounded-[12px] border-[5px] border-black bg-white px-4 font-['Arimo:Bold',sans-serif] font-bold text-[18px] text-black placeholder:text-black/40 focus:outline-none focus:border-[#f3ff00] transition-colors shadow-[4px_4px_0px_#000000] w-full"
              placeholder="Enter password"
            />
          </div>

          {/* Forgot Password Link */}
          <button
            type="button"
            className="self-end font-['Arimo:Bold',sans-serif] font-bold text-[13px] text-[#f3ff00] hover:underline uppercase"
          >
            Forgot Password?
          </button>

          {/* Error Message */}
          {error && (
            <div className="bg-[#ff1814] border-[3px] border-black rounded-[12px] p-3 text-center">
              <p className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-white uppercase">
                {error}
              </p>
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading || !formData.email || !formData.password}
            className="w-full h-[60px] mt-4 rounded-[12px] border-[5px] border-black bg-[#f3ff00] font-['Arimo:Bold',sans-serif] font-bold text-[20px] text-black uppercase tracking-wide shadow-[4px_4px_0px_#000000] hover:bg-[#d4e000] hover:shadow-[6px_6px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] active:shadow-[2px_2px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[4px_4px_0px_#000000] disabled:hover:translate-x-0 disabled:hover:translate-y-0 flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <span className="animate-pulse">Logging in...</span>
            ) : (
              <>
                <span>Login</span>
                <Send size={22} strokeWidth={3} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
