export interface BriefFields {
  title: string;
  clientName: string;
  badgeText: string;
  objective: string;
  deliverables: string;
  creativeDirection: string;
  platformNotes: string;
  cameraTechnical: string;
  dos: string;
  donts: string;
  workflow: string;
  fileDelivery: string;
}

export function generateBriefHTML(fields: BriefFields): string {
  const sections: string[] = [];
  let num = 1;

  if (fields.objective.trim()) {
    sections.push(sectionHTML(num++, "Objective", paraHTML(fields.objective)));
  }
  if (fields.deliverables.trim()) {
    sections.push(sectionHTML(num++, "Required Deliverables", bulletHTML(fields.deliverables)));
  }
  if (fields.creativeDirection.trim()) {
    sections.push(sectionHTML(num++, "Creative Direction", bulletHTML(fields.creativeDirection)));
  }
  if (fields.platformNotes.trim()) {
    sections.push(sectionHTML(num++, "Platform & Posting", bulletHTML(fields.platformNotes)));
  }
  if (fields.cameraTechnical.trim()) {
    sections.push(sectionHTML(num++, "Camera & Technical", bulletHTML(fields.cameraTechnical)));
  }
  if (fields.workflow.trim()) {
    sections.push(sectionHTML(num++, "Shoot Workflow", bulletHTML(fields.workflow)));
  }
  if (fields.dos.trim() || fields.donts.trim()) {
    sections.push(
      sectionHTML(
        num++,
        "Do's & Don'ts",
        dosAndDontsHTML(fields.dos, fields.donts)
      )
    );
  }
  if (fields.fileDelivery.trim()) {
    sections.push(sectionHTML(num++, "File Delivery", bulletHTML(fields.fileDelivery)));
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(fields.title)}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f0eb;color:#1a1a1a;line-height:1.6}
.hero{background:#1a1a1a;color:white;padding:60px 40px;text-align:center}
.hero .badge{display:inline-block;background:#D73F09;color:white;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;padding:6px 16px;border-radius:20px;margin-bottom:24px}
.hero h1{font-size:32px;font-weight:900;margin-bottom:8px}
.hero .subtitle{color:#999;font-size:14px}
.container{max-width:800px;margin:0 auto;padding:40px 24px}
.section{background:white;border-radius:16px;padding:32px;margin-bottom:24px;box-shadow:0 1px 3px rgba(0,0,0,0.06)}
.section-header{display:flex;align-items:center;gap:12px;margin-bottom:20px}
.section-num{background:#D73F09;color:white;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;flex-shrink:0}
.section-title{font-size:20px;font-weight:800}
.section p{font-size:15px;color:#444;margin-bottom:12px}
.section ul{list-style:none;padding:0}
.section li{position:relative;padding-left:20px;margin-bottom:10px;font-size:15px;color:#444}
.section li::before{content:"";position:absolute;left:0;top:8px;width:8px;height:8px;background:#D73F09;border-radius:50%}
.dos-donts{display:grid;grid-template-columns:1fr 1fr;gap:24px}
.dos-col h3{color:#16a34a;font-size:16px;font-weight:700;margin-bottom:12px}
.donts-col h3{color:#dc2626;font-size:16px;font-weight:700;margin-bottom:12px}
.dos-col li::before{background:#16a34a}
.donts-col li::before{background:#dc2626}
.footer{text-align:center;padding:40px;color:#999;font-size:13px}
.footer span{color:#D73F09;font-weight:700}
@media(max-width:600px){.hero{padding:40px 20px}.hero h1{font-size:24px}.section{padding:24px}.dos-donts{grid-template-columns:1fr}}
</style>
</head>
<body>
<div class="hero">
  <div class="badge">${esc(fields.badgeText || "Videographer Creative Brief")}</div>
  <h1>${esc(fields.title)}</h1>
  <div class="subtitle">${esc(fields.clientName)} × Postgame</div>
</div>
<div class="container">
${sections.join("\n")}
</div>
<div class="footer">Built with <span>Postgame</span> Page Creator</div>
</body>
</html>`;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sectionHTML(num: number, title: string, content: string): string {
  return `<div class="section">
  <div class="section-header">
    <div class="section-num">${num}</div>
    <div class="section-title">${esc(title)}</div>
  </div>
  ${content}
</div>`;
}

function paraHTML(text: string): string {
  return text
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => `<p>${esc(l.trim())}</p>`)
    .join("\n  ");
}

function bulletHTML(text: string): string {
  const items = text
    .split("\n")
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
  if (items.length === 0) return "";
  return `<ul>\n${items.map((i) => `    <li>${esc(i)}</li>`).join("\n")}\n  </ul>`;
}

function dosAndDontsHTML(dos: string, donts: string): string {
  const doItems = dos
    .split("\n")
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
  const dontItems = donts
    .split("\n")
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
  return `<div class="dos-donts">
    <div class="dos-col">
      <h3>DO</h3>
      <ul>${doItems.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
    </div>
    <div class="donts-col">
      <h3>DON'T</h3>
      <ul>${dontItems.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
    </div>
  </div>`;
}
