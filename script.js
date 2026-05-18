const PASS = "kingshotbeta";

let servers = [];
let reports = [
  {title:"Transfer agreement dispute", server:1022, target:"NOVA / DarkWolf", status:"pending", confidence:"Low", desc:"Reported disagreement over merge terms. Screenshots pending review."},
  {title:"Harassment report in diplomacy chat", server:1048, target:"VOID", status:"pending", confidence:"Medium", desc:"Community submission with chat screenshots. Context incomplete."},
  {title:"Recruitment promise mismatch", server:1107, target:"ARC", status:"disputed", confidence:"Low", desc:"Alliance disputes the interpretation of the agreement."}
];

const alliances = [
  {name:"NOVA", server:1022, tags:["Recruitment Open","Competitive","Mixed Reputation"], notes:"Strong activity. Diplomacy notes incomplete."},
  {name:"VOID", server:1048, tags:["High Conflict","Whale Heavy"], notes:"Multiple pending reports. Needs careful moderation."},
  {name:"ARC", server:1107, tags:["Transfer Friendly","International"], notes:"Generally open to incoming players."},
  {name:"LYNX", server:1188, tags:["Casual","Quiet"], notes:"Low current data."}
];

const people = [
  {name:"DarkWolf", role:"Leader", server:1022, tags:["Diplomacy Issues","Active Leadership"]},
  {name:"Astra", role:"Diplomat", server:1107, tags:["Transfer Friendly"]},
  {name:"Rin", role:"Officer", server:1188, tags:["Low Data"]}
];

function enterSite() {
  const value = document.getElementById("gatePassword").value;
  if (value === PASS) {
    localStorage.setItem("kv_access", "1");
    document.getElementById("gate").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    init();
  } else {
    alert("Wrong password. Demo password is kingshotbeta.");
  }
}

function showView(id, btn) {
  document.querySelectorAll(".view").forEach(v => v.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
  document.querySelectorAll(".nav").forEach(n => n.classList.remove("active"));
  if (btn) btn.classList.add("active");
  if (id === "servers") renderServers();
  if (id === "alliances") renderAlliances();
  if (id === "people") renderPeople();
  if (id === "reports") renderReports();
  if (id === "admin") renderAdmin();
}

function seedServers() {
  servers = [];
  for (let i = 928; i <= 1277; i++) {
    let sample = {};
    if (i === 1022) sample = {activity:"High", transfer:"Selective", risk:"Medium", tags:["Competitive","Mixed Reputation"], alliances:"NOVA", leaders:"DarkWolf"};
    if (i === 1048) sample = {activity:"High", transfer:"Closed", risk:"High", tags:["High Conflict","Whale Heavy"], alliances:"VOID", leaders:"Unknown"};
    if (i === 1107) sample = {activity:"Medium", transfer:"Open", risk:"Low", tags:["Transfer Friendly","International"], alliances:"ARC", leaders:"Astra"};
    servers.push({
      number:i,
      activity: sample.activity || "Unknown",
      transfer: sample.transfer || "Unknown",
      risk: sample.risk || "Low data",
      tags: sample.tags || ["No data yet"],
      alliances: sample.alliances || "No alliance data yet",
      leaders: sample.leaders || "No player data yet"
    });
  }
  renderServers();
}

function badgeClass(tag) {
  if (["Transfer Friendly","Recruitment Open","Low"].includes(tag)) return "good";
  if (["High Conflict","Whale Heavy","Diplomacy Issues"].includes(tag)) return "bad";
  if (["Selective","Mixed Reputation","Medium"].includes(tag)) return "warn";
  return "";
}

function renderServers() {
  if (!servers.length) seedServers();
  const q = (document.getElementById("search")?.value || "").toLowerCase();
  const filtered = servers.filter(s => String(s.number).includes(q) || s.alliances.toLowerCase().includes(q) || s.leaders.toLowerCase().includes(q)).slice(0, 60);
  document.getElementById("serverGrid").innerHTML = filtered.map(s => `
    <article class="card">
      <h3>Server ${s.number}</h3>
      <div class="badges">
        <span class="badge ${badgeClass(s.transfer)}">Transfer: ${s.transfer}</span>
        <span class="badge ${badgeClass(s.risk)}">Risk: ${s.risk}</span>
        <span class="badge">Activity: ${s.activity}</span>
      </div>
      <p class="meta">Alliances: ${s.alliances}<br/>Players/leaders: ${s.leaders}<br/>${s.tags.join(" · ")}</p>
    </article>
  `).join("");
}

function renderAlliances() {
  document.getElementById("allianceGrid").innerHTML = alliances.map(a => `
    <article class="card">
      <h3>${a.name}</h3>
      <p class="meta">Server ${a.server}</p>
      <div class="badges">${a.tags.map(t => `<span class="badge ${badgeClass(t)}">${t}</span>`).join("")}</div>
      <p>${a.notes}</p>
    </article>
  `).join("");
}

function renderPeople() {
  document.getElementById("peopleGrid").innerHTML = people.map(p => `
    <article class="card">
      <h3>${p.name}</h3>
      <p class="meta">${p.role} · Server ${p.server}</p>
      <div class="badges">${p.tags.map(t => `<span class="badge ${badgeClass(t)}">${t}</span>`).join("")}</div>
    </article>
  `).join("");
}

function renderReports() {
  document.getElementById("reportGrid").innerHTML = reports.map(r => `
    <article class="card">
      <h3>${r.title}</h3>
      <p class="meta">Server ${r.server} · ${r.target}<br/>Status: ${r.status} · Confidence: ${r.confidence}</p>
      <p>${r.desc}</p>
    </article>
  `).join("");
}

function renderAdmin() {
  document.getElementById("adminGrid").innerHTML = reports.map((r, i) => `
    <article class="card">
      <h3>${r.title}</h3>
      <p class="meta">Server ${r.server} · ${r.target}<br/>Current status: ${r.status}</p>
      <button onclick="setReportStatus(${i}, 'reviewed')">Approve</button>
      <button onclick="setReportStatus(${i}, 'rejected')">Reject</button>
      <button onclick="setReportStatus(${i}, 'disputed')">Mark disputed</button>
    </article>
  `).join("");
}

function setReportStatus(i, status) {
  reports[i].status = status;
  renderAdmin();
}

function submitReport(e) {
  e.preventDefault();
  reports.unshift({
    title: document.getElementById("rTitle").value,
    server: document.getElementById("rServer").value,
    target: document.getElementById("rTarget").value || "Unspecified",
    status: "pending",
    confidence: "Unreviewed",
    desc: document.getElementById("rDesc").value
  });
  alert("Submitted as pending. In the real version, admin approval would be required before public visibility.");
  showView("reports");
  renderReports();
}

function init() {
  seedServers();
  renderAlliances();
  renderPeople();
  renderReports();
  renderAdmin();
}

if (localStorage.getItem("kv_access") === "1") {
  document.getElementById("gate").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  init();
}
