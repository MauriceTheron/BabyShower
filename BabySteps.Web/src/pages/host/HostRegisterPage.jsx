import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Baby } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PhoneInput from '../../components/PhoneInput';
import HCaptchaField from '../../components/HCaptchaField';

export default function HostRegisterPage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    phoneCountryCode: '+27',
    password: '',
    confirmPassword: '',
  });
  const [captchaToken, setCaptchaToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { hostRegister } = useAuth();
  const navigate = useNavigate();

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!captchaToken) {
      setError('Please complete the captcha.');
      return;
    }

    setLoading(true);
    try {
      await hostRegister({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        phoneCountryCode: form.phoneCountryCode,
        password: form.password,
        captchaToken,
      });
      navigate('/host/create-event');
    } catch (err) {
      const msg = err.response?.data;
      setError(typeof msg === 'string' ? msg : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-header/30 bg-white";

  return (
    <div className="bg-background min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="bg-header rounded-full p-4">
            <Baby size={36} className="text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 text-center mb-1">Create your account</h1>
        <p className="text-gray-500 text-sm text-center mb-6">Host your baby shower registry</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-3">
            <input value={form.firstName} onChange={set('firstName')} placeholder="First name" required className={inputClass} />
            <input value={form.lastName} onChange={set('lastName')} placeholder="Last name" required className={inputClass} />
          </div>

          <input
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="Email address"
            required
            className={inputClass}
          />

          <PhoneInput
            value={form.phoneNumber}
            countryCode={form.phoneCountryCode}
            onValueChange={(v) => setForm(f => ({ ...f, phoneNumber: v }))}
            onCountryChange={(v) => setForm(f => ({ ...f, phoneCountryCode: v }))}
          />

          <input
            type="password"
            value={form.password}
            onChange={set('password')}
            placeholder="Password (min 6 characters)"
            required
            className={inputClass}
          />
          <input
            type="password"
            value={form.confirmPassword}
            onChange={set('confirmPassword')}
            placeholder="Confirm password"
            required
            className={inputClass}
          />

          <HCaptchaField
            onVerify={(token) => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken('')}
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-header text-white font-bold py-3.5 rounded-2xl disabled:opacity-50 active:opacity-90"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/host/login" className="text-header font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
