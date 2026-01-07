class RendererManager { 
  constructor() { 
    this.workers = new Map();
    this.messageQueue = []; 
  }

  createWorker(name, code) { 
    try {
      const blob = new Blob([code], { type: 'application/javascript' });
      const worker = new Worker(URL.createObjectURL(blob));
      worker.onmessage = (e) => this.handleWorkerMessage(name, e.data);
      worker.onerror = (e) => console.error(`Worker ${name} error:`, e);
      this.workers.set(name, worker);
      return worker;
    } catch (error) {
      console.error('Create worker failed:', error);
      return null;
    }
  }

  async offloadToWorker(workerName, task, data) { 
    return new Promise((resolve, reject) => { 
      try {
        const worker = this.workers.get(workerName);
        if (!worker) { 
          reject(new Error(`Worker ${workerName} not found`));
          return; 
        }
        const id = Date.now() + Math.random();
        const timeout = setTimeout(() => { 
          reject(new Error(`Worker ${workerName} timeout`)); 
        }, 5000);
        const handler = (e) => { 
          if (e.data.id === id) { 
            clearTimeout(timeout);
            worker.removeEventListener('message', handler);
            if (e.data.error) reject(new Error(e.data.error));
            else resolve(e.data.result);
          } 
        };
        worker.addEventListener('message', handler);
        worker.postMessage({ id, task, data });
      } catch (error) {
        reject(error);
      }
    }); 
  }

  handleWorkerMessage(name, data) { 
    console.log(`Worker ${name} message:`, data);
  }

  initializeDiffWorker() { 
    try {
      const code = `
        self.onmessage = function(e) { 
          const { id, task, data } = e.data;
          try { 
            if (task === 'diff') { 
              const { original, current } = data;
              const result = computeDiff(original, current);
              self.postMessage({ id, result }); 
            } 
          } catch (error) { 
            self.postMessage({ id, error: error.message }); 
          } 
        };
        function computeDiff(original, current) { 
          const origLines = original.split('\\n');
          const currLines = current.split('\\n');
          const changes = [];
          for (let i = 0; i < Math.max(origLines.length, currLines.length); i++) { 
            if (origLines[i] !== currLines[i]) { 
              changes.push({ 
                line: i + 1,
                type: !currLines[i] ? 'removed' : !origLines[i] ? 'added' : 'modified',
                original: origLines[i] || '',
                current: currLines[i] || '' 
              }); 
            } 
          }
          return changes; 
        }
      `;
      this.createWorker('diff', code);
    } catch (error) {
      console.error('Initialize diff worker failed:', error);
    }
  }

  initializeAIWorker() { 
    try {
      const code = `
        self.onmessage = function(e) { 
          const { id, task, data } = e.data;
          try { 
            if (task === 'analyze') { 
              const result = analyzeCode(data.code);
              self.postMessage({ id, result }); 
            } 
          } catch (error) { 
            self.postMessage({ id, error: error.message }); 
          } 
        };
        function analyzeCode(code) { 
          const lines = code.split('\\n');
          return { 
            lines: lines.length,
            chars: code.length,
            functions: (code.match(/function\\s+\\w+/g) || []).length,
            classes: (code.match(/class\\s+\\w+/g) || []).length,
            complexity: Math.min(10, Math.floor(lines.length / 10)) 
          }; 
        }
      `;
      this.createWorker('ai', code);
    } catch (error) {
      console.error('Initialize AI worker failed:', error);
    }
  }

  terminateWorker(name) { 
    try {
      const worker = this.workers.get(name);
      if (worker) { 
        worker.terminate();
        this.workers.delete(name); 
      }
    } catch (error) {
      console.error('Terminate worker failed:', error);
    }
  }

  terminateAll() { 
    try {
      this.workers.forEach((worker) => { 
        try { worker.terminate(); } catch (error) { console.error('Terminate error:', error); }
      });
      this.workers.clear();
    } catch (error) {
      console.error('Terminate all failed:', error);
    }
  }
}

if (typeof module !== 'undefined' && module.exports) { module.exports = RendererManager; }
