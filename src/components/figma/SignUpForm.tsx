import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import imgChatGptImageFeb72026034014Pm1 from "figma:asset/c47576d9fb019c19ae2380c4945c7cde9e97a55b.png";

interface SignUpFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

export default function SignUpForm({ onBack, onSuccess }: SignUpFormProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // TODO: Replace with actual FastAPI backend call
      // const response = await fetch('YOUR_FASTAPI_URL/api/auth/signup', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      // const data = await response.json();
      
      // Mock successful signup for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store user data in localStorage for now (replace with proper auth later)
      localStorage.setItem('superbear_user', JSON.stringify({
        username: formData.username,
        email: formData.email,
        // In production, this will come from your backend JWT token
      }));
      
      onSuccess();
    } catch (err) {
      setError('Sign up failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
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
          SIGN UP
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          {/* Username */}
          <div className="flex flex-col gap-2">
            <label 
              htmlFor="username"
              className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-white uppercase tracking-wide"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="h-[60px] rounded-[12px] border-[5px] border-black bg-white px-4 font-['Arimo:Bold',sans-serif] font-bold text-[18px] text-black placeholder:text-black/40 focus:outline-none focus:border-[#f3ff00] transition-colors shadow-[4px_4px_0px_#000000]"
              placeholder="Enter username"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label 
              htmlFor="email"
              className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-white uppercase tracking-wide"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="h-[60px] rounded-[12px] border-[5px] border-black bg-white px-4 font-['Arimo:Bold',sans-serif] font-bold text-[18px] text-black placeholder:text-black/40 focus:outline-none focus:border-[#f3ff00] transition-colors shadow-[4px_4px_0px_#000000]"
              placeholder="Enter email"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label 
              htmlFor="password"
              className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-white uppercase tracking-wide"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={4}
              className="h-[60px] rounded-[12px] border-[5px] border-black bg-white px-4 font-['Arimo:Bold',sans-serif] font-bold text-[18px] text-black placeholder:text-black/40 focus:outline-none focus:border-[#f3ff00] transition-colors shadow-[4px_4px_0px_#000000]"
              placeholder="Enter password"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-[#ff1814] border-[3px] border-black rounded-[12px] p-3 text-center">
              <p className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-white uppercase">
                {error}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="offset"
            disabled={isLoading}
            className="h-[68px] rounded-[16px] w-full font-['Arimo:Bold',sans-serif] text-[24px] tracking-wide uppercase mt-2"
          >
            {isLoading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
          </Button>
        </form>

        {/* Login Link */}
        <p className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-white text-center">
          Already have an account?{' '}
          <button
            onClick={onBack}
            className="text-[#f3ff00] hover:underline uppercase"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}