// Minimal Window Manager
class WindowManager {
  constructor() {
    this.windows = [];
    this.focused = null;
  }

  create(title, x, y, w, h) {
    const win = { id: this.windows.length, title, x, y, w, h, visible: true };
    this.windows.push(win);
    this.focus(win.id);
    return win.id;
  }

  focus(id) {
    this.focused = id;
    console.log(`Focused: ${this.windows[id].title}`);
  }

  move(id, x, y) {
    this.windows[id].x = x;
    this.windows[id].y = y;
  }

  close(id) {
    this.windows[id].visible = false;
  }

  list() {
    return this.windows.filter(w => w.visible);
  }
}

const wm = new WindowManager();
wm.create('Terminal', 0, 0, 800, 600);
wm.create('Browser', 100, 100, 1024, 768);
console.log(wm.list());

export default WindowManager;
