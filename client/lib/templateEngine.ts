// lib/templateEngine.ts
// ============================================================================
// TEMPLATE ENGINE — ported from the validated vanilla-JS prototype engine.
// One generator, reused everywhere: template picker mini-previews, the
// freelancer's live project view, and the client's public preview page.
// Template (layout) + Theme (colour tokens) + Motion (timing tokens) +
// Pages (which sections exist) combine into a single interactive document
// that gets dropped into an <iframe srcDoc={...}>.
//
// "Common" vs "one by one": templateId is the project's default template.
// sectionTemplates lets specific sections (chrome = navbar+footer, or any
// individual page) use a DIFFERENT template than the default. Theme and
// motion stay global — mixing colours/timing per section would look broken,
// only the structural/layout language (template) is mixable.
// ============================================================================

export type TemplateId = "modern" | "minimal" | "bold";
export type ThemeId = "blue" | "green" | "purple" | "orange" | "dark" | "neutral";
export type MotionId = "subtle" | "smooth" | "dynamic";
export type PageId = "home" | "about" | "services" | "contact" | "login";
export type SectionKey = "chrome" | "home" | "about" | "services" | "contact" | "login";

export interface PrototypeConfig {
  templateId: TemplateId;
  themeId: ThemeId;
  motionId: MotionId;
  pages: PageId[];
  /** Overrides the template's built-in business name (e.g. "Halcyon Consulting") with the freelancer's real client. */
  brandName?: string;
  /**
   * "One by one" mode — lets specific sections use a different template than
   * `templateId` (the default). "Common" mode is simply this being absent —
   * every existing project with no overrides renders exactly as before.
   * "chrome" covers the navbar + footer together, since they're shared
   * site-wide UI rather than tied to any one page.
   */
  sectionTemplates?: Partial<Record<SectionKey, TemplateId>>;
  /** Freelancer-edited copy, one full page's worth at a time — replaces that page's template defaults entirely when present. */
  contentOverrides?: Partial<{
    home: ContentHome;
    about: ContentAbout;
    services: ContentServices;
    contact: ContentContact;
    nav: ContentNav;
    footer: ContentFooter;
  }>;
}

interface ThemeDef {
  label: string;
  vibe: string;
  primary: string;
  hover: string;
  c900: string;
  c700: string;
  c500: string;
  c300: string;
  c100: string;
  accent: string;
  onPrimary: string;
  band: string;
  bandInk: string;
  bgDark?: boolean;
}

interface MotionDef {
  label: string;
  copy: string;
  dur: string;
  ease: string;
  rise: string;
  stagger: number;
  scaleFrom: string;
}

interface TemplateMetaDef {
  name: string;
  category: string;
  tagline: string;
  layoutName: string;
  defaultTheme: ThemeId;
}

export const THEMES: Record<ThemeId, ThemeDef> = {
  blue: {
    label: "Blue", vibe: "Clean, confident, built to be trusted",
    primary: "#3457F5", hover: "#2643C9",
    c900: "#0F1424", c700: "#454B63", c500: "#6C7288", c300: "#C9CDDC", c100: "#EEF0F8",
    accent: "#7FB2FF", onPrimary: "#FFFFFF", band: "#0F1424", bandInk: "#FFFFFF"
  },
  green: {
    label: "Green", vibe: "Grounded, natural, growth-minded",
    primary: "#12946B", hover: "#0C7C58",
    c900: "#0D1A16", c700: "#42544D", c500: "#69796F", c300: "#CBDCD3", c100: "#EFF7F2",
    accent: "#7BE3B8", onPrimary: "#FFFFFF", band: "#0D1A16", bandInk: "#FFFFFF"
  },
  purple: {
    label: "Purple", vibe: "Imaginative, expressive, a little daring",
    primary: "#7A45FF", hover: "#652FE0",
    c900: "#160F27", c700: "#493F5C", c500: "#6E637F", c300: "#DACEF5", c100: "#F5F0FF",
    accent: "#C6A8FF", onPrimary: "#FFFFFF", band: "#160F27", bandInk: "#FFFFFF"
  },
  orange: {
    label: "Orange", vibe: "Energetic, warm, hard to ignore",
    primary: "#E85C1F", hover: "#C7480F",
    c900: "#241408", c700: "#5C4634", c500: "#816B57", c300: "#F2D2B4", c100: "#FCF1E7",
    accent: "#FFB877", onPrimary: "#FFFFFF", band: "#241408", bandInk: "#FFFFFF"
  },
  dark: {
    label: "Dark", vibe: "Moody, premium, after-hours",
    primary: "#6E8CFF", hover: "#8CA4FF",
    bgDark: true,
    c900: "#F1F3FA", c700: "#B7BCCC", c500: "#8990A6", c300: "#2A2E3A", c100: "#181B24",
    accent: "#66E0C4", onPrimary: "#0B0D12", band: "#050609", bandInk: "#F1F3FA"
  },
  neutral: {
    label: "Neutral", vibe: "Monochrome, editorial, precise",
    primary: "#1E2230", hover: "#3A3F52",
    c900: "#14161C", c700: "#4B4F5B", c500: "#767A87", c300: "#D8D9DF", c100: "#F3F3F5",
    accent: "#9A9FB0", onPrimary: "#FFFFFF", band: "#14161C", bandInk: "#FFFFFF"
  }
};

export const MOTION: Record<MotionId, MotionDef> = {
  subtle:  { label: "Subtle",  copy: "Restrained. A quiet fade, nothing more.",       dur: "320ms", ease: "cubic-bezier(.4,0,.2,1)",      rise: "8px",  stagger: 40,  scaleFrom: "1"    },
  smooth:  { label: "Smooth",  copy: "Elegant reveals with a gentle, staggered lift.", dur: "620ms", ease: "cubic-bezier(.16,1,.3,1)",     rise: "26px", stagger: 90,  scaleFrom: "0.98" },
  dynamic: { label: "Dynamic", copy: "Expressive movement with a confident overshoot.",dur: "780ms", ease: "cubic-bezier(.34,1.56,.64,1)", rise: "46px", stagger: 130, scaleFrom: "0.92" }
};

