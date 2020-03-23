import { CompositeDisposable } from 'atom';
import autocomplete from './autocomplete';
import { FoxDot } from './foxdot';
import { LoggerInWorkspace, LOGGER_IN_WORKSPACE_URI } from './logging';

let foxDot: FoxDot | undefined;
let logger: LoggerInWorkspace | undefined;
let subscriptions: CompositeDisposable | undefined;

function start() {
	autocomplete.enabled = true;

	if (atom.config.get('foxdot.logging.enabled')) {
		logger = new LoggerInWorkspace();
	}

	foxDot = new FoxDot(logger);
	foxDot.on('stop', () => {
		logger?.setTerminated();

		foxDot = undefined;
		logger = undefined;
	});
}

function stop() {
	foxDot?.dispose();

	autocomplete.enabled = false;
}

export const config = {
	logging: {
		properties: {
			enabled: {
				default: true,
				description: 'Takes effect at the next plugin startup.',
				type: 'boolean',
			},
			logServiceMessages: {
				default: true,
				type: 'boolean',
			},
			logStderr: {
				default: true,
				type: 'boolean',
			},
			logStdin: {
				default: true,
				type: 'boolean',
			},
			logStdout: {
				default: true,
				type: 'boolean',
			},
		},
		type: 'object',
	},
	pythonPath: {
		default: '',
		description:
			'Leave empty to use python from the PATH environment variable.',
		type: 'string',
	},
	samplesDirectory: {
		default: '',
		description: 'Use an alternate directory for looking up samples.',
		type: 'string',
	},
};

export function activate() {
	subscriptions = new CompositeDisposable(
		atom.workspace.addOpener((uri) => {
			if (uri === LOGGER_IN_WORKSPACE_URI) {
				return new LoggerInWorkspace();
			}
			return undefined;
		}),

		atom.commands.add('atom-workspace', {
			'foxdot:clear-clock': (event) => {
				if (!foxDot) {
					return event.abortKeyBinding();
				} else {
					foxDot.clearClock();
				}
			},
			'foxdot:evaluate-blocks': (event) => {
				if (!foxDot) {
					return event.abortKeyBinding();
				} else {
					foxDot.evaluateBlocks();
				}
			},
			'foxdot:evaluate-file': (event) => {
				if (!foxDot) {
					return event.abortKeyBinding();
				} else {
					foxDot.evaluateFile();
				}
			},
			'foxdot:evaluate-lines': (event) => {
				if (!foxDot) {
					return event.abortKeyBinding();
				} else {
					foxDot.evaluateLines();
				}
			},
			'foxdot:toggle': () => {
				if (!foxDot) {
					start();
				} else {
					stop();
				}
			},
		})
	);
}

export function deactivate() {
	stop();
	subscriptions!.dispose();
}

export function provideAutocomplete() {
	return autocomplete;
}

export function serialize() {
	return {};
}
