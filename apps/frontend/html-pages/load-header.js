// Load shared header
(function() { fetch('shared-header.html')
    .then(res => res.text())
    .then(html => { const temp = document.createElement('div');
      temp.textContent = html;
      document.body.insertBefore(temp.firstElementChild, document.body.firstChild);
      const style = temp.querySelector('style');
      if (style) document.head.appendChild(style);

      // Highlight current page
      const currentPage = window.location.pathname.split('/').pop() || 'index.html';
      document.querySelectorAll('nav a').forEach(link => { if (link.getAttribute('href') === currentPage) { link.classList.remove('text-slate-300');
          link.classList.add('text-green-400', 'font-medium'); } }); })
    .catch(err => console.error('Failed to load header:', err)); })();