export const PAGE_ORDER: PageId[] = ["home", "about", "services", "contact", "login"];
export const PAGE_LABELS: Record<PageId, string> = {
  home: "Home", about: "About", services: "Services", contact: "Contact", login: "Login"
};

export const TEMPLATE_META: Record<TemplateId, TemplateMetaDef> = {
  modern: { name: "Halcyon Consulting", category: "Professional", tagline: "Confident, corporate-calm, built on trust", layoutName: "Modern Business", defaultTheme: "blue" },
  minimal: { name: "Studio Vale", category: "Minimal", tagline: "Editorial restraint, generous whitespace", layoutName: "Minimal Studio", defaultTheme: "neutral" },
  bold: { name: "Nova Collective", category: "Bold / Creative", tagline: "Oversized type, dark hero, expressive motion", layoutName: "Bold Creative", defaultTheme: "purple" }
};

function themeVarBlock(id: ThemeId, t: ThemeDef): string {
  return `[data-theme="${id}"]{
    --primary:${t.primary}; --primary-hover:${t.hover}; --accent:${t.accent}; --on-primary:${t.onPrimary};
    --c900:${t.c900}; --c700:${t.c700}; --c500:${t.c500}; --c300:${t.c300}; --c100:${t.c100};
    --band:${t.band}; --band-ink:${t.bandInk};
    --bg:${t.bgDark ? t.c100 : "#FFFFFF"}; --surface:${t.bgDark ? "#20232E" : t.c100};
    --border:${t.bgDark ? "#31353F" : t.c300}; --text:${t.c900}; --muted:${t.c500};
  }`;
}
function motionVarBlock(id: MotionId, m: MotionDef): string {
  return `[data-motion="${id}"]{ --dur:${m.dur}; --ease:${m.ease}; --rise:${m.rise}; --scale-from:${m.scaleFrom}; }`;
}

const CSS_ANIMATIONS = `
  .rv{opacity:0; transform:translateY(var(--rise)) scale(var(--scale-from)); transition:opacity var(--dur) var(--ease), transform var(--dur) var(--ease);}
  .rv.in{opacity:1; transform:translateY(0) scale(1);}
  .btn{transition:transform .25s var(--ease), background-color .2s, box-shadow .2s;}
  .btn:active{transform:scale(.97);}
  .card{transition:transform .35s var(--ease), border-color .3s;}
  .card:hover{transform:translateY(-4px);}
`;

const CSS_RESPONSIVE = `
  @media (max-width:860px){
    section{padding:64px 6vw;}
    .grid3, .grid2, .split{grid-template-columns:1fr;}
    .nav-links{display:none;}
    .nav-burger{display:flex;}
    .cta-band{margin:0 6vw; padding:44px 26px;}
    footer.site{padding:48px 6vw 32px;}
  }
`;

