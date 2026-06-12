// 단일 파일 빌드: index.html + data/*.js 18개 → 영어회화마스터.html 하나로 합침
// 사용법: node build_single.js   (데이터를 수정한 뒤에는 다시 실행)
var fs = require("fs"), path = require("path");
var dir = __dirname;
var html = fs.readFileSync(path.join(dir, "index.html"), "utf8");
var count = 0;
html = html.replace(/<script src="data\/([a-z0-9]+)\.js"><\/script>/g, function (m, f) {
  count++;
  return "<script>\n" + fs.readFileSync(path.join(dir, "data", f + ".js"), "utf8") + "\n</script>";
});
// 단일 파일은 보통 file://로 열리므로 manifest 링크 제거
html = html.replace('<link rel="manifest" href="manifest.json">\n', "");
var out = path.join(dir, "영어회화마스터.html");
fs.writeFileSync(out, html);
console.log("data 파일 " + count + "개 병합 완료 → " + out);
console.log("크기: " + (fs.statSync(out).size / 1024).toFixed(0) + " KB");
