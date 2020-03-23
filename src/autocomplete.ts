const suggestions = require('../data/autocomplete');

export default {
	disableForSelector: '.source.python .comment',
	enabled: false,
	filterSuggestions: true,

	getSuggestions({ prefix }: { prefix: string }) {
		if (!this.enabled) {
			return null;
		}

		suggestions.forEach((suggestion: { replacementPrefix: string }) => {
			suggestion.replacementPrefix = prefix;
		});
		return suggestions;
	},

	inclusionPriority: 10,
	selector: '.source.python',
	suggestionPriority: 10,
};