const CSS_COMPONENTS = `
  *{box-sizing:border-box;}
  html{scroll-behavior:smooth;}
  body{
    margin:0; background:var(--bg); color:var(--text); overflow-x:hidden;
    font-family:'Inter',system-ui,-apple-system,sans-serif; -webkit-font-smoothing:antialiased;
    transition:background-color .4s ease, color .4s ease;
  }
  a{color:inherit; text-decoration:none;}
  img,svg{display:block; max-width:100%;}
  button{font-family:inherit; cursor:pointer;}
  section{padding:96px 8vw;}
  .page{display:none;}
  .page.is-active{display:block;}
  .eyebrow{
    font-family:'IBM Plex Mono',monospace; font-size:12px; letter-spacing:.14em; text-transform:uppercase;
    color:var(--primary); display:inline-flex; align-items:center; gap:8px; margin-bottom:18px;
  }
  .eyebrow::before{content:""; width:16px; height:1px; background:var(--primary);}
  h1,h2,h3{margin:0; font-weight:650; line-height:1.08; letter-spacing:-.01em;}
  h1{font-size:clamp(38px,5.6vw,72px);}
  h2{font-size:clamp(28px,3.4vw,42px);}
  h3{font-size:19px;}
  p{line-height:1.65; color:var(--muted); margin:0;}
  .lede{font-size:clamp(16px,1.5vw,19px); max-width:56ch;}

  .nav{position:sticky; top:0; z-index:40; display:flex; align-items:center; justify-content:space-between;
    padding:22px 8vw; background:color-mix(in srgb, var(--bg) 86%, transparent); backdrop-filter:blur(10px);
    border-bottom:1px solid var(--border); transition:background-color .4s ease, border-color .4s ease;}
  .nav-brand{display:flex; align-items:center; gap:10px; font-weight:700; font-size:16px; letter-spacing:-.01em;}
  .nav-mark{width:26px; height:26px; border-radius:8px; background:var(--primary); flex:none;}
  .nav-links{display:flex; gap:30px; font-size:14px; color:var(--muted); font-weight:500;}
  .nav-links a{padding:6px 0; border-bottom:2px solid transparent; transition:color .2s, border-color .2s; cursor:pointer;}
  .nav-links a:hover{color:var(--text);}
  .nav-links a.active{color:var(--text); border-color:var(--primary);}
  .nav-cta{display:flex; gap:10px; align-items:center;}
  .nav-burger{display:none; width:38px; height:38px; border-radius:10px; border:1px solid var(--border); background:none; align-items:center; justify-content:center;}

  .btn{display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:13px 22px; border-radius:11px;
    font-weight:600; font-size:14.5px; border:1px solid transparent; transition:transform .25s var(--ease), background-color .2s, box-shadow .2s; white-space:nowrap;}
  .btn:active{transform:scale(.97);}
  .btn-primary{background:var(--primary); color:var(--on-primary); box-shadow:0 10px 24px -12px var(--primary);}
  .btn-primary:hover{background:var(--primary-hover);}
  .btn-ghost{background:transparent; color:var(--text); border-color:var(--border);}
  .btn-ghost:hover{border-color:var(--primary); color:var(--primary);}
  .btn-sm{padding:9px 16px; font-size:13px; border-radius:9px;}

  .hero{padding-top:88px; padding-bottom:80px; display:grid; gap:56px;}
  .hero-copy{max-width:640px;}
  .hero-copy h1{margin-bottom:22px;}
  .hero-actions{display:flex; gap:14px; margin-top:34px; flex-wrap:wrap;}
  .hero-stats{display:flex; gap:36px; margin-top:52px; flex-wrap:wrap;}
  .stat b{display:block; font-size:26px; font-weight:700;}
  .stat span{font-size:13px; color:var(--muted);}
  .hero-art{border-radius:20px; background:var(--surface); border:1px solid var(--border); aspect-ratio:4/3; position:relative; overflow:hidden;}
  .hero-art .blob{position:absolute; inset:-20%; background:linear-gradient(135deg, var(--primary), var(--accent)); opacity:.22; filter:blur(40px);}
  .hero-art .grid-lines{position:absolute; inset:0; background-image:linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px); background-size:34px 34px; opacity:.5;}
  .hero-art .card{position:absolute; background:var(--bg); border:1px solid var(--border); border-radius:14px; box-shadow:0 20px 40px -20px rgba(0,0,0,.25);}

  .strip{padding:36px 8vw; border-top:1px solid var(--border); border-bottom:1px solid var(--border); display:flex; gap:44px; justify-content:space-between; flex-wrap:wrap;}
  .strip span{font-family:'IBM Plex Mono',monospace; font-size:12px; letter-spacing:.08em; color:var(--muted);}

  .s-head{max-width:620px; margin-bottom:52px;}
  .s-head h2{margin-bottom:16px;}

  .grid3{display:grid; grid-template-columns:repeat(3,1fr); gap:22px;}
  .grid2{display:grid; grid-template-columns:repeat(2,1fr); gap:22px;}
  .card{background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:30px; transition:transform .35s var(--ease), border-color .3s;}
  .card:hover{transform:translateY(-4px); border-color:var(--primary);}
  .card .num{font-family:'IBM Plex Mono',monospace; font-size:13px; color:var(--primary); margin-bottom:16px; display:block;}
  .card-icon{width:42px; height:42px; border-radius:11px; background:var(--primary); margin-bottom:20px; opacity:.9;}
  .card h3{margin-bottom:10px;}
  .card p{font-size:14.5px;}

  .quote{background:var(--surface); border:1px solid var(--border); border-radius:20px; padding:44px; }
  .quote p{font-size:clamp(18px,2vw,24px); color:var(--text); font-weight:500; line-height:1.5; max-width:70ch;}
  .quote footer{margin-top:24px; display:flex; align-items:center; gap:12px; font-size:14px; color:var(--muted);}
  .quote .avatar{width:38px; height:38px; border-radius:50%; background:linear-gradient(135deg,var(--primary),var(--accent));}

  .cta-band{background:var(--band); color:var(--band-ink); border-radius:24px; padding:64px; text-align:center; margin:0 8vw;}
  .cta-band h2{color:var(--band-ink); margin-bottom:18px;}
  .cta-band p{color:var(--band-ink); opacity:.78; max-width:52ch; margin:0 auto;}
  .cta-band .hero-actions{justify-content:center;}

  footer.site{padding:64px 8vw 40px; border-top:1px solid var(--border); display:flex; justify-content:space-between; gap:40px; flex-wrap:wrap;}
  footer.site .f-cols{display:flex; gap:64px; flex-wrap:wrap;}
  footer.site h4{font-size:13px; margin:0 0 14px; color:var(--muted); font-weight:600;}
  footer.site ul{list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:10px; font-size:14px;}
  footer.site .f-bottom{font-size:12.5px; color:var(--muted); margin-top:44px; width:100%;}

  .form-wrap{max-width:520px;}
  .field{margin-bottom:18px;}
  .field label{display:block; font-size:13px; font-weight:600; margin-bottom:8px;}
  .field input, .field textarea{width:100%; padding:13px 15px; border-radius:10px; border:1px solid var(--border); background:var(--surface); color:var(--text); font-family:inherit; font-size:14.5px;}
  .field input:focus, .field textarea:focus{outline:2px solid var(--primary); outline-offset:1px;}
  .form-note{font-size:13px; color:var(--muted); margin-top:16px;}
  .split{display:grid; grid-template-columns:1.1fr .9fr; gap:64px; align-items:center;}

  .login-wrap{min-height:70vh; display:flex; align-items:center; justify-content:center; padding:60px 8vw;}
  .login-card{width:100%; max-width:400px; background:var(--surface); border:1px solid var(--border); border-radius:20px; padding:40px;}
  .login-card h2{font-size:24px; margin-bottom:8px;}
  .login-card .btn{width:100%; margin-top:6px;}
  .login-alt{text-align:center; font-size:13.5px; color:var(--muted); margin-top:20px;}

  .mnav{position:fixed; inset:0; background:var(--bg); z-index:60; display:none; flex-direction:column; padding:24px 8vw;}
  .mnav.open{display:flex;}
  .mnav a{font-size:22px; padding:14px 0; border-bottom:1px solid var(--border);}
  .mnav-top{display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;}

  [data-template="modern"] .hero{grid-template-columns:1.05fr .95fr;}
  [data-template="modern"] .nav-links a{text-transform:none;}
  [data-template="modern"] .card{border-radius:20px;}

  [data-template="minimal"]{letter-spacing:-.005em;}
  [data-template="minimal"] .hero{grid-template-columns:1fr; max-width:900px;}
  [data-template="minimal"] .hero-art{display:none;}
  [data-template="minimal"] h1{font-size:clamp(40px,7vw,88px); letter-spacing:-.02em;}
  [data-template="minimal"] .card{border-radius:2px; border-left:2px solid var(--primary); border-top:none; border-right:none; border-bottom:none; background:transparent; padding:26px 0 26px 26px;}
  [data-template="minimal"] .card:hover{transform:none; border-left-color:var(--primary);}
  [data-template="minimal"] .card-icon{display:none;}
  [data-template="minimal"] .grid3{grid-template-columns:1fr; gap:0;}
  [data-template="minimal"] .grid3 .card{border-bottom:1px solid var(--border);}
  [data-template="minimal"] .quote{border-radius:2px; padding:0; background:transparent; border:none; border-top:1px solid var(--border); border-bottom:1px solid var(--border); padding:44px 0;}
  [data-template="minimal"] .cta-band{border-radius:2px;}
  [data-template="minimal"] .nav-links a{font-family:'IBM Plex Mono',monospace; font-size:12px; letter-spacing:.06em; text-transform:uppercase;}

  [data-template="bold"] .hero{background:var(--band); color:var(--band-ink); border-radius:0 0 32px 32px; margin-top:-1px;}
  [data-template="bold"] .hero h1{color:var(--band-ink);}
  [data-template="bold"] .hero p{color:var(--band-ink); opacity:.78;}
  [data-template="bold"] .hero-stats .stat b{color:var(--band-ink);}
  [data-template="bold"] .hero-art{background:linear-gradient(135deg, var(--primary), var(--accent)); border:none;}
  [data-template="bold"] .hero-art .grid-lines{opacity:.15; filter:invert(1);}
  [data-template="bold"] h1, [data-template="bold"] h2{letter-spacing:-.03em;}
  [data-template="bold"] .card{border-radius:26px; border-width:2px;}
  [data-template="bold"] .card:hover{transform:translateY(-6px) rotate(-.6deg);}
  [data-template="bold"] .nav{border-radius:0 0 20px 20px;}

  /* ---- signature section: process flow (Halcyon / modern) ---- */
  .process{display:grid; grid-template-columns:repeat(4,1fr); gap:0;}
  .process-step{position:relative; padding-right:20px;}
  .process-step:not(:last-child)::after{content:""; position:absolute; top:14px; right:-2px; width:calc(100% - 40px); height:1px; background:var(--border);}
  .process-num{display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:50%; background:var(--primary); color:var(--on-primary); font-family:'IBM Plex Mono',monospace; font-size:12px; font-weight:700; margin-bottom:16px;}
  .process-step h3{margin-bottom:8px; font-size:16px;}
  .process-step p{font-size:13.5px;}
  @media (max-width:860px){
    .process{grid-template-columns:1fr; gap:28px;}
    .process-step:not(:last-child)::after{display:none;}
  }

  /* ---- signature section: selected work list (Studio Vale / minimal) ---- */
  .work-list{display:flex; flex-direction:column;}
  .work-item{display:grid; grid-template-columns:52px 1fr; gap:20px; padding:28px 0; border-bottom:1px solid var(--border);}
  .work-item:first-child{border-top:1px solid var(--border);}
  .work-meta{display:block; font-family:'IBM Plex Mono',monospace; font-size:11.5px; letter-spacing:.06em; text-transform:uppercase; color:var(--primary); margin-bottom:8px;}
  .work-item h3{margin-bottom:6px;}
  @media (max-width:860px){ .work-item{grid-template-columns:1fr; gap:8px;} }

  /* ---- signature section: infinite marquee (Nova Collective / bold) ---- */
  .marquee{overflow:hidden; padding:32px 0; border-top:1px solid var(--border); border-bottom:1px solid var(--border);}
  .marquee-track{display:flex; gap:64px; width:max-content; animation:marquee-scroll 24s linear infinite;}
  .marquee-track span{font-family:'IBM Plex Mono',monospace; font-size:13px; letter-spacing:.1em; color:var(--muted); white-space:nowrap;}
  @keyframes marquee-scroll{ from{transform:translateX(0);} to{transform:translateX(-50%);} }
  @media (prefers-reduced-motion: reduce){ .marquee-track{animation:none;} }
`;

