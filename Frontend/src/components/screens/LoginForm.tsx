import { useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import mascotImage from '../../assets/mascot.png';

interface LoginFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

export default function LoginForm({ onBack, onSuccess }: LoginFormProps) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.username || !formData.password) return;
    
    setError('');
    setIsLoading(true);

    try {
      // TODO: Replace with actual FastAPI backend call
      // const response = await fetch('YOUR_FASTAPI_URL/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      // const data = await response.json();
      
      // Mock successful login for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store user data in localStorage for now (replace with proper auth later)
      localStorage.setItem('superbear_user', JSON.stringify({
        username: formData.username,
        // In production, this will come from your backend JWT token
      }));
      
      onSuccess();
    } catch (err) {
      setError('Login failed. Please check your credentials.');
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && formData.username && formData.password) {
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
            src={mascotImage} 
          />
        </div>

        {/* Title */}
        <h1 className="font-['Arimo:Bold',sans-serif] font-bold text-[48px] leading-[48px] text-center text-white tracking-[-1.2px] uppercase">
          LOGIN
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          {/* Username */}
          <div className="flex flex-col gap-2">
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="h-[60px] rounded-[12px] border-[5px] border-black bg-white px-4 font-['Arimo:Bold',sans-serif] font-bold text-[18px] text-black placeholder:text-black/40 focus:outline-none focus:border-[#f3ff00] transition-colors shadow-[4px_4px_0px_#000000]"
              placeholder="Enter username"
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
        </form>
      </div>
    </div>
  );
}