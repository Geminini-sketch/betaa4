const PASS = "kingshotbeta";
let loggedIn = localStorage.getItem("kv_login") === "1";

let servers = [];
let reports = [
  {title:"Transfer agreement dispute", server:1022, alliance:"NOVA", player:"DarkWolf", status:"pending", confidence:"Low", desc:"Reported disagreement over merge terms. Screenshots pending review.", screenshot:"demo"},
  {title:"Harassment report in diplomacy chat", server:1048, alliance:"VOID", player:"Unknown", status:"pending", confidence:"Medium", desc:"Community submission with chat screenshots. Context incomplete.", screenshot:"demo"},
  {title:"Recruitment promise mismatch", server:1107, alliance:"ARC", player:"Astra", status:"disputed", confidence:"Low", desc:"Alliance disputes the interpretation of the agreement.", screenshot:"demo"}
];

let alliances = [
  {name:"NOVA", server:1022, tags:["Recruitment Open","Competitive","Mixed Reputation"], notes:"Strong activity. Diplomacy notes incomplete.", reports:1, players:["DarkWolf"]},
  {name:"VOID", server:1048, tags:["High Conflict","Whale Heavy"], notes:"Multiple pending reports. Needs careful moderation.", reports:1, players:["Unknown"]},
  {name:"ARC", server:1107, tags:["Transfer Friendly","International"], notes:"Generally open to incoming players.", reports:1, players:["Astra"]},
  {name:"LYNX", server:1188, tags:["Casual","Quiet"], notes:"Low current data.", reports:0, players:[]}
];

let people = [
  {name:"DarkWolf", role:"Leader", server:1022, alliance:"NOVA", tags:["Diplomacy Issues","Active Leadership"], reports:1},
  {name:"Astra", role:"Diplomat", server:1107, alliance:"ARC", tags:["Transfer Friendly"], reports:1},
  {name:"Rin", role:"Officer", server:1188, alliance:"LYNX", tags:["Low Data"], reports:0}
];

function enterSite() {
  const value = document.getElementById("gatePassword").value;
  if (value === PASS) {
    localStorage.setItem("kv_access", "1");
    document.getElementById("gate").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    init();
  } else alert("Wrong password. Demo password is kingshotbeta.");
}