export function buildStyle(): string {
  const themeVars = (Object.entries(THEMES) as [ThemeId, ThemeDef][]).map(([id, t]) => themeVarBlock(id, t)).join("\n");
  const motionVars = (Object.entries(MOTION) as [MotionId, MotionDef][]).map(([id, m]) => motionVarBlock(id, m)).join("\n");
  return `${themeVars}\n${motionVars}\n${CSS_COMPONENTS}\n${CSS_ANIMATIONS}\n${CSS_RESPONSIVE}`;
}

const SHARED_SCRIPT = `
(function(){
  function stagger(){
    document.querySelectorAll('[data-stagger]').forEach(function(group){
      var kids = group.querySelectorAll('.rv');
      var base = parseInt(getComputedStyle(document.body).getPropertyValue('--stagger-ms')) || 70;
      kids.forEach(function(el, i){ el.style.transitionDelay = (i * base) + 'ms'; });
    });
  }
  stagger();
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, {threshold:.15});
  document.querySelectorAll('.rv').forEach(function(el){ io.observe(el); });

  var burger = document.querySelector('.nav-burger');
  var mnav = document.querySelector('.mnav');
  if(burger && mnav){
    burger.addEventListener('click', function(){ mnav.classList.add('open'); });
    mnav.querySelectorAll('a, .mnav-close').forEach(function(el){ el.addEventListener('click', function(){ mnav.classList.remove('open'); }); });
  }

  function showPage(id){
    document.querySelectorAll('.page').forEach(function(p){ p.classList.toggle('is-active', p.id === 'page-' + id); });
    document.querySelectorAll('[data-nav]').forEach(function(a){ a.classList.toggle('active', a.getAttribute('data-nav') === id); });
    window.scrollTo(0,0);
    document.querySelectorAll('.rv').forEach(function(el){
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('in');
    });
  }
  document.querySelectorAll('[data-nav]').forEach(function(a){
    a.addEventListener('click', function(ev){ ev.preventDefault(); showPage(a.getAttribute('data-nav')); });
  });

  document.querySelectorAll('form').forEach(function(f){
    f.addEventListener('submit', function(ev){
      ev.preventDefault();
      var btn = f.querySelector('button[type="submit"], .btn-primary');
      if(!btn) return;
      var original = btn.textContent;
      btn.textContent = 'Sent \\u2713';
      setTimeout(function(){ btn.textContent = original; f.reset(); }, 1800);
    });
  });
})();
`;

