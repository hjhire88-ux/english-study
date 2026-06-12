// 오프라인 캐시 (https로 호스팅될 때만 동작)
var CACHE = "engmaster-v5";
var FILES = ["./", "./index.html", "./manifest.json", "./icon.svg"];
["p01","p02","p03","p04","p05","p06","p07","p08","p09","p10",
 "i01","i02","i03","i04","i05","i06","i07","i08"].forEach(function(f){ FILES.push("./data/" + f + ".js"); });

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(FILES); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch", function(e){
  if (e.request.method !== "GET") return;
  // 유튜브 등 외부 요청은 네트워크로
  if (new URL(e.request.url).origin !== location.origin) return;
  // 페이지 진입(index.html)은 네트워크 우선: 항상 최신 버전, 오프라인일 때만 캐시
  if (e.request.mode === "navigate" || e.request.url.indexOf("index.html") >= 0) {
    e.respondWith(
      fetch(e.request).then(function(res){
        var cp = res.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, cp); });
        return res;
      }).catch(function(){
        return caches.match(e.request).then(function(r){ return r || caches.match("./index.html"); });
      })
    );
    return;
  }
  // 나머지 정적 파일(data 등)은 캐시 우선
  e.respondWith(
    caches.match(e.request).then(function(r){
      return r || fetch(e.request).then(function(res){
        var cp = res.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, cp); });
        return res;
      });
    }).catch(function(){ return caches.match("./index.html"); })
  );
});
