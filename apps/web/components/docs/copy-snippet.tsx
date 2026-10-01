'use client';

import { useHydrated } from '../../lib/use-hydrated';

import { useEffect, useState } from 'react';
import { Check, Copy } from '@phosphor-icons/react';

export function CopySnippet({ code, label }: { code: string; label: string }) {
  const hydrated = useHydrated();
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  useEffect(() => {
    if (status === 'idle') return;
    const timer = setTimeout(() => setStatus('idle'), 2500);
    return () => clearTimeout(timer);
  }, [status]);
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setStatus('copied');
    } catch {
      setStatus('error');
    }
  }
  return (
    <div className="docs-copy-control">
      <span role="status">
        {status === 'error'
          ? 'Select the code to copy manually.'
          : status === 'copied'
            ? 'Copied!'
            : ''}
      </span>
      <button
        disabled={!hydrated}
        type="button"
        onClick={copy}
        aria-label={`Copy ${label}`}
        title={`Copy ${label}`}
      >
        {status === 'copied' ? <Check size={15} /> : <Copy size={15} />}
        <span>{status === 'copied' ? 'Copied' : 'Copy'}</span>
      </button>
    </div>
  );
}