function heroArt(): string {
  return `<div class="hero-art rv"><div class="blob"></div><div class="grid-lines"></div>
    <div class="card" style="width:56%; top:14%; left:10%; height:34%;"></div>
    <div class="card" style="width:46%; top:54%; left:38%; height:34%;"></div>
  </div>`;
}

/** Bold gets an infinite scrolling marquee (logos rendered twice for a seamless loop); everyone else gets the plain static strip. */
function logoStripHTML(templateId: TemplateId, logos: string[]): string {
  if (templateId === "bold") {
    const spans = logos.map(l => `<span>${l}</span>`).join("");
    return `<div class="marquee"><div class="marquee-track">${spans}${spans}</div></div>`;
  }
  return `<div class="strip">${logos.map(l => `<span>${l}</span>`).join("")}</div>`;
}

function processSectionHTML(process: NonNullable<ContentHome["process"]>): string {
  return `<section data-stagger>
    <div class="s-head rv"><div class="eyebrow">How we work</div><h2>${process.heading}</h2></div>
    <div class="process">
      ${process.steps.map((s, i) => `<div class="process-step rv"><span class="process-num">0${i + 1}</span><h3>${s.title}</h3><p>${s.body}</p></div>`).join("")}
    </div>
  </section>`;
}

function selectedWorkSectionHTML(work: NonNullable<ContentHome["selectedWork"]>): string {
  return `<section data-stagger>
    <div class="s-head rv"><div class="eyebrow">Selected work</div><h2>${work.heading}</h2></div>
    <div class="work-list">
      ${work.items.map((it, i) => `
        <div class="work-item rv">
          <span class="num">0${i + 1}</span>
          <div>
            <span class="work-meta">${it.meta}</span>
            <h3>${it.title}</h3>
            <p>${it.body}</p>
          </div>
        </div>`).join("")}
    </div>
  </section>`;
}

export interface ContentNav {
  ctaText: string;
  loginText: string;
}
export interface ContentFooter {
  tagline: string;
  bottomNote: string;
}
export const NAV_DEFAULTS: ContentNav = { ctaText: "Get in touch", loginText: "Log in" };
export const FOOTER_DEFAULTS: ContentFooter = {
  tagline: "A design experienced before it's built.",
  bottomNote: "Prototype generated for client review — not a live website.",
};

function navHTML(pages: PageId[], brand: string, navOverride: ContentNav | undefined, wrapTemplateId: TemplateId): string {
  const nav = { ...NAV_DEFAULTS, ...navOverride };
  const links = pages.map(p => `<a data-nav="${p}" class="${p === "home" ? "active" : ""}">${PAGE_LABELS[p]}</a>`).join("");
  return `
  <div data-template="${wrapTemplateId}">
  <nav class="nav">
    <div class="nav-brand"><span class="nav-mark"></span>${brand}</div>
    <div class="nav-links">${links}</div>
    <div class="nav-cta">
      <a class="btn btn-ghost btn-sm" data-nav="login" style="display:${pages.includes("login") ? "inline-flex" : "none"}">${nav.loginText}</a>
      <a class="btn btn-primary btn-sm" data-nav="contact">${nav.ctaText}</a>
      <button class="nav-burger" aria-label="Menu"><svg width="16" height="12" viewBox="0 0 16 12"><path d="M0 1h16M0 6h16M0 11h16" stroke="currentColor" stroke-width="1.6"/></svg></button>
    </div>
  </nav>
  <div class="mnav">
    <div class="mnav-top"><div class="nav-brand"><span class="nav-mark"></span>${brand}</div><button class="mnav-close" aria-label="Close" style="border:none;background:none;font-size:26px;color:var(--text);">&times;</button></div>
    ${pages.map(p => `<a data-nav="${p}">${PAGE_LABELS[p]}</a>`).join("")}
  </div>
  </div>`;
}

function footerHTML(brand: string, pages: PageId[], footerOverride: ContentFooter | undefined, wrapTemplateId: TemplateId): string {
  const footer = { ...FOOTER_DEFAULTS, ...footerOverride };
  return `<div data-template="${wrapTemplateId}"><footer class="site">
    <div><div class="nav-brand" style="margin-bottom:14px;"><span class="nav-mark"></span>${brand}</div><p style="max-width:26ch; font-size:13.5px;">${footer.tagline}</p></div>
    <div class="f-cols">
      <div><h4>Site</h4><ul>${pages.map(p => `<li><a data-nav="${p}">${PAGE_LABELS[p]}</a></li>`).join("")}</ul></div>
      <div><h4>Company</h4><ul><li><a data-nav="about">About</a></li><li><a data-nav="contact">Contact</a></li></ul></div>
    </div>
    <div class="f-bottom">© ${new Date().getFullYear()} ${brand}. ${footer.bottomNote}</div>
  </footer></div>`;
}

interface ContentStat { n: string; l: string; }
interface ProcessStep { title: string; body: string; }
interface WorkItem { title: string; meta: string; body: string; }
export interface ContentHome {
  eyebrow: string; h1: string; lede: string; cta1: string; cta2: string;
  stats: ContentStat[]; logos: string[]; servicesHeading: string; quote: string; quoteBy: string;
  ctaBandTitle: string; ctaBandBody: string;
  process?: { heading: string; steps: ProcessStep[] };
  selectedWork?: { heading: string; items: WorkItem[] };
}
interface ContentAboutValue { title: string; body: string; }
export interface ContentAbout { h1: string; lede: string; valuesHeading: string; values: ContentAboutValue[]; ctaTitle: string; ctaBody: string; }
interface ContentServiceItem { title: string; body: string; }
export interface ContentServices { h1: string; lede: string; items: ContentServiceItem[]; ctaTitle: string; ctaBody: string; }
export interface ContentContact { h1: string; lede: string; }
interface TemplateContent { home: ContentHome; about: ContentAbout; services: ContentServices; contact: ContentContact; }

