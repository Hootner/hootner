// Minimal GUI Toolkit
class Widget {
  constructor(type, props = {}) {
    this.type = type;
    this.props = props;
    this.children = [];
  }

  add(child) {
    this.children.push(child);
  }

  render() {
    const attrs = Object.entries(this.props).map(([k, v]) => `${k}="${v}"`).join(' ');
    const content = this.children.map(c => c.render()).join('');
    return `<${this.type} ${attrs}>${content}</${this.type}>`;
  }
}

class GUI {
  window(title) {
    return new Widget('div', { class: 'window', title });
  }

  button(text, onClick) {
    const btn = new Widget('button', { onclick: onClick });
    btn.children.push({ render: () => text });
    return btn;
  }
}

const gui = new GUI();
const win = gui.window('App');
win.add(gui.button('Click', 'alert("Hi")'));
console.log(win.render());

export default GUI;
