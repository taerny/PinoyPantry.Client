import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

// Google reCAPTCHA v2 Invisible — no checkbox to tick. Each form calls execute() on submit;
// Google checks the visitor in the background and only shows a picture puzzle if it's
// suspicious. The site key is public (it's meant to be in the page); the secret that actually
// verifies the token lives only on the API. The key must be registered as an "Invisible
// reCAPTCHA badge" key. Local dev uses Google's test key (always passes) via .env.development.local.
const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;
const SCRIPT_SRC = 'https://www.google.com/recaptcha/api.js?render=explicit';
// If a puzzle is shown and the customer closes it without solving, Google never calls back —
// give up after this long so the form's button doesn't stay stuck on "Submitting...".
const EXECUTE_TIMEOUT_MS = 3 * 60 * 1000;

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      render: (el: HTMLElement, opts: Record<string, unknown>) => number;
      execute: (id?: number) => void;
      reset: (id?: number) => void;
    };
  }
}

// One shared script load no matter how many forms are on the page.
let scriptPromise: Promise<void> | null = null;
function loadScript(): Promise<void> {
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = SCRIPT_SRC;
      s.async = true;
      s.defer = true;
      s.onload = () => window.grecaptcha!.ready(() => resolve());
      s.onerror = () => {
        scriptPromise = null;
        reject(new Error('Could not load reCAPTCHA'));
      };
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
}

export interface RecaptchaHandle {
  // Runs the check and resolves with a fresh single-use token. Rejects with a message that's
  // fine to show the customer if the check can't be completed.
  execute: () => Promise<string>;
}

interface Pending {
  resolve: (token: string) => void;
  reject: (err: Error) => void;
  timer: number;
}

export const Recaptcha = forwardRef<RecaptchaHandle>(function Recaptcha(_props, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);
  const ready = useRef<Promise<void> | null>(null);
  const pending = useRef<Pending | null>(null);

  function settle(token: string | null, error?: string) {
    const p = pending.current;
    if (!p) return;
    pending.current = null;
    window.clearTimeout(p.timer);
    if (token) p.resolve(token);
    else p.reject(new Error(error ?? 'Security check failed. Please try again.'));
  }

  useEffect(() => {
    if (!SITE_KEY) return;
    let cancelled = false;
    ready.current = loadScript().then(() => {
      if (cancelled || !containerRef.current || widgetId.current !== null) return;
      widgetId.current = window.grecaptcha!.render(containerRef.current, {
        sitekey: SITE_KEY,
        size: 'invisible',
        // Shown in the form rather than floating over the page corner (where it would cover
        // the cart / chat buttons). Google requires the badge to stay visible.
        badge: 'inline',
        callback: (token: string) => settle(token),
        'expired-callback': () => settle(null, 'Security check expired. Please try again.'),
        'error-callback': () => settle(null, 'Security check could not load. Check your connection and try again.'),
      });
    });
    ready.current.catch(() => null);
    return () => {
      cancelled = true;
      settle(null);
    };
  }, []);

  useImperativeHandle(ref, () => ({
    execute: async () => {
      if (!SITE_KEY) throw new Error('reCAPTCHA is not configured (missing VITE_RECAPTCHA_SITE_KEY).');
      try {
        await ready.current;
      } catch {
        throw new Error('Security check could not load. Check your connection and try again.');
      }
      if (widgetId.current === null) throw new Error('Security check is still loading. Please try again.');

      // A previous attempt that never finished (e.g. puzzle closed) is abandoned.
      settle(null);
      return new Promise<string>((resolve, reject) => {
        const timer = window.setTimeout(
          () => settle(null, 'Security check was not completed. Please try again.'),
          EXECUTE_TIMEOUT_MS,
        );
        pending.current = { resolve, reject, timer };
        // Tokens are single-use, so always start from a clean widget.
        window.grecaptcha!.reset(widgetId.current!);
        window.grecaptcha!.execute(widgetId.current!);
      });
    },
  }));

  if (!SITE_KEY) {
    return <p className="text-xs text-[#D32F2F]">reCAPTCHA is not configured (missing VITE_RECAPTCHA_SITE_KEY).</p>;
  }

  return <div ref={containerRef} />;
});
