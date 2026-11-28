type StudyHeadingProps = {
  id: string;
  eyebrow: string;
  name: string;
  title: string;
  description: string;
  status: string;
  category: string;
  flow: readonly [string, string, string];
  href?: string;
};

export function StudyHeading({ id, eyebrow, name, title, description, status, category, flow, href }: StudyHeadingProps) {
  return (
    <header className="study-heading">
      <div className="study-heading-meta">
        <p>{eyebrow}</p>
        <span className="study-status"><i aria-hidden="true" />{status}</span>
      </div>
      <h2 id={id}>{href ? <a className="study-name-link" href={href} target="_blank" rel="noreferrer">{name}<span aria-hidden="true">↗</span></a> : name}</h2>
      <div className="study-product-brief">
        <span>{category}</span>
        <div className="study-product-flow" aria-label={`产品流程：${flow.join("、")}`}>
          {flow.map((step, index) => <span key={step}><b>0{index + 1}</b>{step}{index < flow.length - 1 && <i aria-hidden="true">→</i>}</span>)}
        </div>
      </div>
      <div className="study-heading-copy">
        <h3>{title}</h3>
        <p>{description}</p>
        {href && <a href={href} target="_blank" rel="noreferrer">View on GitHub <span aria-hidden="true">↗</span></a>}
      </div>
    </header>
  );
}
