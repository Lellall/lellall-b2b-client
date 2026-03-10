const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function findTsxFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(findTsxFiles(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = findTsxFiles(srcDir);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Skip if it doesn't contain the Naira sign
    if (!content.includes('₦')) {
        return;
    }

    let modified = false;

    // Pattern 1: Template literals e.g. `₦${amount}` -> formatCurrency(amount)
    const templateRegex = /`₦\$\{([^}]+)\}`/g;
    if (templateRegex.test(content)) {
        content = content.replace(templateRegex, 'formatCurrency($1)');
        modified = true;
    }

    // Pattern 2: JSX text e.g. ₦{amount} -> {formatCurrency(amount)}
    const jsxRegex = /₦\{([^}]+)\}/g;
    if (jsxRegex.test(content)) {
        content = content.replace(jsxRegex, '{formatCurrency($1)}');
        modified = true;
    }

    // Pattern 3: JSX strings like "₦250" -> formatCurrency(250) (Used in reporting tables)
    const staticStringRegex = /"₦([0-9.,]+)"/g;
    if (staticStringRegex.test(content)) {
        content = content.replace(staticStringRegex, (match, digits) => `formatCurrency(${digits.replace(/,/g, '')})`);
        modified = true;
    }

    // Pattern 4: Raw Naira string with static content e.g. ₦430 -> {formatCurrency(430)}
    // Look out for products-table.tsx specifically
    const rawStaticRegex = /: "₦([0-9.,]+)"/g;
    if (rawStaticRegex.test(content)) {
        content = content.replace(rawStaticRegex, (match, digits) => `: formatCurrency(${digits.replace(/,/g, '')})`);
        modified = true;
    }

    // Pattern 5: Unit Price (₦) labels and similar
    const labelRegex = /\(₦\)/g;
    if (labelRegex.test(content)) {
        content = content.replace(labelRegex, '({currencySymbol})');
        modified = true;
    }

    // Pattern 6: Standalone ₦ characters (usually in spans)
    const exactRegex = />₦<|'₦'|"₦"/g;
    if (exactRegex.test(content)) {
        content = content.replace(/>₦</g, '>{currencySymbol}<');
        content = content.replace(/'₦'/g, 'currencySymbol');
        content = content.replace(/"₦"/g, 'currencySymbol');
        modified = true;
    }

    if (modified) {
        // We need to inject the import and hook usage if they don't exist
        const importStatement = `import { useCurrency } from "@/contexts/CurrencyContext";\n`;

        if (!content.includes('useCurrency')) {
            // Find last import
            const importMatches = [...content.matchAll(/^import.*from.*$/gm)];
            if (importMatches.length > 0) {
                const lastImport = importMatches[importMatches.length - 1];
                const lastImportIndex = lastImport.index + lastImport[0].length;
                content = content.slice(0, lastImportIndex) + '\n' + importStatement + content.slice(lastImportIndex);
            } else {
                content = importStatement + content;
            }
        }

        // Find the component body to inject the hook
        // This is tricky via regex, so we'll do our best for functional components
        const componentRegex = /const\s+([A-Z][a-zA-Z0-9_]*)\s*=\s*(async\s*)?\([^)]*\)\s*(:\s*React\.FC<[^>]+>)?\s*=>\s*\{/g;
        const matches = [...content.matchAll(componentRegex)];

        if (matches.length > 0) {
            // Check if hook is already injected
            if (!content.includes('const { formatCurrency')) {
                // Determine what parts of the hook we need
                const needsFormat = content.includes('formatCurrency');
                const needsSymbol = content.includes('currencySymbol');

                let hookVars = [];
                if (needsFormat) hookVars.push('formatCurrency');
                if (needsSymbol) hookVars.push('currencySymbol');

                if (hookVars.length > 0) {
                    const hookCode = `\n  const { ${hookVars.join(', ')} } = useCurrency();`;

                    // Inject into the first functional component found
                    const matchIdx = matches[0].index + matches[0][0].length;
                    content = content.slice(0, matchIdx) + hookCode + content.slice(matchIdx);
                }
            }
        }

        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated: ${file}`);
    }
});
