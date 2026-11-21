import type { ReactNode } from "react";

type StudyHeadingProps = {
  id: string;
  eyebrow: string;
  name: string;
  title: string;
  description: string;
  status: string;
  href?: string;
  children?: ReactNode;
};

export function StudyHeading({ id, eyebrow, name, title, description, status, href, children }: StudyHeadingProps) {
  return (
    <header className="study-heading">
      <div className="study-heading-meta">
        <p>{eyebrow}</p>
        <span className="study-status"><i aria-hidden="true" />{status}</span>
      </div>
      <h2 id={id}>{name}</h2>
      <div className="study-heading-copy">
        <h3>{title}</h3>
        <p>{description}</p>
        {href && <a href={href} target="_blank" rel="noreferrer">View on GitHub <span>↗</span></a>}
        {children}
      </div>
    </header>
  );
}
