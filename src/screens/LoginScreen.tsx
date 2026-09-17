import React, { useState } from 'react';
import { Beaker } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (email: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('giaovien@labhub.edu.vn');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [forgotModal, setForgotModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    if (!email.includes('@')) {
      setError('Định dạng email không hợp lệ.');
      return;
    }

    // Success -> proceed to SCREEN 02
    onLoginSuccess(email);
  };

  return (
    <div id="login-screen" className="min-h-full flex flex-col justify-center px-6 py-10 bg-white">
      {/* Top Center Logo & Title */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-[#EAF3FF] flex items-center justify-center text-[30px] border border-[#D9E2F0] shadow-xs">
          🧪
        </div>
        <h1 className="text-[26px] font-bold text-[#172033] tracking-tight">
          LAB HUB
        </h1>
        <p className="text-[14px] text-[#667085] mt-1">
          Quản lý thiết bị thực hành
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto w-full">
        <div>
          <label htmlFor="login-email" className="block text-[13px] font-semibold text-[#172033] mb-1.5">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError('');
            }}
            placeholder="teacher@school.edu.vn"
            className="w-full h-12 px-3.5 bg-[#F7F9FC] border border-[#D9E2F0] rounded-xl text-[15px] text-[#172033] placeholder-[#667085] focus:outline-none focus:border-[#1677FF] focus:bg-white focus:ring-2 focus:ring-[#1677FF]/15 transition-all"
          />
        </div>

        <div>
          <label htmlFor="login-password" className="block text-[13px] font-semibold text-[#172033] mb-1.5">
            Mật khẩu
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError('');
            }}
            placeholder="••••••••"
            className="w-full h-12 px-3.5 bg-[#F7F9FC] border border-[#D9E2F0] rounded-xl text-[15px] text-[#172033] placeholder-[#667085] focus:outline-none focus:border-[#1677FF] focus:bg-white focus:ring-2 focus:ring-[#1677FF]/15 transition-all"
          />
        </div>

        {/* Error message */}
        {error && (
          <div id="login-error" className="p-3 bg-[#FEF0F0] border border-[#EF4444]/30 rounded-xl text-[13px] text-[#EF4444] font-medium animate-fadeIn">
            {error}
          </div>
        )}

        {/* Main Login Button */}
        <button
          id="login-submit-btn"
          type="submit"
          className="w-full h-12 bg-[#1677FF] hover:bg-[#0B2A5B] active:scale-[0.99] text-white rounded-xl font-semibold text-[15px] shadow-sm transition-all flex items-center justify-center cursor-pointer"
        >
          ĐĂNG NHẬP
        </button>

        {/* Forgot Password */}
        <div className="text-center pt-2">
          <button
            id="forgot-password-link"
            type="button"
            onClick={() => setForgotModal(true)}
            className="text-[14px] text-[#1677FF] hover:underline font-medium cursor-pointer"
          >
            Quên mật khẩu?
          </button>
        </div>
      </form>

      {/* Forgot password dialog */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xs w-full p-5 border border-[#D9E2F0] shadow-xl text-center space-y-3">
            <h3 className="font-bold text-[16px] text-[#172033]">Khôi phục mật khẩu</h3>
            <p className="text-[13px] text-[#667085]">
              Vui lòng liên hệ cán bộ quản trị thiết bị nhà trường để được cấp lại mật khẩu truy cập LAB HUB.
            </p>
            <button
              onClick={() => setForgotModal(false)}
              className="w-full h-10 bg-[#1677FF] text-white rounded-xl font-semibold text-[14px]"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
