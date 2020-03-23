import { ViewModel } from 'atom';

export interface Logger {
	service(message: string, error: boolean): void;
	stdin(message: string): void;
	stdout(message: string): void;
	stderr(message: string): void;
}

export const LOGGER_IN_WORKSPACE_URI = 'atom://foxdot/logger';

export class LoggerInWorkspace implements Logger, ViewModel {
	readonly element: HTMLDivElement;
	changeTitleCallbacks: (() => void)[] = [];
	terminated = false;

	constructor() {
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
		return LOGGER_IN_WORKSPACE_URI;
	}

	onDidChangeTitle(callback: () => void) {
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

	service(message: string, error: boolean) {
		if (!atom.config.get('foxdot.logging.logServiceMessages')) {
			return;
		}

		const element = document.createElement('div');
		element.className = 'service';
		element.innerHTML = message;

		return this.addMessage(element, error);
	}

	stdin(message: string) {
		if (!atom.config.get('foxdot.logging.logStdin')) {
			return;
		}

		const element = document.createElement('pre');
		element.className = 'stdin';
		element.innerHTML = message;

		return this.addMessage(element, false);
	}

	stdout(message: string) {
		if (!atom.config.get('foxdot.logging.logStdout')) {
			return;
		}

		const element = document.createElement('pre');
		element.className = 'stdout';
		element.innerHTML = message;

		return this.addMessage(element, false);
	}

	stderr(message: string) {
		if (!atom.config.get('foxdot.logging.logStderr')) {
			return;
		}

		const element = document.createElement('pre');
		element.className = 'stderr';
		element.innerHTML = message;

		return this.addMessage(element, true);
	}

	private addMessage(element: HTMLElement, error: boolean) {
		if (error) {
			element.classList.add('error');
		}

		this.element.appendChild(element);

		this.element.scrollTop = this.element.scrollHeight;
	}
}
