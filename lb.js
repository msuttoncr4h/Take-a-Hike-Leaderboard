(function() {

  var CONFIG = window.LB_CONFIG || {};
  var CONFIG_MODE    = CONFIG.mode || "company";
  var CONFIG_COMPANY = CONFIG.company || "";
  var SHEET_CSV_URL  = CONFIG.csvUrl || "";
  var TITLE_COLOR    = CONFIG.titleColor || "#FFFFFF";

  var COL_NAME     = "Participant Name";
  var COL_EMAIL    = "Email Address";
  var COL_TEAM     = "Team";
  var COL_ACTIVITY = "Activity Type";
  var COL_DISTANCE = "Distance";
  var COL_MINUTES  = "Minutes Active";

  var COL_ROLLUP_TEAM     = "Team";
  var COL_ROLLUP_DISTANCE = "Total Distance";
  var COL_ROLLUP_MINUTES  = "Total Minutes";

  var COMPANY_COLORS = {
    "peapack private bank & trust": "#B1975D",
    "pwc":                          "#FD5108",
    "merck":                        "#007A73",
    "beone":                        "#D52B1E",
    "regeneron":                    "#015C9E",
    "genmab":                       "#008C8A"
  };

  function getCompanyColor(name) {
    var key = (name || "").toLowerCase().trim();
    return COMPANY_COLORS[key] || "#FFFFFF";
  }

  var ACTIVITY_COLOR_MAP = {
    "walking":  "#46BDAD",
    "running":  "#FF8321",
    "hiking":   "#5BA82A",
    "cycling":  "#F4B848",
    "swimming": "#77038D",
    "yoga":     "#9B5DE5"
  };

  var ACT_COLORS = ["#46BDAD","#F4B848","#FF8321","#5BA82A","#77038D","#9B5DE5","#00BBF9"];

  // Inject styles
  var style = document.createElement("style");
  style.textContent = '' +
    '@import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Outfit:wght@600;700;800&display=swap");' +

    '.lb-wrap{max-width:900px;margin:32px auto;padding:0 16px;font-family:"DM Sans",sans-serif;color:#FFFFFF}' +
    '.lb-header{text-align:center;margin-bottom:32px}' +
    '.lb-header::after{content:"";display:block;width:60px;height:3px;background:linear-gradient(90deg,#FF8321,#F4B848);margin:16px auto 0;border-radius:2px}' +
    '.lb-title{font-family:"Outfit",sans-serif;font-size:28px;font-weight:800;letter-spacing:-0.5px;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}' +
    '.lb-subtitle{font-size:14px;color:#9999AA;margin-top:6px}' +
    '.lb-notice{font-size:12px;color:#9999AA;margin-top:10px;font-style:italic;line-height:1.5}' +
    '.lb-updated{font-size:11px;color:#66667A;margin-top:8px;font-style:italic}' +

    '.lb-card{background:#1A1A22;border:1px solid #2A2A35;border-radius:12px;overflow:hidden;animation:lbFadeUp 0.5s ease-out}' +
    '@keyframes lbFadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}' +
    '.lb-card table{width:100%;border-collapse:collapse}' +
    '.lb-card thead th{font-family:"Outfit",sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#66667A;padding:14px 16px;text-align:left;border-bottom:1px solid #2A2A35;background:rgba(0,0,0,0.2)}' +
    '.lb-card thead th.lb-num{text-align:right}' +
    '.lb-card tbody tr{transition:background 0.15s ease}' +
    '.lb-card tbody tr:hover{background:rgba(255,131,33,0.06)}' +
    '.lb-card tbody td{padding:10px 16px;font-size:14px;border-bottom:1px solid rgba(42,42,53,0.5);vertical-align:middle}' +
    '.lb-card tbody td.lb-num{text-align:right;font-variant-numeric:tabular-nums}' +

    '.lb-card tr.lb-summary{background:rgba(119,3,141,0.08)}' +
    '.lb-card tr.lb-summary td{font-weight:700;padding-top:14px;padding-bottom:10px;border-bottom:none;border-top:1px solid #2A2A35}' +
    '.lb-card tbody tr.lb-summary:first-child td{border-top:none}' +

    '.lb-rank{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:8px;font-family:"Outfit",sans-serif;font-weight:700;font-size:13px}' +
    '.lb-rank-1{background:linear-gradient(135deg,#F4B848,#E5A030);color:#1a1a22}' +
    '.lb-rank-2{background:linear-gradient(135deg,#C0C0C0,#A0A0A0);color:#1a1a22}' +
    '.lb-rank-3{background:linear-gradient(135deg,#CD7F32,#A0652A);color:#1a1a22}' +
    '.lb-rank-x{background:rgba(255,255,255,0.06);color:#9999AA}' +

    '.lb-card tr.lb-detail td{font-size:13px;color:#9999AA;padding-top:6px;padding-bottom:6px;font-weight:400}' +
    '.lb-card tr.lb-detail td:nth-child(2){padding-left:44px}' +
    '.lb-dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:8px;vertical-align:middle}' +

    '.lb-card tr.lb-co td{padding:16px;font-weight:600;font-size:15px}' +
    '.lb-co-name{display:flex;align-items:center;gap:12px}' +
    '.lb-co-bar{width:4px;height:28px;border-radius:2px}' +

    '.lb-msg{text-align:center;padding:48px 24px;color:#9999AA;font-size:14px}' +
    '.lb-spin{display:inline-block;width:24px;height:24px;border:2px solid #2A2A35;border-top-color:#FF8321;border-radius:50%;animation:lbSpin 0.8s linear infinite;margin-bottom:12px}' +
    '@keyframes lbSpin{to{transform:rotate(360deg)}}' +

    '.lb-card thead th.lb-primary{color:#FF8321;text-align:right}' +
    '.lb-card tbody td.lb-primary{color:#FF8321;font-weight:700;font-size:16px;text-align:right;font-variant-numeric:tabular-nums}' +
    '.lb-card tbody td.lb-muted{color:#66667A;text-align:right;font-variant-numeric:tabular-nums}' +

    '#leaderboard-root{position:relative !important;z-index:10 !important;clear:both !important}' +
    '#leaderboard-root,#leaderboard-root *{visibility:visible !important}' +

    '@media(max-width:640px){' +
      '.lb-wrap{padding:0 8px}' +
      '.lb-title{font-size:22px}' +
      '.lb-card thead th,.lb-card tbody td{padding:8px 10px;font-size:12px}' +
      '.lb-card tr.lb-detail td:nth-child(2){padding-left:32px}' +
      '.lb-rank{width:24px;height:24px;font-size:11px}' +
      '.lb-card .lb-hide-m{display:none}' +
    '}';

  document.head.appendChild(style);

  function findInsertionPoint() {
    var existing = document.getElementById("leaderboard-root");
    if (existing) return existing;

    var marker = document.getElementById("lb-target");
    if (marker) {
      var cont = document.createElement("div");
      cont.id = "leaderboard-root";
      cont.className = "lb-wrap";
      marker.innerHTML = "";
      marker.appendChild(cont);
      var parent = marker.parentElement;
      while (parent && parent !== document.body) {
        var inlineHeight = parent.style.height;
        if (inlineHeight && inlineHeight !== "auto" && inlineHeight !== "") {
          parent.style.height = "auto";
          parent.style.minHeight = "0";
        }
        if (window.getComputedStyle(parent).overflow === "hidden") {
          parent.style.overflow = "visible";
        }
        parent = parent.parentElement;
      }
      return cont;
    }
  }

  var container = findInsertionPoint();
  if (!container) return;
  container.innerHTML = '<div class="lb-card"><div class="lb-msg"><div class="lb-spin"></div><div>Loading leaderboard...</div></div></div>';
  container.style.position = "relative";
  container.style.zIndex = "10";
  container.style.clear = "both";

  function parseLine(line) {
    var result = [], current = "", inQ = false;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      if (inQ) {
        if (ch === '"' && line[i+1] === '"') { current += '"'; i++; }
        else if (ch === '"') { inQ = false; }
        else { current += ch; }
      } else {
        if (ch === '"') { inQ = true; }
        else if (ch === ',') { result.push(current); current = ""; }
        else { current += ch; }
      }
    }
    result.push(current);
    return result;
  }

  function parseCSV(text) {
    var lines = text.split('\n');
    if (lines.length < 2) return [];
    var headers = parseLine(lines[0]);
    var rows = [];
    for (var i = 1; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) continue;
      var vals = parseLine(line);
      var row = {};
      for (var j = 0; j < headers.length; j++) {
        row[headers[j].trim()] = (vals[j] || "").trim();
      }
      rows.push(row);
    }
    return rows;
  }

  function processIndividual(rows, company) {
    var filtered = company ? rows.filter(function(r) { return r[COL_TEAM] === company; }) : rows;
    var people = {};

    filtered.forEach(function(r) {
      var email = (r[COL_EMAIL] || "").toLowerCase().trim();
      if (!email) return;
      if (!people[email]) {
        people[email] = { name: r[COL_NAME], team: r[COL_TEAM], activities: {}, totalDist: 0, totalMins: 0 };
      }
      if (r[COL_NAME]) people[email].name = r[COL_NAME];

      var dist = parseFloat(r[COL_DISTANCE]) || 0;
      var mins = parseFloat(r[COL_MINUTES]) || 0;
      people[email].totalDist += dist;
      people[email].totalMins += mins;

      var act = r[COL_ACTIVITY] || "Other";
      if (!people[email].activities[act]) people[email].activities[act] = { dist: 0, mins: 0 };
      people[email].activities[act].dist += dist;
      people[email].activities[act].mins += mins;
    });

    var sorted = Object.values(people).sort(function(a, b) { return b.totalMins - a.totalMins; });
    sorted.forEach(function(p, i) { p.rank = i + 1; });
    return sorted;
  }

  function processCompanyFromRollup(rows) {
    return rows.map(function(r, i) {
      return {
        rank: i + 1,
        team: r[COL_ROLLUP_TEAM] || "",
        distance: r[COL_ROLLUP_DISTANCE] || "0",
        minutes: r[COL_ROLLUP_MINUTES] || "0"
      };
    }).filter(function(c) { return c.team; });
  }

  function badge(rank) {
    var cls = rank <= 3 ? "lb-rank-" + rank : "lb-rank-x";
    return '<span class="lb-rank ' + cls + '">' + rank + '</span>';
  }

  function dot(name) {
    var key = (name || "").toLowerCase().trim();
    var color = ACTIVITY_COLOR_MAP[key] || "#FFFFFF";
    return '<span class="lb-dot" style="background:' + color + '"></span>';
  }

  var REFRESH_NOTICE = '<div class="lb-notice">Recently submitted activities may take a few minutes to appear on the leaderboard. Refresh the page to see the latest results.</div>';

  function blankIndividualRows() {
    var h = '';
    for (var i = 0; i < 5; i++) {
      h += '<tr><td>&nbsp;</td><td>&nbsp;</td><td class="lb-hide-m">&nbsp;</td><td>&nbsp;</td><td class="lb-num">&nbsp;</td><td class="lb-num">&nbsp;</td></tr>';
    }
    return h;
  }

  function blankCompanyRows() {
    var h = '';
    for (var i = 0; i < 5; i++) {
      h += '<tr><td>&nbsp;</td><td>&nbsp;</td><td class="lb-num lb-muted">&nbsp;</td><td class="lb-primary">&nbsp;</td></tr>';
    }
    return h;
  }

  function renderIndividual(people, company) {
    var h = '<div class="lb-header">' +
      '<div class="lb-title">' + (company || "Individual") + ' Leaderboard</div>' +
      '<div class="lb-subtitle">' + (company ? "Individual Rankings" : "All Participants") + ' · Ranked by Total Minutes</div>' +
      REFRESH_NOTICE +
      '<div class="lb-updated">Last updated: ' + new Date().toLocaleString() + '</div></div>';

    h += '<div class="lb-card"><table><thead><tr>' +
      '<th style="width:40px">Rank</th><th>Name</th><th class="lb-hide-m">Team</th>' +
      '<th>Activity</th><th class="lb-num">Distance (mi)</th><th class="lb-num">Minutes</th>' +
      '</tr></thead><tbody>';

    if (!people || !people.length) {
      h += blankIndividualRows();
    } else {
      people.forEach(function(p) {
        h += '<tr class="lb-summary">' +
          '<td>' + badge(p.rank) + '</td>' +
          '<td><strong>' + p.name + '</strong></td>' +
          '<td class="lb-hide-m">' + p.team + '</td>' +
          '<td><strong>All Activities</strong></td>' +
          '<td class="lb-num"><strong>' + p.totalDist.toFixed(1) + '</strong></td>' +
          '<td class="lb-num"><strong>' + p.totalMins.toFixed(0) + '</strong></td></tr>';

        Object.keys(p.activities)
          .sort(function(a, b) { return p.activities[b].mins - p.activities[a].mins; })
          .forEach(function(act) {
            var d = p.activities[act];
            h += '<tr class="lb-detail"><td></td><td></td><td class="lb-hide-m"></td>' +
              '<td>' + dot(act) + act + '</td>' +
              '<td class="lb-num">' + d.dist.toFixed(1) + '</td>' +
              '<td class="lb-num">' + d.mins.toFixed(0) + '</td></tr>';
          });
      });
    }

    return h + '</tbody></table></div>';
  }

  function renderCompany(companies) {
    var h = '<div class="lb-header">' +
      '<div class="lb-title">Company Leaderboard</div>' +
      '<div class="lb-subtitle">All Companies · Ranked by Total Minutes</div>' +
      REFRESH_NOTICE +
      '<div class="lb-updated">Last updated: ' + new Date().toLocaleString() + '</div></div>';

    h += '<div class="lb-card"><table><thead><tr>' +
      '<th style="width:40px">Rank</th><th>Company</th>' +
      '<th class="lb-num lb-muted">Total Distance (mi)</th>' +
      '<th class="lb-primary">Total Minutes ▼</th></tr></thead><tbody>';

    if (!companies || !companies.length) {
      h += blankCompanyRows();
    } else {
      companies.forEach(function(co) {
        var clr = getCompanyColor(co.team);
        h += '<tr class="lb-co" style="border-left:3px solid ' + clr + '">' +
          '<td>' + badge(co.rank) + '</td>' +
          '<td><div class="lb-co-name"><span class="lb-co-bar" style="background:' + clr + '"></span>' + co.team + '</div></td>' +
          '<td class="lb-num lb-muted">' + co.distance + '</td>' +
          '<td class="lb-primary">' + co.minutes + '</td></tr>';
      });

      var totalDist = 0;
      var totalMins = 0;
      companies.forEach(function(co) {
        totalDist += parseFloat(co.distance) || 0;
        totalMins += parseFloat(co.minutes) || 0;
      });

      h += '<tr class="lb-summary" style="border-top:2px solid #FF8321">' +
        '<td></td>' +
        '<td><strong>All Companies</strong></td>' +
        '<td class="lb-num lb-muted"><strong>' + totalDist.toFixed(1) + '</strong></td>' +
        '<td class="lb-primary"><strong>' + totalMins.toFixed(0) + '</strong></td></tr>';
    }

    return h + '</tbody></table></div>';
  }

  async function init() {
    var rows = [];

    if (SHEET_CSV_URL) {
      try {
        var resp = await fetch(SHEET_CSV_URL);
        var text = await resp.text();
        rows = parseCSV(text);
      } catch (err) {
        container.innerHTML = '<div class="lb-card"><div class="lb-msg"><div style="font-size:32px;margin-bottom:12px">⚠️</div>Could not load data. Please refresh or try back at another time.<br><small style="color:#66667A">' + err.message + '</small></div></div>';
        return;
      }
    }

    if (CONFIG_MODE === "community") {
      container.innerHTML = renderCompany(processCompanyFromRollup(rows));
    } else {
      container.innerHTML = renderIndividual(processIndividual(rows, CONFIG_COMPANY), CONFIG_COMPANY);
    }
  }

  init().then(function() {
    var title = document.querySelector("#leaderboard-root .lb-title");
    if (title) {
      title.style.background = TITLE_COLOR;
      title.style.webkitBackgroundClip = "text";
      title.style.webkitTextFillColor = "transparent";
      title.style.backgroundClip = "text";
    }
  });

})();
