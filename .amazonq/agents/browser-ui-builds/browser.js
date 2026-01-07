// Minimal Browser
class Browser {
  constructor() {
    this.history = [];
    this.currentPage = null;
  }

  navigate(url) {
    console.log(`Loading: ${url}`);
    this.history.push(url);
    this.currentPage = this.fetch(url);
    return this.render(this.currentPage);
  }

  fetch(url) {
    return `<html><body><h1>Page: ${url}</h1></body></html>`;
  }

  render(html) {
    const dom = this.parse(html);
    return dom;
  }

  parse(html) {
    return { type: 'html', children: [{ type: 'body', text: html }] };
  }

  back() {
    this.history.pop();
    const prev = this.history[this.history.length - 1];
    if (prev) return this.navigate(prev);
  }
}

const browser = new Browser();
browser.navigate('http://example.com');
console.log('History:', browser.history);

export default Browser;
