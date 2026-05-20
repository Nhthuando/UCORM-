import { useState } from 'react';
import { Store } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-700 p-3 rounded-xl mb-4">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">UCOrm</h1>
          <p className="text-gray-600 text-center">Quản trị đánh giá bằng AI</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>

          {isRegister && (
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                Xác nhận mật khẩu
              </label>
              <input
                id="confirm-password"
                type="password"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-700 text-white py-2.5 rounded-lg font-medium hover:bg-blue-800 transition-colors"
          >
            {isRegister ? 'Đăng ký' : 'Đăng nhập'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-blue-700 hover:text-blue-800 text-sm font-medium"
          >
            {isRegister ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
          </button>
        </div>
      </div>
    </div>
  );
}
