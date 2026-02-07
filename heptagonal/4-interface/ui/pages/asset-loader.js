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
      setupGlossyUI();
    });
  } else {
    loadManifest(injectAssets);
    setupGlossyUI();
  }
})();

function setupGlossyUI(){
  var root = document.documentElement;
  var body = document.body;

  if (body) {
    body.classList.add('hdr10');
    body.classList.add('glossy');
  }

  function setGloss(x, y){
    root.style.setProperty('--gloss-x', x + '%');
    root.style.setProperty('--gloss-y', y + '%');
  }

  document.addEventListener('mousemove', function(e){
    var x = Math.min(100, Math.max(0, (e.clientX / window.innerWidth) * 100));
    var y = Math.min(100, Math.max(0, (e.clientY / window.innerHeight) * 100));
    setGloss(x, y);
  }, { passive: true });

  document.addEventListener('scroll', function(){
    var y = Math.min(100, (window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight)) * 100);
    setGloss(parseFloat(getComputedStyle(root).getPropertyValue('--gloss-x')) || 50, y);
  }, { passive: true });

  // Simple data binding: data-bind="#target" on inputs updates target text content
  document.querySelectorAll('[data-bind]')
    .forEach(function(input){
      var selector = input.getAttribute('data-bind');
      var target = selector ? document.querySelector(selector) : null;
      if (!target) return;
      var update = function(){ target.textContent = input.value; };
      input.addEventListener('input', update);
      update();
    });
}
