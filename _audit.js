// 자동 데이터 무결성 검사 (읽기 전용)
global.DB = [];
const files = ["p01","p02","p03","p04","p05","p06","p07","p08","p09","p10","i01","i02","i03","i04","i05","i06","i07","i08"];
files.forEach(f => require("./data/" + f + ".js"));
const issues = [];
const hangul = /[가-힣]/, latin = /[A-Za-z]/;
const seen = {};
DB.forEach(d => {
  const id = d.n;
  if (!d.n || !d.t || !d.e || !d.k || !Array.isArray(d.x)) { issues.push(id + ": 필수 필드 누락"); return; }
  if (d.x.length !== 3) issues.push(id + ": 예문 " + d.x.length + "개");
  if (hangul.test(d.e)) issues.push(id + ": 영어 표현(e)에 한글 — " + d.e);
  if (!hangul.test(d.k)) issues.push(id + ": 한국어 뜻(k)에 한글 없음 — " + d.k);
  if (d.t === "i" && !d.s) issues.push(id + ": 숙어인데 동의어(s) 없음");
  d.x.forEach((p, i) => {
    if (!p[0] || !p[1]) { issues.push(id + " 예문" + (i+1) + ": 빈 문자열"); return; }
    if (hangul.test(p[0])) issues.push(id + " 예문" + (i+1) + ": EN에 한글 — " + p[0]);
    if (!hangul.test(p[1])) issues.push(id + " 예문" + (i+1) + ": KO에 한글 없음 — " + p[1]);
    if (/\s{2,}/.test(p[0]) || /\s{2,}/.test(p[1])) issues.push(id + " 예문" + (i+1) + ": 이중 공백");
    if (p[0] !== p[0].trim() || p[1] !== p[1].trim()) issues.push(id + " 예문" + (i+1) + ": 앞뒤 공백");
    if (!/[.!?"]$/.test(p[0].trim())) issues.push(id + " 예문" + (i+1) + ": EN 끝 문장부호 없음 — " + p[0]);
    if (/"/.test(p[0]) || /"/.test(p[1])) issues.push(id + " 예문" + (i+1) + ": 큰따옴표 포함(속성 깨짐 위험)");
  });
  const key = d.e.toLowerCase().trim();
  if (seen[key]) issues.push(id + ": 표현 중복 (" + seen[key] + "와 동일: " + d.e + ")");
  else seen[key] = id;
});
console.log("총 항목:", DB.length, "/ 검사 결과 문제:", issues.length, "건");
issues.forEach(s => console.log(" -", s));