const CONTENT: Record<TemplateId, TemplateContent> = {
  modern: {
    home: {
      eyebrow: "Halcyon Consulting", h1: "Advice that moves at the speed of your business.",
      lede: "We help growing companies untangle operations, sharpen strategy, and make the next twelve months easier than the last twelve.",
      cta1: "Book a consultation", cta2: "See our services",
      stats: [{ n: "180+", l: "Engagements delivered" }, { n: "94%", l: "Client retention" }, { n: "14", l: "Years in practice" }],
      logos: ["MERIDIAN", "OAKFIELD & CO", "PORTAGE GROUP", "LINDEN WORKS", "ASHFORD"],
      servicesHeading: "Three ways we help",
      quote: "Halcyon didn't just give us a plan — they stayed until it worked.",
      quoteBy: "Priya Nandakumar, COO at Portage Group",
      ctaBandTitle: "Let's look at what's slowing you down.",
      ctaBandBody: "A first conversation is free, and usually enough to tell you if we're the right fit.",
      process: {
        heading: "How an engagement actually runs",
        steps: [
          { title: "Diagnose", body: "Two weeks embedded with your team before we recommend anything." },
          { title: "Plan", body: "A written plan with dates, owners, and a number attached to each one." },
          { title: "Implement", body: "We stay through execution — not just the strategy deck." },
          { title: "Hand off", body: "Your team owns it by the end, with the documentation to prove it." }
        ]
      }
    },
    about: {
      h1: "Independent advisors, twelve years running.",
      lede: "Halcyon was founded on a simple frustration: most consultants leave before the hard part starts. We stay through implementation, not just the slide deck.",
      valuesHeading: "What that looks like in practice",
      values: [
        { title: "We stay accountable", body: "Every engagement ends with a written outcome, not a PowerPoint that gets filed away." },
        { title: "We work in the open", body: "Your team sees our thinking as it develops, not a reveal at the final meeting." },
        { title: "We keep it small", body: "A senior partner leads every account — never handed off to a junior team." }
      ],
      ctaTitle: "Meet the team behind the work.", ctaBody: "We keep our roster small on purpose. Ask us who'd be on your account."
    },
    services: {
      h1: "Practical help, not theory.",
      lede: "Every engagement starts with the same question: what, specifically, needs to be true in ninety days?",
      items: [
        { title: "Operations review", body: "A structured audit of where time and money are actually going, with a prioritised fix list." },
        { title: "Growth strategy", body: "Market position, pricing, and channel strategy grounded in your real unit economics." },
        { title: "Leadership coaching", body: "One-to-one sessions for founders and execs navigating a fast-changing team." },
        { title: "Financial planning", body: "Rolling forecasts your finance team can actually maintain after we leave." },
        { title: "Change management", body: "Getting a whole organisation moving in the same direction, without the usual resistance." },
        { title: "Interim leadership", body: "A senior operator embedded in your business while you search for a permanent hire." }
      ],
      ctaTitle: "Not sure which one you need?", ctaBody: "Most clients start with an operations review — it usually tells us what's next."
    },
    contact: { h1: "Tell us where it hurts.", lede: "Fifteen minutes with a senior partner, no obligation, no sales pitch." }
  },
  minimal: {
    home: {
      eyebrow: "Studio Vale — 002", h1: "Architecture, in fewer words.",
      lede: "Studio Vale designs homes and small buildings around light, material, and restraint. Nothing is added that isn't earning its place.",
      cta1: "Start a project", cta2: "View services",
      stats: [{ n: "26", l: "Completed builds" }, { n: "9", l: "Design awards" }, { n: "3", l: "Studio locations" }],
      logos: ["DWELL", "AZURE", "ARCHITECTURAL RECORD", "SURFACE", "WALLPAPER*"],
      servicesHeading: "Three disciplines, one studio",
      quote: "They removed everything we didn't need — and the house is better for it.",
      quoteBy: "Marcus Feld, Private residence, 2025",
      ctaBandTitle: "Bring us a site.",
      ctaBandBody: "We take on a small number of projects each year. Tell us about yours.",
      selectedWork: {
        heading: "A few recent projects",
        items: [
          { title: "Birchwood Residence", meta: "Sonoma, CA — 2025", body: "A single-storey house organised entirely around a courtyard oak." },
          { title: "Kettner Loft Conversion", meta: "San Diego, CA — 2024", body: "A former print shop, converted without hiding what it used to be." },
          { title: "Marlow Studio & Gallery", meta: "Portland, OR — 2024", body: "Studio space for a working ceramicist, built around north light." },
          { title: "Ridgeline Extension", meta: "Bend, OR — 2023", body: "A restrained addition that reads as older than the original house." }
        ]
      }
    },
    about: {
      h1: "Founded on one rule: subtract first.",
      lede: "Studio Vale was started by two architects tired of ornament standing in for ideas. Every project begins by asking what can be removed.",
      valuesHeading: "Three principles we don't compromise on",
      values: [
        { title: "Material honesty", body: "Concrete looks like concrete. Wood ages the way wood ages. Nothing is disguised." },
        { title: "Light before layout", body: "We study how light moves through a site before we draw a single wall." },
        { title: "Small studio, senior hands", body: "Two partners review every drawing that leaves the office." }
      ],
      ctaTitle: "Read the studio's design principles.", ctaBody: "A short document we send every new client before the first meeting."
    },
    services: {
      h1: "What we take on.",
      lede: "Residential, small commercial, and interiors — always with the same process, start to finish.",
      items: [
        { title: "Residential", body: "New builds and extensions, from first sketch to final inspection." },
        { title: "Interiors", body: "Material palettes, joinery, and lighting for spaces we didn't design ourselves." },
        { title: "Small commercial", body: "Studios, galleries, and offices under 400 square metres." },
        { title: "Renovation", body: "Working within an existing structure without pretending it isn't there." },
        { title: "Landscape", body: "The ground a building sits on, treated as part of the design, not an afterthought." },
        { title: "Consultation", body: "A single paid session for teams who need an outside architectural opinion." }
      ],
      ctaTitle: "Have a site already?", ctaBody: "Send drawings, photos, or a plot number — we'll tell you what we see."
    },
    contact: { h1: "Get in touch.", lede: "One short form. A partner replies personally within two working days." }
  },
  bold: {
    home: {
      eyebrow: "Nova Collective", h1: "We make brands impossible to scroll past.",
      lede: "Nova is a creative agency for founders who'd rather stand out than fit in. Brand, campaign, and launch — under one roof.",
      cta1: "Start a project", cta2: "See our work",
      stats: [{ n: "3.2M", l: "Campaign reach avg." }, { n: "48", l: "Brands launched" }, { n: "11", l: "Industry awards" }],
      logos: ["FIZZ", "HAUS", "KINDRED", "LOOP&CO", "VELT"],
      servicesHeading: "What we bring to the table",
      quote: "Nova gave us a brand our competitors are now copying.",
      quoteBy: "Dana Okafor, Founder of Loop&Co",
      ctaBandTitle: "Got something worth shouting about?",
      ctaBandBody: "Tell us what you're building. We'll tell you how loud it should be."
    },
    about: {
      h1: "Started by three people bored of beige branding.",
      lede: "Nova Collective was built for founders tired of safe, forgettable design. We push until a brand actually feels like something.",
      valuesHeading: "How we push",
      values: [
        { title: "Loud, on purpose", body: "If it blends in with the category, we haven't done our job yet." },
        { title: "Fast, not sloppy", body: "Our sprints move quickly because our process is tight, not because we cut corners." },
        { title: "Founders in the room", body: "You work directly with the creative leads, every single week." }
      ],
      ctaTitle: "See who's behind the work.", ctaBody: "Our team page has zero stock photography. That's on purpose too."
    },
    services: {
      h1: "Full-throttle, or just one piece.",
      lede: "Some clients want the whole launch. Others just need one thing done exceptionally well. Both are welcome.",
      items: [
        { title: "Brand identity", body: "Naming, voice, and visual system built to survive contact with the real world." },
        { title: "Campaign creative", body: "Concept-to-delivery creative for a single big moment." },
        { title: "Social & content", body: "A content engine your team can keep running after we hand it off." },
        { title: "Web experience", body: "Launch sites and product pages built to convert attention into action." },
        { title: "Launch strategy", body: "Sequencing the moment your brand meets the world for maximum impact." },
        { title: "Motion & film", body: "Short-form video built for feeds, not festivals." }
      ],
      ctaTitle: "Need one piece or all six?", ctaBody: "Most first projects start with brand identity — everything else builds from there."
    },
    contact: { h1: "Let's make some noise.", lede: "Tell us about the launch. We'll tell you if we're the right amount of loud for it." }
  }
};

