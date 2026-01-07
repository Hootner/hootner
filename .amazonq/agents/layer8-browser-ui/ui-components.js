#!/usr/bin/env node
/**
 * Layer 8: UI Components - Reusable component system
 * Dependencies: Layer 8 (Virtual DOM, Rendering Engine)
 */

class UIComponent {
  constructor(props = {}) {
    this.props = props;
    this.state = {};
    this.children = [];
    this.mounted = false;
    this.vnode = null;
  }

  // Lifecycle: Before mount
  beforeMount() {}

  // Lifecycle: After mount
  afterMount() {}

  // Lifecycle: Before update
  beforeUpdate(prevProps, prevState) {}

  // Lifecycle: After update
  afterUpdate(prevProps, prevState) {}

  // Lifecycle: Before unmount
  beforeUnmount() {}

  // Set state and trigger re-render
  setState(newState) {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...newState };
    
    if (this.mounted) {
      this.beforeUpdate(this.props, prevState);
      this.vnode = this.render();
      this.afterUpdate(this.props, prevState);
      console.log(`[UPDATE] ${this.constructor.name}`);
    }
  }

  // Render method (override in subclass)
  render() {
    return { tag: 'div', props: {}, children: [] };
  }

  // Mount component
  mount(parent) {
    this.beforeMount();
    this.vnode = this.render();
    this.mounted = true;
    this.afterMount();
    console.log(`[MOUNT] ${this.constructor.name}`);
    return this.vnode;
  }

  // Unmount component
  unmount() {
    this.beforeUnmount();
    this.mounted = false;
    console.log(`[UNMOUNT] ${this.constructor.name}`);
  }

  // Add child component
  addChild(component) {
    this.children.push(component);
  }
}

// Button component
class Button extends UIComponent {
  render() {
    return {
      tag: 'button',
      props: {
        class: this.props.variant || 'default',
        onclick: this.props.onClick
      },
      children: [{ tag: 'text', text: this.props.label || 'Button' }]
    };
  }
}

// Input component
class Input extends UIComponent {
  constructor(props) {
    super(props);
    this.state = { value: props.value || '' };
  }

  handleChange(value) {
    this.setState({ value });
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }

  render() {
    return {
      tag: 'input',
      props: {
        type: this.props.type || 'text',
        value: this.state.value,
        placeholder: this.props.placeholder,
        onchange: (e) => this.handleChange(e.target.value)
      },
      children: []
    };
  }
}

// List component
class List extends UIComponent {
  render() {
    return {
      tag: 'ul',
      props: { class: 'list' },
      children: (this.props.items || []).map(item => ({
        tag: 'li',
        props: { key: item.id },
        children: [{ tag: 'text', text: item.text }]
      }))
    };
  }
}

// Card component
class Card extends UIComponent {
  render() {
    return {
      tag: 'div',
      props: { class: 'card' },
      children: [
        {
          tag: 'div',
          props: { class: 'card-header' },
          children: [{ tag: 'text', text: this.props.title }]
        },
        {
          tag: 'div',
          props: { class: 'card-body' },
          children: this.props.children || []
        }
      ]
    };
  }
}

// Modal component
class Modal extends UIComponent {
  constructor(props) {
    super(props);
    this.state = { open: props.open || false };
  }

  open() {
    this.setState({ open: true });
  }

  close() {
    this.setState({ open: false });
  }

  render() {
    if (!this.state.open) return { tag: 'div', props: { style: 'display: none' }, children: [] };
    
    return {
      tag: 'div',
      props: { class: 'modal-overlay' },
      children: [
        {
          tag: 'div',
          props: { class: 'modal' },
          children: [
            {
              tag: 'div',
              props: { class: 'modal-header' },
              children: [
                { tag: 'text', text: this.props.title },
                {
                  tag: 'button',
                  props: { onclick: () => this.close() },
                  children: [{ tag: 'text', text: 'X' }]
                }
              ]
            },
            {
              tag: 'div',
              props: { class: 'modal-body' },
              children: this.props.children || []
            }
          ]
        }
      ]
    };
  }
}

// Form component
class Form extends UIComponent {
  constructor(props) {
    super(props);
    this.state = { values: {}, errors: {} };
  }

  handleSubmit(e) {
    e.preventDefault();
    
    // Validate
    const errors = this.validate(this.state.values);
    
    if (Object.keys(errors).length === 0) {
      if (this.props.onSubmit) {
        this.props.onSubmit(this.state.values);
      }
    } else {
      this.setState({ errors });
    }
  }

  validate(values) {
    const errors = {};
    
    for (const [field, rules] of Object.entries(this.props.validation || {})) {
      if (rules.required && !values[field]) {
        errors[field] = `${field} is required`;
      }
    }
    
    return errors;
  }

  render() {
    return {
      tag: 'form',
      props: { onsubmit: (e) => this.handleSubmit(e) },
      children: this.props.children || []
    };
  }
}

// Demo
if (require.main === module) {
  console.log('=== UI Components Demo ===\n');
  
  // Button
  const button = new Button({ label: 'Click Me', variant: 'primary' });
  const buttonVNode = button.mount();
  console.log('Button:', JSON.stringify(buttonVNode, null, 2).slice(0, 100) + '...\n');
  
  // Input with state
  const input = new Input({ placeholder: 'Enter text', value: 'Hello' });
  input.mount();
  console.log('Input initial value:', input.state.value);
  input.handleChange('World');
  console.log('Input updated value:', input.state.value, '\n');
  
  // List
  const list = new List({
    items: [
      { id: 1, text: 'Item 1' },
      { id: 2, text: 'Item 2' },
      { id: 3, text: 'Item 3' }
    ]
  });
  const listVNode = list.mount();
  console.log('List items:', listVNode.children.length, '\n');
  
  // Card
  const card = new Card({
    title: 'My Card',
    children: [{ tag: 'text', text: 'Card content' }]
  });
  card.mount();
  
  // Modal
  const modal = new Modal({ title: 'Confirm', open: false });
  modal.mount();
  console.log('Modal open:', modal.state.open);
  modal.open();
  console.log('Modal opened:', modal.state.open);
}

module.exports = { UIComponent, Button, Input, List, Card, Modal, Form };