function fakeLogin() {
  loggedIn = true;
  localStorage.setItem("kv_login", "1");
  updateLoginUI();
}
function fakeLogout() {
  loggedIn = false;
  localStorage.removeItem("kv_login");
  updateLoginUI();
}
function updateLoginUI() {
  const el = document.getElementById("loginStatus");
  if (el) el.textContent = loggedIn ? "Signed in as demo user" : "Not signed in";
  const warning = document.getElementById("submitWarning");
  if (warning) {
    warning.textContent = loggedIn ? "" : "You must sign in before submitting a report. This prototype uses a demo sign-in button.";
    warning.className = loggedIn ? "notice" : "notice show";
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
  if (id === "submit") updateLoginUI();
}

function seedServers() {
  servers = [];
  for (let i = 928; i <= 1277; i++) {
    let sample = {};
    if (i === 1022) sample = {activity:"High", transfer:"Selective", risk:"Medium", tags:["Competitive","Mixed Reputation"], alliances:"NOVA", leaders:"DarkWolf"};
    if (i === 1048) sample = {activity:"High", transfer:"Closed", risk:"High", tags:["High Conflict","Whale Heavy"], alliances:"VOID", leaders:"Unknown"};
    if (i === 1107) sample = {activity:"Medium", transfer:"Open", risk:"Low", tags:["Transfer Friendly","International"], alliances:"ARC", leaders:"Astra"};
    servers.push({
      number:i, activity: sample.activity || "Unknown", transfer: sample.transfer || "Unknown",
      risk: sample.risk || "Low data", tags: sample.tags || ["No data yet"],
      alliances: sample.alliances || "No alliance data yet", leaders: sample.leaders || "No player data yet",
      reportCount: sample.alliances ? 1 : 0
    });
  }
  syncReportsToEntities();
  renderServers();
}

function badgeClass(tag) {
  if (["Transfer Friendly","Recruitment Open","Low","Open"].includes(tag)) return "good";
  if (["High Conflict","Whale Heavy","Diplomacy Issues","High"].includes(tag)) return "bad";
  if (["Selective","Mixed Reputation","Medium"].includes(tag)) return "warn";
  return "";
}

function upsertAlliance(name, server) {
  let clean = name || "Unknown alliance";
  let a = alliances.find(x => x.name.toLowerCase() === clean.toLowerCase());
  if (!a) {
    a = {name:clean, server:Number(server), tags:["New from report"], notes:"Created automatically from a submitted report. Needs admin review.", reports:0, players:[]};
    alliances.unshift(a);
  }
  return a;
}

function upsertPlayer(name, server, alliance) {
  let clean = name || "Unknown player";
  let p = people.find(x => x.name.toLowerCase() === clean.toLowerCase());
  if (!p) {
    p = {name:clean, role:"Unknown", server:Number(server), alliance, tags:["New from report"], reports:0};
    people.unshift(p);
  }
  return p;
}

function syncReportsToEntities() {
  reports.forEach(r => {
    const server = servers.find(s => s.number === Number(r.server));
    if (server) {
      server.alliances = r.alliance || server.alliances;
      server.leaders = r.player || server.leaders;
      server.reportCount = reports.filter(x => Number(x.server) === Number(r.server)).length;
      if (!server.tags.includes("Has reports")) server.tags = ["Has reports", ...server.tags.filter(t => t !== "No data yet")];
    }
    const a = upsertAlliance(r.alliance, r.server);
    if (!a.players.includes(r.player)) a.players.push(r.player);
    a.reports = reports.filter(x => (x.alliance || "").toLowerCase() === a.name.toLowerCase()).length;
    const p = upsertPlayer(r.player, r.server, r.alliance);
    p.reports = reports.filter(x => (x.player || "").toLowerCase() === p.name.toLowerCase()).length;
  });
}

function renderServers() {
  if (!servers.length) seedServers();
  syncReportsToEntities();
  const q = (document.getElementById("search")?.value || "").toLowerCase();
  const filtered = servers.filter(s => String(s.number).includes(q) || s.alliances.toLowerCase().includes(q) || s.leaders.toLowerCase().includes(q)).slice(0, 60);
  document.getElementById("serverGrid").innerHTML = filtered.map(s => `
    <article class="card">
      <h3>Server ${s.number}</h3>
      <div class="badges">
        <span class="badge ${badgeClass(s.transfer)}">Transfer: ${s.transfer}</span>
        <span class="badge ${badgeClass(s.risk)}">Risk: ${s.risk}</span>
        <span class="badge">Activity: ${s.activity}</span>
        <span class="badge">Reports: ${s.reportCount || 0}</span>
      </div>
      <p class="meta">Alliances: ${s.alliances}<br/>Players/leaders: ${s.leaders}<br/>${s.tags.join(" · ")}</p>
    </article>
  `).join("");
}

function renderAlliances() {
  syncReportsToEntities();
  document.getElementById("allianceGrid").innerHTML = alliances.map(a => `
    <article class="card">
      <h3>${a.name}</h3>
      <p class="meta">Server ${a.server} · Reports: ${a.reports || 0}<br/>Players: ${(a.players || []).join(", ") || "No player data yet"}</p>
      <div class="badges">${a.tags.map(t => `<span class="badge ${badgeClass(t)}">${t}</span>`).join("")}</div>
      <p>${a.notes}</p>
    </article>
  `).join("");
}

function renderPeople() {
  syncReportsToEntities();
  document.getElementById("peopleGrid").innerHTML = people.map(p => `
    <article class="card">
      <h3>${p.name}</h3>
      <p class="meta">${p.role} · Server ${p.server}<br/>Alliance: ${p.alliance}<br/>Reports: ${p.reports || 0}</p>
      <div class="badges">${p.tags.map(t => `<span class="badge ${badgeClass(t)}">${t}</span>`).join("")}</div>
    </article>
  `).join("");
}

function renderReports() {
  document.getElementById("reportGrid").innerHTML = reports.map(r => `
    <article class="card">
      <h3>${r.title}</h3>
      <p class="meta">Server ${r.server} · ${r.alliance} / ${r.player}<br/>Status: ${r.status} · Confidence: ${r.confidence}<br/>Screenshot: ${r.screenshot ? "provided" : "missing"}</p>
      <p>${r.desc}</p>
    </article>
  `).join("");
}

function renderAdmin() {
  document.getElementById("adminGrid").innerHTML = reports.map((r, i) => `
    <article class="card">
      <h3>${r.title}</h3>
      <p class="meta">Server ${r.server} · ${r.alliance} / ${r.player}<br/>Current status: ${r.status}<br/>Screenshot: ${r.screenshot ? "provided" : "missing"}</p>
      <button onclick="setReportStatus(${i}, 'reviewed')">Approve</button>
      <button onclick="setReportStatus(${i}, 'rejected')">Reject</button>
      <button onclick="setReportStatus(${i}, 'disputed')">Mark disputed</button>
    </article>
  `).join("");
}

function setReportStatus(i, status) {
  reports[i].status = status;
  renderAdmin();
  renderReports();
}

function submitReport(e) {
  e.preventDefault();
  if (!loggedIn) {
    alert("Please sign in before submitting. Use the demo sign-in button in the sidebar.");
    return;
  }
  const file = document.getElementById("rFile").files[0];
  if (!file) {
    alert("Screenshot is required.");
    return;
  }
  const newReport = {
    title: document.getElementById("rTitle").value,
    server: Number(document.getElementById("rServer").value),
    alliance: document.getElementById("rAlliance").value.trim(),
    player: document.getElementById("rPlayer").value.trim(),
    status: "pending",
    confidence: "Unreviewed",
    desc: document.getElementById("rDesc").value,
    screenshot: file.name
  };
  reports.unshift(newReport);
  syncReportsToEntities();
  alert("Submitted as pending. Server, alliance, and player records were auto-linked.");
  e.target.reset();
  showView("reports");
  renderReports();
}

function init() {
  seedServers();
  updateLoginUI();
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