/**
 * Resolves the effective content for a template: an edited page (from
 * PrototypeConfig.contentOverrides) entirely replaces that page's default —
 * no field-by-field merging. Keeps the mental model simple: a page is either
 * "using the template default" or "using what the freelancer wrote," never
 * a confusing mix of both.
 */
function resolveContent(
  templateId: TemplateId,
  overrides?: PrototypeConfig["contentOverrides"]
): TemplateContent {
  const base = CONTENT[templateId];
  return {
    home: overrides?.home ?? base.home,
    about: overrides?.about ?? base.about,
    services: overrides?.services ?? base.services,
    contact: overrides?.contact ?? base.contact,
  };
}

function pagesFor(
  sectionTemplates: Record<SectionKey, TemplateId>,
  pages: PageId[],
  brand: string,
  overrides?: PrototypeConfig["contentOverrides"]
): Partial<Record<PageId, string>> {
  const out: Partial<Record<PageId, string>> = {};

  if (pages.includes("home")) {
    const templateId = sectionTemplates.home;
    const content = resolveContent(templateId, overrides);
    out.home = `<div data-template="${templateId}"><div class="page is-active" id="page-home">
    <section class="hero" data-stagger>
      <div class="hero-copy">
        <div class="eyebrow rv">${content.home.eyebrow}</div>
        <h1 class="rv">${content.home.h1}</h1>
        <p class="lede rv">${content.home.lede}</p>
        <div class="hero-actions rv">
          <a class="btn btn-primary" data-nav="contact">${content.home.cta1}</a>
          <a class="btn btn-ghost" data-nav="services">${content.home.cta2}</a>
        </div>
        <div class="hero-stats rv">${content.home.stats.map(s => `<div class="stat"><b>${s.n}</b><span>${s.l}</span></div>`).join("")}</div>
      </div>
      ${heroArt()}
    </section>
    ${logoStripHTML(templateId, content.home.logos)}
    <section data-stagger>
      <div class="s-head rv"><div class="eyebrow">What we do</div><h2>${content.home.servicesHeading}</h2></div>
      <div class="grid3">
        ${content.services.items.slice(0, 3).map((it, i) => `<div class="card rv"><span class="num">0${i + 1}</span><div class="card-icon"></div><h3>${it.title}</h3><p>${it.body}</p></div>`).join("")}
      </div>
    </section>
    ${content.home.process ? processSectionHTML(content.home.process) : ""}
    ${content.home.selectedWork ? selectedWorkSectionHTML(content.home.selectedWork) : ""}
    <section data-stagger>
      <div class="quote rv">
        <p>&ldquo;${content.home.quote}&rdquo;</p>
        <footer><span class="avatar"></span>${content.home.quoteBy}</footer>
      </div>
    </section>
    <section>
      <div class="cta-band rv"><h2>${content.home.ctaBandTitle}</h2><p>${content.home.ctaBandBody}</p>
        <div class="hero-actions"><a class="btn btn-primary" data-nav="contact">${content.home.cta1}</a></div>
      </div>
    </section>
    ${footerHTML(brand, pages, overrides?.footer, sectionTemplates.chrome)}
    </div></div>`;
  }

  if (pages.includes("about")) {
    const templateId = sectionTemplates.about;
    const content = resolveContent(templateId, overrides);
    out.about = `<div data-template="${templateId}"><div class="page" id="page-about">
    <section class="split" data-stagger>
      <div>
        <div class="eyebrow rv">About</div>
        <h1 class="rv" style="font-size:clamp(32px,4vw,48px);">${content.about.h1}</h1>
        <p class="lede rv" style="margin-top:20px;">${content.about.lede}</p>
      </div>
      ${heroArt()}
    </section>
    <section data-stagger>
      <div class="s-head rv"><div class="eyebrow">How we work</div><h2>${content.about.valuesHeading}</h2></div>
      <div class="grid3">${content.about.values.map((v, i) => `<div class="card rv"><span class="num">0${i + 1}</span><h3>${v.title}</h3><p>${v.body}</p></div>`).join("")}</div>
    </section>
    <section><div class="cta-band rv"><h2>${content.about.ctaTitle}</h2><p>${content.about.ctaBody}</p><div class="hero-actions"><a class="btn btn-primary" data-nav="contact">Start a project</a></div></div></section>
    ${footerHTML(brand, pages, overrides?.footer, sectionTemplates.chrome)}
    </div></div>`;
  }

  if (pages.includes("services")) {
    const templateId = sectionTemplates.services;
    const content = resolveContent(templateId, overrides);
    out.services = `<div data-template="${templateId}"><div class="page" id="page-services">
    <section data-stagger>
      <div class="eyebrow rv">Services</div>
      <h1 class="rv" style="font-size:clamp(32px,4vw,48px); max-width:14ch;">${content.services.h1}</h1>
      <p class="lede rv" style="margin-top:20px;">${content.services.lede}</p>
    </section>
    <section data-stagger>
      <div class="grid3">${content.services.items.map((it, i) => `<div class="card rv"><span class="num">0${i + 1}</span><div class="card-icon"></div><h3>${it.title}</h3><p>${it.body}</p></div>`).join("")}</div>
    </section>
    <section><div class="cta-band rv"><h2>${content.services.ctaTitle}</h2><p>${content.services.ctaBody}</p><div class="hero-actions"><a class="btn btn-primary" data-nav="contact">${content.home.cta1}</a></div></div></section>
    ${footerHTML(brand, pages, overrides?.footer, sectionTemplates.chrome)}
    </div></div>`;
  }

  if (pages.includes("contact")) {
    const templateId = sectionTemplates.contact;
    const content = resolveContent(templateId, overrides);
    out.contact = `<div data-template="${templateId}"><div class="page" id="page-contact">
    <section class="split" data-stagger>
      <div>
        <div class="eyebrow rv">Contact</div>
        <h1 class="rv" style="font-size:clamp(30px,4vw,44px);">${content.contact.h1}</h1>
        <p class="lede rv" style="margin-top:18px;">${content.contact.lede}</p>
      </div>
      <form class="form-wrap rv">
        <div class="field"><label>Name</label><input type="text" placeholder="Jordan Blake"></div>
        <div class="field"><label>Email</label><input type="email" placeholder="jordan@business.com"></div>
        <div class="field"><label>What do you need?</label><textarea rows="4" placeholder="Tell us about your project"></textarea></div>
        <button class="btn btn-primary" type="submit" style="width:100%;">Send message</button>
        <p class="form-note">We reply within one business day.</p>
      </form>
    </section>
    ${footerHTML(brand, pages, overrides?.footer, sectionTemplates.chrome)}
    </div></div>`;
  }

  if (pages.includes("login")) {
    const templateId = sectionTemplates.login;
    out.login = `<div data-template="${templateId}"><div class="page" id="page-login">
    <div class="login-wrap">
      <form class="login-card rv">
        <h2>Welcome back</h2>
        <p style="font-size:14px; margin-bottom:24px;">Log in to your ${brand} account.</p>
        <div class="field"><label>Email</label><input type="email" placeholder="you@business.com"></div>
        <div class="field"><label>Password</label><input type="password" placeholder="••••••••"></div>
        <button class="btn btn-primary" type="submit">Log in</button>
        <p class="login-alt">New here? <a data-nav="contact" style="color:var(--primary); font-weight:600;">Get in touch</a></p>
      </form>
    </div>
    ${footerHTML(brand, pages, overrides?.footer, sectionTemplates.chrome)}
    </div></div>`;
  }

  return out;
}

