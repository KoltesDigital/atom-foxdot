"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOGGER_IN_WORKSPACE_URI = 'atom://foxdot/logger';
class LoggerInWorkspace {
    constructor() {
        this.changeTitleCallbacks = [];
        this.terminated = false;
        this.element = document.createElement('div');
        this.element.classList.add('foxdot-logger', 'native-key-bindings');
        this.element.setAttribute('tabindex', '-1');
        this.element.setAttribute('style', 'overflow-y: scroll;');
        atom.workspace.open(this, {
            activatePane: false,
        });
        atom.workspace.getBottomDock().show();
    }
    dispose() {
        this.element.remove();
    }
    getDefaultLocation() {
        return 'bottom';
    }
    getTitle() {
        return this.terminated ? 'FoxDot (Terminated)' : 'FoxDot';
    }
    getURI() {
        return exports.LOGGER_IN_WORKSPACE_URI;
    }
    onDidChangeTitle(callback) {
        this.changeTitleCallbacks.push(callback);
        return {
            dispose: () => {
                const index = this.changeTitleCallbacks.indexOf(callback);
                if (index !== -1) {
                    this.changeTitleCallbacks.splice(index, 1);
                }
            },
        };
    }
    setTerminated() {
        this.terminated = true;
        this.changeTitleCallbacks.forEach((callback) => callback());
    }
    service(message, error) {
        if (!atom.config.get('foxdot.logging.logServiceMessages')) {
            return;
        }
        const element = document.createElement('div');
        element.className = 'service';
        element.innerHTML = message;
        return this.addMessage(element, error);
    }
    stdin(message) {
        if (!atom.config.get('foxdot.logging.logStdin')) {
            return;
        }
        const element = document.createElement('pre');
        element.className = 'stdin';
        element.innerHTML = message;
        return this.addMessage(element, false);
    }
    stdout(message) {
        if (!atom.config.get('foxdot.logging.logStdout')) {
            return;
        }
        const element = document.createElement('pre');
        element.className = 'stdout';
        element.innerHTML = message;
        return this.addMessage(element, false);
    }
    stderr(message) {
        if (!atom.config.get('foxdot.logging.logStderr')) {
            return;
        }
        const element = document.createElement('pre');
        element.className = 'stderr';
        element.innerHTML = message;
        return this.addMessage(element, true);
    }
    addMessage(element, error) {
        if (error) {
            element.classList.add('error');
        }
        this.element.appendChild(element);
        this.element.scrollTop = this.element.scrollHeight;
    }
}
exports.LoggerInWorkspace = LoggerInWorkspace;
