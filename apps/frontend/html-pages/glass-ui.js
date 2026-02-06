(function(){
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

  document.querySelectorAll('[data-bind]').forEach(function(input){
    var selector = input.getAttribute('data-bind');
    var target = selector ? document.querySelector(selector) : null;
    if (!target) return;
    var update = function(){ target.textContent = input.value; };
    input.addEventListener('input', update);
    update();
  });
})();
