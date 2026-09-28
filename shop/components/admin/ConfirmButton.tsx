'use client';

// Verwijderknop met bevestiging, zoals data-confirm in het beheer van team262.nl
export default function ConfirmButton({ message, children }: { message: string; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="btn btn-danger btn-sm"
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
