import { events, elements } from './shadow-styles-events.js';

const stylesheetTemplate = document.createElement('template');
stylesheetTemplate.innerHTML = `<link id="shadow-styles-stylesheet" rel="stylesheet" href="">`;

const template = document.createElement('template');
template.innerHTML = `
<slot></slot>
<shadow-styles-root id="content"></shadow-styles-root>`;

class ShadowStylesRoot extends HTMLElement { }
window.customElements.define('shadow-styles-root', ShadowStylesRoot);

class ShadowStyles extends HTMLElement {
  static observedAttributes = ['stylesheet'];

  constructor() {
    super();
    var shadow = this.attachShadow({ mode: 'open' })
    shadow.appendChild(
      template.content.cloneNode(true)
    );
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'stylesheet':
        var linkElem = this.shadowRoot.getElementById('shadow-styles-stylesheet');
        if(!linkElem) {
          this.shadowRoot.appendChild(stylesheetTemplate.content.cloneNode(true));
          linkElem = this.shadowRoot.getElementById('shadow-styles-stylesheet');
        }
        linkElem.setAttribute('href', newValue);
        break;
    }
  }

  connectedCallback() {
    const container = this.shadowRoot.querySelector('#content');
    const children = [...this.childNodes];
    if (children.length > 0 && container) {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }

      for (let i = 0; i < children.length; i++) {
        // Move the child nodes to the shadow dom, don't clone it
        container.appendChild(children[i]);
      }
    }

    // Handle events attached to document
    elements.push(this);
    events.forEach((apply) => {
      apply(container);
    });

    // Intercept Bootstrap querySelectorAll calls to add children of this wrapper
    const defaultQuerySelectorAll = Element.prototype.querySelectorAll;
    const defaultDocumentQuerySelectorAll = document.querySelectorAll;
    const shadowStyles = this;
    Element.prototype.querySelectorAll = function (selector) {
      let result = defaultQuerySelectorAll.call(this, selector);

      if (this.contains(shadowStyles)) {
        result = [...result].concat([...container.querySelectorAll(selector)]);

        // Add the NodeList items missing from Array
        result.item = (i) => [...result][i] || null;
      }

      return result;
    };
    Element.prototype.querySelector = function (selector) {
      return (
        [...Element.prototype.querySelectorAll.call(this, selector)][0] || null
      );
    };
    document.querySelectorAll = function (selector) {
      let result = defaultDocumentQuerySelectorAll.call(document, selector);

      if (document.contains(shadowStyles)) {
        result = [...result].concat([...container.querySelectorAll(selector)]);

        // Add the NodeList items missing from Array
        result.item = (i) => [...result][i] || null;
      }

      return result;
    };
    document.querySelector = function (selector) {
      return [...document.querySelectorAll.call(this, selector)][0] || null;
    };
  }
}

window.customElements.define('shadow-styles', ShadowStyles);
