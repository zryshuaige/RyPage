type StudyHeadingProps = {
  id: string;
  eyebrow: string;
  name: string;
  title: string;
  description: string;
  status: string;
  href?: string;
};

export function StudyHeading({ id, eyebrow, name, title, description, status, href }: StudyHeadingProps) {
  return (
    <header className="study-heading">
      <div className="study-heading-meta">
        <p>{eyebrow}</p>
        <span className="study-status"><i aria-hidden="true" />{status}</span>
      </div>
      <h2 id={id}>{href ? <a className="study-name-link" href={href} target="_blank" rel="noreferrer">{name}<span aria-hidden="true">↗</span></a> : name}</h2>
      <div className="study-heading-copy">
        <h3>{title}</h3>
        <p>{description}</p>
        {href && <a href={href} target="_blank" rel="noreferrer">View on GitHub <span>↗</span></a>}
      </div>
    </header>
  );
}
