import { resolveHost } from './deployment.js';
/**
 * Generates the static website / web panel that ships in the deployment bundle.
 * It's a single self-contained HTML file that reads live data from the Server
 * API (`/api/status`, `/api/news`, `/api/launcher`) so the page stays current
 * without a rebuild. Branding colors are injected as CSS variables.
 */
export function generateWebsite(project) {
    const host = resolveHost(project);
    const scheme = project.domain.useHttps ? 'https' : 'http';
    const apiBase = `${scheme}://${host}`;
    const { branding, meta, server } = project;
    const esc = (s) => s.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    return `<!DOCTYPE html>
<html lang="en" data-theme="${branding.themeMode}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(meta.serverName)} — Play Now</title>
<meta name="description" content="${esc(meta.description)}" />
<style>
  :root {
    --primary: ${branding.primaryColor};
    --accent: ${branding.accentColor};
    --bg: ${branding.themeMode === 'dark' ? '#0b0b12' : '#f5f5fb'};
    --fg: ${branding.themeMode === 'dark' ? '#e8e8f0' : '#12121a'};
    --card: ${branding.themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'};
    --font: '${branding.fontFamily}', system-ui, sans-serif;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); color: var(--fg); font-family: var(--font); min-height: 100vh; }
  .hero {
    min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center; padding: 3rem 1rem;
    background: ${branding.backgroundImage ? `url('${esc(branding.backgroundImage)}') center/cover` : 'radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--primary) 35%, transparent), transparent 60%)'};
  }
  .logo { max-width: 180px; margin-bottom: 1.5rem; }
  h1 { font-size: clamp(2rem, 6vw, 4rem); letter-spacing: -0.02em; }
  .tagline { opacity: 0.8; margin-top: 0.75rem; max-width: 40rem; }
  .cta {
    display: inline-flex; gap: 0.6rem; align-items: center; margin-top: 2rem; padding: 0.9rem 2rem;
    border-radius: 999px; background: linear-gradient(135deg, var(--primary), var(--accent));
    color: #fff; font-weight: 700; text-decoration: none; box-shadow: 0 10px 30px -10px var(--primary);
    transition: transform .15s ease;
  }
  .cta:hover { transform: translateY(-2px); }
  .grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); max-width: 1000px; margin: 2rem auto; padding: 0 1rem; }
  .card { background: var(--card); border-radius: 18px; padding: 1.5rem; backdrop-filter: blur(12px); border: 1px solid color-mix(in srgb, var(--fg) 10%, transparent); }
  .stat { font-size: 2rem; font-weight: 800; color: var(--accent); }
  .news { max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
  .news h2 { margin-bottom: 1rem; }
  .news article { background: var(--card); border-radius: 14px; padding: 1.25rem; margin-bottom: 1rem; }
  .news time { opacity: 0.6; font-size: 0.85rem; }
  footer { text-align: center; padding: 2rem; opacity: 0.6; font-size: 0.85rem; }
  .links { display: flex; gap: 1rem; justify-content: center; margin-top: 1rem; }
  .links a { color: var(--accent); text-decoration: none; }
</style>
</head>
<body>
  <section class="hero">
    ${branding.serverLogo ? `<img class="logo" src="${esc(branding.serverLogo)}" alt="${esc(meta.serverName)} logo" />` : ''}
    <h1>${esc(meta.serverName)}</h1>
    <p class="tagline">${esc(meta.description)}</p>
    <a class="cta" href="${apiBase}/api/launcher">⬇ Download Launcher</a>
    <div class="links">
      ${server.website ? `<a href="${esc(server.website)}">Website</a>` : ''}
      ${server.discord ? `<a href="${esc(server.discord)}">Discord</a>` : ''}
    </div>
  </section>

  <div class="grid">
    <div class="card"><div class="stat" id="status">—</div><div>Server Status</div></div>
    <div class="card"><div class="stat" id="players">—</div><div>Players Online</div></div>
    <div class="card"><div class="stat" id="ping">—</div><div>Ping</div></div>
    <div class="card"><div class="stat" id="version">${esc(meta.version)}</div><div>Version</div></div>
  </div>

  <div class="news"><h2>Latest News</h2><div id="news"></div></div>

  <footer>Powered by ForgeLink · © ${new Date().getFullYear()} ${esc(meta.owner)}</footer>

<script>
  const API = ${JSON.stringify(apiBase)};
  async function refreshStatus() {
    try {
      const r = await fetch(API + '/api/status');
      const s = await r.json();
      document.getElementById('status').textContent = s.online ? 'Online' : 'Offline';
      document.getElementById('players').textContent = (s.playersOnline ?? 0) + ' / ' + (s.playersMax ?? 0);
      document.getElementById('ping').textContent = s.pingMs != null ? s.pingMs + ' ms' : '—';
    } catch (e) { /* API unreachable — leave placeholders */ }
  }
  async function loadNews() {
    try {
      const r = await fetch(API + '/api/news');
      const { news } = await r.json();
      const el = document.getElementById('news');
      el.innerHTML = (news || []).map(n =>
        '<article><h3>' + escapeHtml(n.title) + '</h3><time>' +
        new Date(n.publishedAt).toLocaleDateString() + '</time><p>' +
        escapeHtml(n.body) + '</p></article>').join('');
    } catch (e) { /* ignore */ }
  }
  function escapeHtml(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
  refreshStatus(); loadNews();
  setInterval(refreshStatus, 30000);
</script>
</body>
</html>
`;
}
//# sourceMappingURL=website.js.map