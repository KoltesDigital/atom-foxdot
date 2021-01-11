"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const suggestions = require('../data/autocomplete');
exports.default = {
    disableForSelector: '.source.python .comment',
    enabled: false,
    filterSuggestions: true,
    getSuggestions({ prefix }) {
        if (!this.enabled) {
            return null;
        }
        const suggestionsWithReplacementPrefixes = suggestions.map((suggestion) => (Object.assign(Object.assign({}, suggestion), { replacementPrefix: prefix })));
        return suggestionsWithReplacementPrefixes;
    },
    inclusionPriority: 10,
    selector: '.source.python',
    suggestionPriority: 10,
};
