// ==UserScript==
// @name         Tampermonkey Script Helper
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Helper tool for writing Tampermonkey scripts
// @author       You
// @match        https://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    let isPickingElement = false;
    let lastElement = null;

    const styles = `
        .tm-helper {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: white;
            border: 1px solid #ccc;
            border-radius: 5px;
            padding: 15px;
            z-index: 9999;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            font-family: Arial, sans-serif;
            min-width: 300px;
            max-width: 500px;
        }
        .tm-helper button {
            margin: 5px;
            padding: 5px 10px;
            cursor: pointer;
            background: #f0f0f0;
            border: 1px solid #ccc;
            border-radius: 3px;
        }
        .tm-helper button:hover {
            background: #e0e0e0;
        }
        .tm-helper-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            border-bottom: 1px solid #ccc;
            padding-bottom: 10px;
        }
        .tm-helper-content {
            max-height: 400px;
            overflow-y: auto;
        }
        .tm-helper-footer {
            margin-top: 10px;
            text-align: right;
            border-top: 1px solid #ccc;
            padding-top: 10px;
        }
        .highlight-element {
            outline: 2px solid red !important;
            background-color: rgba(255, 0, 0, 0.1) !important;
        }
        .element-picker {
            cursor: crosshair !important;
        }
        .element-info {
            margin: 10px 0;
            padding: 10px;
            background: #f5f5f5;
            border-radius: 4px;
            font-family: monospace;
            font-size: 12px;
        }
        .copied-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 10000;
            animation: fadeOut 2s forwards;
        }
        @keyframes fadeOut {
            0% { opacity: 1; }
            70% { opacity: 1; }
            100% { opacity: 0; }
        }
    `;

    function createPopup() {
        const div = document.createElement('div');
        div.className = 'tm-helper';
        div.innerHTML = `
            <div class="tm-helper-header">
                <h3>Script Helper</h3>
                <button id="closeHelper">×</button>
            </div>
            <div class="tm-helper-content">
                <div>
                    <button id="togglePicker">Start Element Picker</button>
                    <button id="copySelector">Copy Selector</button>
                </div>
                <div class="element-info">
                    <strong>Selected Element:</strong>
                    <div id="elementInfo">No element selected</div>
                    <div id="selectorInfo"></div>
                </div>
                <div>
                    <h4>Quick Actions</h4>
                    <button id="generateTemplate">Generate Template</button>
                    <button id="generateWaitFor">Generate WaitFor</button>
                </div>
            </div>
        `;
        return div;
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'copied-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text)
            .then(() => showNotification('Copied to clipboard!'))
            .catch(err => console.error('Failed to copy:', err));
    }

    function getElementSelector(element) {
        if (!element) return '';

        let selector = '';
        if (element.id) {
            return `#\${element.id}`;
        }

        if (element.className && typeof element.className === 'string') {
            const classes = element.className.trim().split(/\s+/);
            if (classes.length > 0) {
                selector = '.' + classes.join('.');
                // Verify uniqueness
                if (document.querySelectorAll(selector).length === 1) {
                    return selector;
                }
            }
        }

        // Create path if no unique identifier found
        let path = [];
        while (element && element.nodeName !== 'HTML') {
            let elementSelector = element.nodeName.toLowerCase();
            let siblings = Array.from(element.parentNode?.children || [])
                .filter(e => e.nodeName === element.nodeName);

            if (siblings.length > 1) {
                let index = siblings.indexOf(element) + 1;
                elementSelector += `:nth-child(\${index})`;
            }

            path.unshift(elementSelector);
            element = element.parentNode;
        }

        return path.join(' > ');
    }

    function generateTemplateCode(selector) {
        return `// ==UserScript==
// @name         New Script
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Script description
// @author       You
// @match        \${window.location.href}
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const element = document.querySelector('\${selector}');
    // Your code here
})();`;
    }

    function generateWaitForCode(selector) {
        return `function waitForElement(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

// Usage
waitForElement('\${selector}').then(element => {
    // Your code here
});`;
    }

    function init() {
        // Add styles
        const styleElement = document.createElement('style');
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);

        // Create and add popup
        const popup = createPopup();
        document.body.appendChild(popup);

        // Element picking functionality
        const togglePicker = popup.querySelector('#togglePicker');
        const elementInfo = popup.querySelector('#elementInfo');
        const selectorInfo = popup.querySelector('#selectorInfo');

        togglePicker.addEventListener('click', () => {
            isPickingElement = !isPickingElement;
            togglePicker.textContent = isPickingElement ? 'Stop Picking' : 'Start Element Picker';
            document.body.style.cursor = isPickingElement ? 'crosshair' : 'default';
        });

        popup.querySelector('#copySelector').addEventListener('click', () => {
            if (lastElement) {
                const selector = getElementSelector(lastElement);
                copyToClipboard(selector);
            }
        });

        popup.querySelector('#generateTemplate').addEventListener('click', () => {
            if (lastElement) {
                const selector = getElementSelector(lastElement);
                copyToClipboard(generateTemplateCode(selector));
            }
        });

        popup.querySelector('#generateWaitFor').addEventListener('click', () => {
            if (lastElement) {
                const selector = getElementSelector(lastElement);
                copyToClipboard(generateWaitForCode(selector));
            }
        });

        popup.querySelector('#closeHelper').addEventListener('click', () => {
            popup.remove();
        });

        // Handle element selection
        document.addEventListener('mouseover', (e) => {
            if (!isPickingElement) return;
            e.stopPropagation();

            if (lastElement) {
                lastElement.style.outline = '';
            }

            if (!popup.contains(e.target)) {
                lastElement = e.target;
                lastElement.style.outline = '2px solid red';

                const selector = getElementSelector(lastElement);
                elementInfo.textContent = lastElement.tagName.toLowerCase();
                selectorInfo.textContent = selector;
            }
        });

        document.addEventListener('click', (e) => {
            if (!isPickingElement) return;
            e.preventDefault();
            e.stopPropagation();

            if (!popup.contains(e.target)) {
                isPickingElement = false;
                togglePicker.textContent = 'Start Element Picker';
                document.body.style.cursor = 'default';
            }
        });
    }

    // Add keyboard shortcut (Ctrl+Shift+H)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'H') {
            init();
        }
    });

    // Add initial button
    const initialButton = document.createElement('button');
    initialButton.textContent = 'Open Script Helper';
    initialButton.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9998;padding:10px;';
    initialButton.onclick = init;
    document.body.appendChild(initialButton);
})();
