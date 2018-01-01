'use babel';

const suggestions = require('../data/autocomplete');

export default {
	selector: '.source.python',
	disableForSelector: '.source.python .comment',

	inclusionPriority: 10,
	suggestionPriority: 10,
	filterSuggestions: true,

	enabled: false,

	getSuggestions({ prefix }) {
		if (!this.enabled) {
			return null;
		}

		suggestions.forEach(suggestion => {
			suggestion.replacementPrefix = prefix;
		});
		return suggestions;
	},
};
