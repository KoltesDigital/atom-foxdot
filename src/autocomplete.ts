const suggestions = require('../data/autocomplete') as Record<
	string,
	unknown
>[];

export default {
	disableForSelector: '.source.python .comment',
	enabled: false,
	filterSuggestions: true,

	getSuggestions({ prefix }: { prefix: string }) {
		if (!this.enabled) {
			return null;
		}

		const suggestionsWithReplacementPrefixes = suggestions.map(
			(suggestion) => ({
				...suggestion,
				replacementPrefix: prefix,
			})
		);
		return suggestionsWithReplacementPrefixes;
	},

	inclusionPriority: 10,
	selector: '.source.python',
	suggestionPriority: 10,
};
