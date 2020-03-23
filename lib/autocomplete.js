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
        suggestions.forEach((suggestion) => {
            suggestion.replacementPrefix = prefix;
        });
        return suggestions;
    },
    inclusionPriority: 10,
    selector: '.source.python',
    suggestionPriority: 10,
};
