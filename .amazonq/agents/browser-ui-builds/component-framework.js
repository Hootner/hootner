class Component {
    constructor(props = {}) {
        this.props = props;
        this.state = {};
        this.element = null;
    }
    
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.update();
    }
    
    render() {
        return '<div>Override render()</div>';
    }
    
    mount(container) {
        this.element = this.createElement(this.render());
        container.appendChild(this.element);
    }
    
    update() {
        if (this.element) {
            const newElement = this.createElement(this.render());
            this.element.replaceWith(newElement);
            this.element = newElement;
        }
    }
    
    createElement(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.firstChild;
    }
}

class Counter extends Component {
    constructor(props) {
        super(props);
        this.state = { count: 0 };
    }
    
    render() {
        return `
            <div>
                <h2>Counter: ${this.state.count}</h2>
                <button onclick="component.increment()">+</button>
                <button onclick="component.decrement()">-</button>
            </div>
        `;
    }
    
    increment() {
        this.setState({ count: this.state.count + 1 });
    }
    
    decrement() {
        this.setState({ count: this.state.count - 1 });
    }
}

// Usage (in browser):
// const component = new Counter();
// component.mount(document.body);

console.log('Component framework loaded');
console.log('Example render:', new Counter().render());