/** Resolves which template governs each independent section — falls back to the project's base `templateId` for any section without an explicit override, so "common" mode (no overrides at all) is just this returning the same value six times. */
function resolveSectionTemplates(config: PrototypeConfig): Record<SectionKey, TemplateId> {
  const fallback = config.templateId;
  return {
    chrome: config.sectionTemplates?.chrome ?? fallback,
    home: config.sectionTemplates?.home ?? fallback,
    about: config.sectionTemplates?.about ?? fallback,
    services: config.sectionTemplates?.services ?? fallback,
    contact: config.sectionTemplates?.contact ?? fallback,
    login: config.sectionTemplates?.login ?? fallback,
  };
}

/** The template's built-in default content for one page — used to pre-fill an editor form before any override exists. */
export function getDefaultPageContent<P extends "home" | "about" | "services" | "contact">(
  templateId: TemplateId,
  page: P
): TemplateContent[P] {
  return CONTENT[templateId][page];
}

/**
 * Build a full standalone HTML document string for a given configuration.
 * All 6 themes' + 3 motions' CSS vars are baked in so switching data-theme /
 * data-motion on <body> re-skins instantly with no reload — useful if you
 * ever wire up a live "switch theme" control against the same iframe.
 */
export function buildPrototypeDoc(config: PrototypeConfig): string {
  const meta = TEMPLATE_META[config.templateId];
  const brand = config.brandName?.trim() || meta.name;
  const sectionTemplates = resolveSectionTemplates(config);
  const pageMarkup = pagesFor(sectionTemplates, config.pages, brand, config.contentOverrides);
  const body = config.pages.map(p => pageMarkup[p] || "").join("\n");
  return `<!doctype html><html><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;650;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>${buildStyle()}</style>
  </head>
  <body data-theme="${config.themeId}" data-motion="${config.motionId}" style="--stagger-ms:${MOTION[config.motionId].stagger}">
  ${navHTML(config.pages, brand, config.contentOverrides?.nav, sectionTemplates.chrome)}
  ${body}
  <script>${SHARED_SCRIPT}</script>
  </body></html>`;
}
