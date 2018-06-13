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
    container.innerHTML = '';
    
    if (typeof vnode === 'string') {
        let textNode = document.createTextNode(vnode);
        return container.appendChild(textNode);
    }

    let dom = document.createElement(vnode.tag);

    if (vnode.attrs) {
        Object.keys(vnode.attrs).forEach(key => {
            let value = vnode.attrs[key];
            setAttribute(dom, key, value);
        });
    }

    vnode.children && vnode.children.forEach(child => render(child, dom));
    
    return container.appendChild(dom);
}

// setAttribute
function setAttribute(dom, name, value) {
    if (name === 'className') name = 'class';

    if (/on\w+/.test(name)) {
        name = name.toLowecase();
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