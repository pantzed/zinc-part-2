'use strict';

/* eslint-env browser */


(() => {

    function renderTemplate(template, users) {
        fetch(`${template}.html`)
            .then(template => template.text())
            .then((template) => {
                let bracketStuff = /{{\s*([\w.]+)\s*}}/g;
                users.forEach((user) => {
                    let renderTemplate = template.replace(bracketStuff, (match, matches) => {
                        let arr = matches.split('.');
                        return arr.reduce((acc, curr) => acc[curr], user);
                    });
                    document.getElementById('z-user-list').insertAdjacentHTML('beforeend', renderTemplate);
                });
            });
    };

    function init() {
        fetch('https://randomuser.me/api/?results=5')
            .then(res => res.json())
            .then(data => renderTemplate('user', data.results));
    }

    document.addEventListener('DOMContentLoaded', init);
    
})();