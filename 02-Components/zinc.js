'use strict';

/* eslint-env browser */

const Zinc = {};
Zinc.components = {};
Zinc.registerComponent = function (componentObject) {
    Zinc.components[componentObject.elementName] = componentObject;
};

(() => {
    function renderComponents(components) {
        for (let component in components) {
            renderComponent(components[component]);
        }
    }

    function renderComponent(component) {
        const elements = Array.from(document.getElementsByTagName(component.elementName));
        fetch(`${component.templateFile}.html`)
            .then(html => html.text())
            .then(template => {
                let tagMatch = /{{\s*([\w.]+)\s*}}/g;
                let arr = [component.data];
                arr.forEach(user =>
                    elements.forEach((element) => {
                        element.insertAdjacentHTML('beforeend', template.replace(tagMatch, (match, capture) =>
                            capture.split('.').reduce((acc, curr) =>
                                acc[curr], user)));
                        checkForNested(element);
                        if (component.controller !== undefined) {
                            element.controller = component.controller;
                            element.controller();
                        }
                    }));
            });
    }

    function checkForNested(parentNode) {
        if (parentNode.childNodes.length === 0) {
            return;
        } else {
            Array.from(parentNode.childNodes).forEach((node) => {
                if (Zinc.components[node.localName] !== undefined) {
                    renderComponent(Zinc.components[node.localName]);
                } else {
                    checkForNested(node);
                }
            });
            return;
        }
    }

    function toggleHilight() {
        this.addEventListener('click', () => {
            event.currentTarget.firstElementChild.classList.toggle('hilight');
        });
    }

    function init() {
        fetch('https://randomuser.me/api/?results=5')
            .then(res => res.json())
            .then(data => {
                for (let i = 0; i < data.results.length; i++) {
                    Zinc.registerComponent({
                        elementName: `user${i}`,
                        templateFile: 'user',
                        data: data.results[i],
                        controller: toggleHilight
                    });
                }
            })
            .then(() => {
                Zinc.registerComponent({
                    elementName: 'user-list',
                    templateFile: 'user-list'
                })
                return renderComponents(Zinc.components)
            });
    }

    document.addEventListener('DOMContentLoaded', init);
})();