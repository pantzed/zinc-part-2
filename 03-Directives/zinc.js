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
            const attrRegex = /z\[([\w-*\w]*)\]/;
            elements.forEach((element) => {
                let names = element.getAttributeNames();
                names.forEach((name) => {
                    let attrName = attrRegex.exec(name);
                    if (attrName !== null) {
                        component.controller.$data[attrName[1]] = element.getAttribute(name);
                    }
                })
            });
            fetch(`${component.templateFile}.html`)
                .then(html => html.text())
                .then(template => {
                    let tagMatch = /{{\s*([\w.]+)\s*}}/g;
                    elements.forEach((element) => {
                        element.insertAdjacentHTML('beforeend', template.replace(tagMatch, (match, capture) => capture.split('.').reduce((acc, curr) => acc[curr], component.controller.$data)));
                        checkForNested(element);
                        if (component.controller !== undefined) {
                            element.controller = component.controller.$state;
                            element.controller();
                        }
                    });
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
                    .then((data) => {
                        Zinc.registerComponent({
                            elementName: 'user-list',
                            templateFile: 'user-list'
                        });
                        Zinc.registerComponent({
                            elementName: `user`,
                            templateFile: 'user',
                            controller: {$state: toggleHilight, $data: {}}
                        });
                        return renderComponents(Zinc.components)
                    });
            }

            document.addEventListener('DOMContentLoaded', init);
        })();