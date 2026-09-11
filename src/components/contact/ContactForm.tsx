import { useState } from 'react';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const ENDPOINT = import.meta.env.PUBLIC_CONTACT_FORM_ENDPOINT;

function Field({
  id,
  label,
  type = 'text',
  placeholder,
  required = false,
  value,
  onChange,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-1 flex-col gap-2 items-start w-full">
      <label htmlFor={id} className="font-body font-medium text-body-sm text-ink">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="font-body font-normal text-body-md text-ink placeholder:text-muted bg-surface rounded-lg p-4 w-full outline-none focus:ring-2 focus:ring-ink"
      />
    </div>
  );
}

// Static Astro build, no server — submissions post straight to a Google Apps
// Script Web App (see scripts/google-apps-script-contact-form.gs for the
// backend + one-time deploy steps). Swap ENDPOINT for any other webhook-style
// form backend without changing this component.
export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [company, setCompany] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot: real visitors never see or fill this field (see the input's
    // own styling below). A bot that auto-fills every field in the form will
    // populate it, so a non-empty value here means silently drop the
    // submission instead of sending it — no error shown, so the bot gets no
    // signal that it was caught.
    if (company) {
      setStatus('success');
      return;
    }

    if (!ENDPOINT) {
      setStatus('error');
      return;
    }

    setStatus('submitting');

    try {
      const body = new FormData();
      body.append('name', name);
      body.append('email', email);
      body.append('message', message);

      // Apps Script web apps don't reliably send CORS headers for
      // non-form-encoded bodies, so this is submitted as FormData (a
      // CORS-safelisted content type) to avoid a failing preflight request.
      await fetch(ENDPOINT, { method: 'POST', body });

      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
      setCompany('');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <section className="flex justify-center px-[100px] max-lg:px-10 max-md:px-4 py-20 w-full bg-background">
        <div className="flex flex-col gap-2 items-center text-center max-w-[600px] w-full">
          <p className="font-heading text-h5 text-ink w-full">Thanks for reaching out</p>
          <p className="font-body font-normal text-body-md text-muted w-full">We'll get back to you shortly.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex justify-center px-[100px] max-lg:px-10 max-md:px-4 py-20 w-full bg-background">
      <form onSubmit={handleSubmit} className="flex flex-col gap-8 items-start w-full max-w-[600px]">
        {/* Honeypot — clipped to 1px (Tailwind's sr-only, chosen over an
            off-screen offset so it can't affect page layout/scroll), not in
            tab order, hidden from screen readers, and left unlabeled so a
            browser autofill won't touch it either. Bots that fill every
            field in a form will fill this one; handleSubmit silently drops
            the submission when it's non-empty. */}
        <input
          type="text"
          name="company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="sr-only"
        />
        <Field id="name" label="Name" placeholder="Your name" required value={name} onChange={setName} />
        <Field id="email" label="Email" type="email" placeholder="you@example.com" required value={email} onChange={setEmail} />
        <div className="flex flex-col gap-2 items-start w-full">
          <label htmlFor="message" className="font-body font-medium text-body-sm text-ink">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={6}
            placeholder="Type your message here"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="font-body font-normal text-body-md text-ink placeholder:text-muted bg-surface rounded-lg p-4 w-full outline-none focus:ring-2 focus:ring-ink resize-y"
          />
        </div>

        {status === 'error' && (
          <p className="font-body font-normal text-body-sm text-red-600 w-full">
            Something went wrong sending your message. Please try again or email us directly.
          </p>
        )}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="bg-ink text-background hover:bg-background hover:text-ink flex gap-3 items-center justify-center rounded-lg border-2 border-transparent hover:border-ink transition-colors duration-300 px-5 py-3 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="font-body font-medium text-body-md whitespace-nowrap">
            {status === 'submitting' ? 'Sending…' : 'Send message'}
          </span>
        </button>
      </form>
    </section>
  );
}
