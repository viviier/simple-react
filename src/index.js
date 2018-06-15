
// Component
export class Component {
    constructor(props = {}) {
        this.state = {};
        this.props = props;
    }

    setState(stateChange) {
        Object.assign(this.state, stateChange);
        renderComponent(this);
    }
}

// createElement
export default function h(tag, attrs, ...children) {
    return {
        tag,
        attrs,
        children
    }
}

// render
export function render(vnode, container) {
    return container.appendChild(_render(vnode));
}

// _render
function _render(vnode) {
    if (typeof vnode === 'string' || typeof vnode === 'number') {
        let textNode = document.createTextNode(vnode);
        return textNode;
    }

    if (typeof vnode.tag === 'function') {
        let component = createComponent(vnode.tag, vnode.attrs);
        setComponentProps(component, vnode.attrs);
        
        return component.base;
    }

    let dom = document.createElement(vnode.tag);

    if (vnode.attrs) {
        Object.keys(vnode.attrs).forEach(key => {
            let value = vnode.attrs[key];
            setAttribute(dom, key, value);
        });
    }
    
    vnode.children && vnode.children.forEach(child => render(child, dom));
    
    return dom;
}

// setAttribute
function setAttribute(dom, name, value) {
    if (name === 'className') name = 'class';

    if (/on\w+/.test(name)) {
        name = name.toLowerCase();
        dom[name] = value || '';
    } else if (name === 'style') {
        if (!value || typeof value === 'string') {
            dom.style.cssText = value;
        } else if (value && typeof value === 'object') {
            for (let name in value) {
                dom.style[name] = value[name];
            }
        }
    } else {
        if (name !== 'class' && name in dom) {
            dom[name] = value || ''
        }
        if (value) {
            dom.setAttribute(name, value);
        } else {
            dom.removeAtrribute(name);
        }
    }
}

// createComponent
function createComponent(tag, props) {
    let inst;

    if (tag.prototype && tag.prototype.render) {
        inst = new tag(props);
    } else {
        inst = new Component(props);
        inst.constructor = tag;
        inst.render = function() {
            return this.constructor(props);
        }
    }

    return inst;
}

// setComponentProps
function setComponentProps(component, props) {
    if (!component.base) {
        if (component.componentWillMount) {
            component.componentWillMount();
        }
    } else if (component.componentWillReceiveProps) {
        component.componentWillReceiveProps();
    }

    component.props = props;
    renderComponent(component);
}

// renderComponent
function renderComponent(component) {
    let base;
    const renderer = component.render();

    // 获取了render之后，再去看有没有什么更改
    if (component.base && component.componentWillUpdate) {
        component.componentWillUpdate();
    }

    base = _render(renderer);

    if (component.base) {
        if (component.componentDidUpdate) {
            component.componentDidUpdate();
        }
    } else if (component.componentDidMount) {
        component.componentDidMount();
    }

    // 用于更新机制（setState），如果base存在并且base的父节点存在，那么就去更新父节点下面的这个节点为当前渲染的base
    if (component.base && component.base.parentNode) {
		component.base.parentNode.replaceChild( base, component.base );
	}

    component.base = base;
    base._component = component;
}