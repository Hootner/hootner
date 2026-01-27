// Inject hashed CSS/JS assets from dist using a simple manifest
(function(){
  var base = (function(){
    var s = document.currentScript;
    var src = s && s.getAttribute('src') || '';
    var i = src.indexOf('/ui/pages/');
    return i >= 0 ? src.substring(0, i + '/ui/pages/'.length) : '';
  })();

  function loadManifest(cb){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', base + 'dist/assets-manifest.json', true);
    xhr.onreadystatechange = function(){
      if (xhr.readyState === 4){
        if (xhr.status >= 200 && xhr.status < 300){
          try { cb(JSON.parse(xhr.responseText)); } catch(e){ cb(null); }
        } else { cb(null); }
      }
    };
    xhr.send();
  }

  function injectAssets(m){
    if (!m) return;
    if (m.css){
      var l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = base + 'pages/' + m.css.replace(/^assets\//, 'dist/assets/');
      document.head.appendChild(l);
    }
    if (m.js){
      var s = document.createElement('script');
      s.src = base + 'pages/' + m.js.replace(/^assets\//, 'dist/assets/');
      s.defer = true;
      document.body.appendChild(s);
    }
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){
      loadManifest(injectAssets);
    });
  } else {
    loadManifest(injectAssets);
  }
})();
