export const CREDIT_TEXT = "Developed, managed, and maintained by Rifqi Tjahyono";

export const CREDIT_LINKS = {
  linkedin: {
    href: "https://www.linkedin.com/in/rifqi-tjahjono/",
    label: "Rifqi Tjahyono on LinkedIn",
  },
  website: {
    href: "https://rifqi-tjahyono.com/",
    label: "Rifqi Tjahyono personal website",
  },
  github: {
    href: "https://github.com/RifqiMT/pm-collaboration",
    label: "TeamCompass on GitHub",
  },
  article: {
    href: "https://rifqi-tjahyono.com/%f0%9f%93%9d-sticky-note-chaos-to-team-clarity-reflect-together-review-progress-and-decide-what-comes-next-%f0%9f%a4%9d%f0%9f%a7%ad/",
    label: "Article: Sticky-Note Chaos to Team Clarity",
  },
} as const;

export function CreditFooter() {
  return (
    <footer className="credit-footer" aria-label="Developer credit">
      <p className="credit-footer-text">{CREDIT_TEXT}</p>
      <div className="credit-footer-links">
        <a
          href={CREDIT_LINKS.linkedin.href}
          className="credit-footer-link"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={CREDIT_LINKS.linkedin.label}
          title="LinkedIn"
        >
          <LinkedInIcon />
        </a>
        <a
          href={CREDIT_LINKS.website.href}
          className="credit-footer-link"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={CREDIT_LINKS.website.label}
          title="Personal website"
        >
          <WebsiteIcon />
        </a>
        <a
          href={CREDIT_LINKS.github.href}
          className="credit-footer-link"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={CREDIT_LINKS.github.label}
          title="GitHub"
        >
          <GitHubIcon />
        </a>
        <a
          href={CREDIT_LINKS.article.href}
          className="credit-footer-link"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={CREDIT_LINKS.article.label}
          title="Article"
        >
          <ArticleIcon />
        </a>
      </div>
    </footer>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.73V1.73C24 .77 23.21 0 22.23 0z"
      />
    </svg>
  );
}

function WebsiteIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm7.93 9h-3.17a15.4 15.4 0 0 0-1.3-5.08A8.03 8.03 0 0 1 19.93 11zM12 4.03c.9 1.2 1.6 2.95 1.97 4.97h-3.94C10.4 6.98 11.1 5.23 12 4.03zM4.07 13h3.17c.2 1.8.68 3.5 1.3 5.08A8.03 8.03 0 0 1 4.07 13zm3.17-2H4.07a8.03 8.03 0 0 1 4.47-5.08A15.4 15.4 0 0 0 7.24 11zm1.79 2h6.6c-.37 2.02-1.07 3.77-1.97 4.97-.9-1.2-1.6-2.95-1.97-4.97H9.03zm6.6-2h-6.6c.37-2.02 1.07-3.77 1.97-4.97.9 1.2 1.6 2.95 1.97 4.97h2.66zm.86 7.08c.62-1.58 1.1-3.28 1.3-5.08h3.17a8.03 8.03 0 0 1-4.47 5.08z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.28-.01-1.04-.02-2.04-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.05.14 3 .4 2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22 0 1.6-.01 2.89-.01 3.29 0 .32.22.7.82.58A12.01 12.01 0 0 0 24 12c0-6.63-5.37-12-12-12z"
      />
    </svg>
  );
}

function ArticleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm8 1.5V8h4.5L14 3.5zM8 11h8v1.5H8V11zm0 3.5h8V16H8v-1.5zm0 3.5h5V19H8v-1.5z"
      />
    </svg>
  );
}
