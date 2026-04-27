import { useRef } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';

const SITE_KEY = import.meta.env.VITE_HCAPTCHA_SITE_KEY || '10000000-ffff-ffff-ffff-000000000001';

export default function HCaptchaField({ onVerify, onExpire }) {
  const captchaRef = useRef(null);

  return (
    <div className="flex justify-center">
      <HCaptcha
        ref={captchaRef}
        sitekey={SITE_KEY}
        onVerify={onVerify}
        onExpire={onExpire}
        theme="light"
      />
    </div>
  );
}
