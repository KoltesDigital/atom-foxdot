'use babel';

import { CompositeDisposable } from 'atom';
import { spawn } from 'child_process';
import autocompleteProvider from './autocomplete-provider';

export default {

	childProcess: null,
	subscriptions: null,

	config: {
		pythonPath: {
			title: 'python path',
			description: 'Leave empty to use python from the PATH.',
			type: 'string',
			default: '',
			order: 1,
		},
	},

	getAutocompleteProvider() {
		return autocompleteProvider;
	},

	activate() {
		this.subscriptions = new CompositeDisposable();
		this.subscriptions.add(atom.commands.add('atom-workspace', {
			'foxdot:clear-clock': event => {
				if (!this.childProcess) {
					return event.abortKeyBinding();
				}
				this.clearClock();
			},
			'foxdot:evaluate-blocks': event => {
				if (!this.childProcess) {
					return event.abortKeyBinding();
				}
				this.evaluateBlocks();
			},
			'foxdot:evaluate-file': event => {
				if (!this.childProcess) {
					return event.abortKeyBinding();
				}
				this.evaluateFile();
			},
			'foxdot:evaluate-lines': event => {
				if (!this.childProcess) {
					return event.abortKeyBinding();
				}
				this.evaluateLines();
			},
			'foxdot:toggle': () => {
				if (!this.childProcess) {
					this.start();
				} else {
					this.stop();
				}
			},
		}));
	},

	deactivate() {
		if (this.childProcess) {
			this.stop();
		}

		this.subscriptions.dispose();
	},

	serialize() {
		return {
		};
	},

	start() {
		const pythonPath = atom.config.get('foxdot.pythonPath') || 'python';
		this.childProcess = spawn(pythonPath, ['-m', 'FoxDot', '--pipe']);

		this.childProcess.stdin.on('close', () => {
			this.stop();
		});

		this.childProcess.stdout.on('data', (data) => {
			atom.notifications.addInfo('FoxDot stdout.', {
				detail: data,
			});
		});

		this.childProcess.stderr.on('data', (data) => {
			atom.notifications.addError('FoxDot stderr.', {
				detail: data,
			});
		});

		this.childProcess.on('close', (code) => {
			if (code) {
				atom.notifications.addError(`FoxDot has exited with code ${code}.`);
			} else {
				atom.notifications.addSuccess('FoxDot has stopped.');
			}
			this.childProcess = null;
		});

		atom.notifications.addSuccess('FoxDot has started.');
		autocompleteProvider.enabled = true;
	},

	stop() {
		this.childProcess.kill();
		autocompleteProvider.enabled = false;
	},

	evaluateCode(code) {
		const stdin = this.childProcess.stdin;
		stdin.write(code);
		stdin.write('\n\n');
	},

	evaluateRange(range) {
		const editor = atom.workspace.getActiveTextEditor();
		const buffer = editor.getBuffer();

		const marker = editor.markBufferRange(range);
		editor.decorateMarker(marker, {
			type: 'highlight',
			class: 'foxdot-flash',
		});
		setTimeout(() => {
			marker.destroy();
		}, 300);

		const code = buffer.getTextInRange(range);
		this.evaluateCode(code);
	},

	evaluateRanges(ranges) {
		return ranges.forEach(range => this.evaluateRange(range));
	},

	evaluateFile() {
		const editor = atom.workspace.getActiveTextEditor();
		if (!editor) {
			return;
		}

		const range = editor.getBuffer().getRange();
		return this.evaluateRange(range);
	},

	evaluateBlocks() {
		const editor = atom.workspace.getActiveTextEditor();
		if (!editor) {
			return;
		}

		const buffer = editor.getBuffer();
		const lines = buffer.getLines();
		const selectedRanges = editor.getSelectedBufferRanges();
		const ranges = selectedRanges.map(selectedRange => {
			if (!selectedRange.isEmpty()) {
				return selectedRange;
			}

			const row = selectedRange.start.row;

			let rowBefore = row;
			while (rowBefore >= 0 && lines[rowBefore] !== '') {
				--rowBefore;
			}

			let rowAfter = row;
			while (rowAfter < lines.length && lines[rowAfter] !== '') {
				++rowAfter;
			}

			const range = [[rowBefore + 1, 0], [rowAfter, 0]];
			return buffer.clipRange(range);
		});
		return this.evaluateRanges(ranges);
	},

	evaluateLines() {
		const editor = atom.workspace.getActiveTextEditor();
		if (!editor) {
			return;
		}

		const buffer = editor.getBuffer();
		const positions = editor.getCursorBufferPositions();
		const ranges = positions.map(position => {
			const row = position.row;
			return buffer.rangeForRow(row, true);
		});
		return this.evaluateRanges(ranges);
	},

	clearClock() {
		return this.evaluateCode('Clock.clear()');
	},
};
