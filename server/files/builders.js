export class ElementBuilder {
    constructor(tagName) {
        this.element = document.createElement(tagName);
    }

    setClass(className) {
        this.element.className = className;
        return this;
    }

    setAttribute(name, value) {
        this.element.setAttribute(name, value);
        return this;
    }

    setText(text) {
        this.element.textContent = text;
        return this;
    }

    setHTML(html) {
        this.element.innerHTML = html;
        return this;
    }

    append(...children) {
        children.forEach(child => this.element.append(child));
        return this;
    }

    build() {
        return this.element;
    }
}