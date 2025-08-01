module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Ensure exactly one export default per file',
      category: 'Best Practices',
    },
    messages: {
      multipleDefaults: 'Only one default export allowed per file.',
      missingDefault: 'Expected a default export in this file.',
    },
  },
  create(context) {
    let defaultExportCount = 0;

    return {
      ExportDefaultDeclaration() {
        defaultExportCount++;
      },
      'Program:exit'() {
        if (defaultExportCount > 1) {
          context.report({
            loc: { line: 1, column: 0 },
            messageId: 'multipleDefaults',
          });
        }

        // Optional: warn if there's no default export at all
        // Comment out the section below if you don't want to enforce default exports
        if (defaultExportCount === 0) {
          context.report({
            loc: { line: 1, column: 0 },
            messageId: 'missingDefault',
          });
        }
      },
    };
  },
};