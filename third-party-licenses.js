// SPDX-FileCopyrightText: (c) 2024 Xronos Inc.
// SPDX-License-Identifier: BSD-3-Clause

// This script processes third-party licenses from a JSON file, copies individual license
// files to a third-party-licenses directory, and creates a summary license file.
//
// Generate the license file using `license-checker`:
//   `npm install license-checker`
//   `npx license-checker --production --json > licenses.json`
// 
// Usage: node collect-third-party-licenses.js <licenses.json> [--include <include.md>]
// Args:
//   `licenses.json`: The licenses json file output by license-checker
//   `--include <include.md>`: Optionally append a markdown file to third-party statement
// Outputs:
//   `THIRD_PARTY_LICENSES.md`
//   `third-party-licenses/

const fs = require('fs');
const path = require('path');

// Ensure command-line arguments are provided
if (process.argv.length < 3) {
    console.error('Error: Path to license file must be provided.');
    console.error('Usage: node collect-third-party-notice.js <licenses.json> [--include <include.md>]');
    process.exit(1);
}

// Handle optional --include flag
let includePath = null;
if (process.argv.length > 3) {
    if (process.argv[2] === '--include') {
        console.error('Error: Path to licenses.json must be provided before the --include flag.');
        process.exit(1);
    }
    if (process.argv[3] === '--include') {
        if (process.argv.length < 5) {
            console.error('Error: The --include flag must be followed by a filename.');
            process.exit(1);
        }
        includePath = path.resolve(process.argv[4]);
        if (!fs.existsSync(includePath)) {
            console.error(`Error: The file at ${includePath} does not exist.`);
            process.exit(1);
        }
    }
}

// Paths
const licensesPath = path.resolve(process.argv[2]);
const licensesDir = path.resolve('third-party-licenses');
const outputLicensesMd = path.resolve('THIRD_PARTY_LICENSES.md');

// Verify that licenses.json exists and can be parsed
if (!fs.existsSync(licensesPath)) {
    console.error(`Error: The file at ${licensesPath} does not exist.`);
    process.exit(1);
}

let licenses;
try {
    licenses = JSON.parse(fs.readFileSync(licensesPath, 'utf8'));
} catch (error) {
    console.error(`Error: Failed to parse ${licensesPath}. Ensure it is valid JSON.`);
    console.error(error);
    process.exit(1);
}

// Ensure the output directory exists
if (!fs.existsSync(licensesDir)) {
    fs.mkdirSync(licensesDir, { recursive: true });
}

// Collect output for licenses markdown
let licenseMdOutput = '# THIRD-PARTY SOFTWARE LICENSES\n\n';
licenseMdOutput += 'This project includes third-party software components, which are distributed under the\n';
licenseMdOutput += 'following licenses. Full licenses and notices are provided in the\n';
licenseMdOutput += '[third-party-licenses/](third-party-licenses) subdirectory.\n\n';
licenseMdOutput += `## Node Dependencies\n\n`

// Process each dependency
Object.entries(licenses).forEach(([dependencyKey, info]) => {
    let dependency, version;

    if (dependencyKey.startsWith('@')) {
        const lastIndex = dependencyKey.lastIndexOf('@');
        dependency = dependencyKey.slice(0, lastIndex);
        version = dependencyKey.slice(lastIndex + 1);
    } else {
        [dependency, version] = dependencyKey.split('@');
    }

    if (info.licenseFile && fs.existsSync(info.licenseFile)) {
        const fileName = dependency.replace(/[/@]/g, '_') + path.extname(info.licenseFile);
        const newLicensePath = path.join(licensesDir, fileName);

        try {
            fs.copyFileSync(info.licenseFile, newLicensePath);
            console.log(`Copied: ${info.licenseFile} -> ${newLicensePath}`);
            info.licenseFile = path.relative(path.dirname(outputLicensesMd), newLicensePath);
        } catch (error) {
            console.error(`Failed to copy: ${info.licenseFile}`, error);
        }
    } else {
        console.warn(`No license file found for dependency: ${dependency}`);
        info.licenseFile = null;
    }

    delete info.path;

    // Format license information for the markdown output
    licenseMdOutput += `### ${dependency}\n\n`;
    licenseMdOutput += `- Name: ${dependency}\n`;
    if (version) licenseMdOutput += `- Version: ${version}\n`;
    if (info.licenses) licenseMdOutput += `- License: ${info.licenses}\n`;
    if (info.repository) licenseMdOutput += `- Repository: [${info.repository}](${info.repository})\n`;
    if (info.publisher) licenseMdOutput += `- Publisher: ${info.publisher}\n`;
    if (info.email) licenseMdOutput += `- Email: [${info.email}](mailto:${info.email})\n`;
    if (info.licenseFile) licenseMdOutput += `- License File: [${info.licenseFile}](${info.licenseFile})\n`;
    licenseMdOutput += `\n`;
});

// Append contents of include.md if provided
if (includePath) {
    try {
        const includeContent = fs.readFileSync(includePath, 'utf8');
        licenseMdOutput += `${includeContent}`;
        console.log(`Included: ${includePath}`);
    } catch (error) {
        console.error(`Error: Failed to read include file at ${includePath}.`);
        console.error(error);
        process.exit(1);
    }
}

// Write the formatted licenses to a markdown file
fs.writeFileSync(outputLicensesMd, licenseMdOutput.trim());
console.log(`Wrote license file ${outputLicensesMd}`);
