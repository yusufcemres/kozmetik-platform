'use client';

import { useState } from 'react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    try {
      const list = JSON.parse(localStorage.getItem('revela_newsletter') || '[]');
      if (!list.includes(email)) list.push(email);
      localStorage.setItem('revela_newsletter', JSON.stringify(list));
    } catch { /* ignore */ }
    setDone(true);
  }

  if (done) {
    return (
      <p className="text-sm text-primary font-semibold tracking-wide">
        Kaydın alındı! Teşekkürler.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-md mx-auto">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="E-posta adresin"
        className="flex-1 bg-surface border border-outline-variant/30 rounded-md px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
      />
      <button
        type="submit"
        className="curator-btn-primary text-sm px-6 py-3 whitespace-nowrap"
      >
        Abone Ol
      </button>
    </form>
  );
}
