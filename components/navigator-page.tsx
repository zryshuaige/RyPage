"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { navSections, searchEngines, type NavLink } from "@/data/navigation";

function hostname(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, ""); }
  catch { return ""; }
}

function SiteIcon({ link }: { link: NavLink }) {
  const [failed, setFailed] = useState(false);
  const host = link.iconHost || hostname(link.url);
  if (failed || !host) return <span className="site-icon-fallback" aria-hidden="true">{link.name.slice(0, 1)}</span>;
  return <Image src={`https://www.google.com/s2/favicons?domain=${host}&sz=64`} alt="" width={22} height={22} unoptimized loading="lazy" onError={() => setFailed(true)} />;
}

export function NavigatorPage() {
  const [engineId, setEngineId] = useState(searchEngines[0].id);
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState(navSections[0].id);
  const inputRef = useRef<HTMLInputElement>(null);
  const engine = searchEngines.find((item) => item.id === engineId) ?? searchEngines[0];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const editing = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if ((event.key === "/" && !editing) || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k")) {
        event.preventDefault();
        inputRef.current?.focus();
      }
      if (event.key === "Escape") inputRef.current?.blur();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.find((entry) => entry.isIntersecting);
      if (visible) setActiveSection(visible.target.id.replace("section-", ""));
    }, { rootMargin: "-15% 0px -65% 0px" });
    navSections.forEach((section) => {
      const element = document.getElementById(`section-${section.id}`);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);

  const search = (event: FormEvent) => {
    event.preventDefault();
    const keyword = query.trim();
    if (!keyword) { inputRef.current?.focus(); return; }
    window.open(`${engine.baseUrl}${encodeURIComponent(keyword)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="navigator-page">
      <header className="navigator-hero">
        <p>SEARCH / LOOK OUTWARD</p>
        <h1>Where<br /><em>to?</em></h1>
        <span>One field. Six ways to find what comes next.</span>
      </header>
      <form className="search-console" onSubmit={search} role="search">
        <div className="search-console-top">
          <label htmlFor="engine">Search with</label>
          <select id="engine" value={engineId} onChange={(event) => setEngineId(event.target.value)}>{searchEngines.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
          <span>Press / to focus</span>
        </div>
        <div className="search-input-row">
          <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={engine.placeholder} aria-label="搜索关键词" autoComplete="off" />
          <button type="submit">Search <span>↗</span></button>
        </div>
      </form>
      <div className="directory-layout">
        <aside className="directory-nav" aria-label="网址分类">
          <p>Directory</p>
          {navSections.map((section, index) => (
            <button key={section.id} type="button" className={activeSection === section.id ? "is-active" : ""} onClick={() => document.getElementById(`section-${section.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}>
              <span>0{index + 1}</span><strong>{section.title}</strong><i>{section.links.length}</i>
            </button>
          ))}
        </aside>
        <div className="directory-sections">
          {navSections.map((section, index) => (
            <section key={section.id} id={`section-${section.id}`} className="directory-section" aria-labelledby={`title-${section.id}`}>
              <header><span>0{index + 1} / {section.english}</span><h2 id={`title-${section.id}`}>{section.title}</h2><p>{section.description}</p></header>
              <div className="directory-links">
                {section.links.map((link) => (
                  <a key={link.name} href={link.url} target="_blank" rel="noreferrer" className="directory-link">
                    <span className="directory-icon"><SiteIcon link={link} /></span>
                    <span className="directory-link-copy"><strong>{link.name}</strong><p>{link.description}</p><span>{hostname(link.url)}</span></span>
                    <i>{link.tag}</i><b>↗</b>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
