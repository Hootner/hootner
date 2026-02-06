#!/usr/bin/env node

/**
 * HTML Files Consolidation Script
 * Moves all HTML files to apps/frontend/html-pages and removes duplicates
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class HTMLConsolidator {
    constructor() {
        this.projectRoot = path.resolve(__dirname, '..');
        this.targetDir = path.join(this.projectRoot, 'apps/frontend/html-pages');
        this.sourceDirs = [
            path.join(this.projectRoot, 'hexarchy/4-interface/ui/pages'),
            path.join(this.projectRoot, 'hexarchy/4-interface/ui/pages/dist')
        ];
        this.moved = [];
        this.duplicates = [];
        this.errors = [];
    }

    getTimestamp() {
        const d = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        return (
            d.getFullYear() +
            pad(d.getMonth() + 1) +
            pad(d.getDate()) +
            '-' +
            pad(d.getHours()) +
            pad(d.getMinutes()) +
            pad(d.getSeconds())
        );
    }

    ensureArchiveDir(timestamp) {
        const archiveDir = path.join(this.targetDir, '_archive', timestamp);
        if (!fs.existsSync(archiveDir)) {
            fs.mkdirSync(archiveDir, { recursive: true });
        }
        return archiveDir;
    }

    archiveExistingFile(targetPath) {
        const timestamp = this.getTimestamp();
        const archiveDir = this.ensureArchiveDir(timestamp);

        const filename = path.basename(targetPath);
        let archivePath = path.join(archiveDir, filename);
        let counter = 1;
        while (fs.existsSync(archivePath)) {
            archivePath = path.join(archiveDir, filename.replace(/\.html$/i, `.${counter}.html`));
            counter++;
        }

        fs.renameSync(targetPath, archivePath);
        return archivePath;
    }

    ensureTargetDir() {
        if (!fs.existsSync(this.targetDir)) {
            fs.mkdirSync(this.targetDir, { recursive: true });
            console.log(`✅ Created target directory: ${this.targetDir}`);
        }
    }

    isHTMLFile(filename) {
        return filename.endsWith('.html');
    }

    getFileHash(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            // Simple hash based on content length and first 100 chars
            return content.length + content.substring(0, 100).replace(/\s/g, '');
        } catch (e) {
            return null;
        }
    }

    moveFile(sourcePath, targetPath) {
        try {
            // Check if target exists
            if (fs.existsSync(targetPath)) {
                const sourceHash = this.getFileHash(sourcePath);
                const targetHash = this.getFileHash(targetPath);

                if (sourceHash === targetHash) {
                    this.duplicates.push({
                        source: sourcePath,
                        target: targetPath,
                        action: 'skipped_identical'
                    });
                    return false;
                } else {
                    // Files are different, archive existing and move new
                    const archivePath = this.archiveExistingFile(targetPath);
                    this.duplicates.push({
                        source: sourcePath,
                        target: targetPath,
                        archived: archivePath,
                        action: 'archived_and_replaced'
                    });
                }
            }

            // Copy file to target
            fs.copyFileSync(sourcePath, targetPath);

            // Remove source file
            fs.unlinkSync(sourcePath);

            this.moved.push({
                from: sourcePath,
                to: targetPath
            });

            return true;
        } catch (error) {
            this.errors.push({
                file: sourcePath,
                error: error.message
            });
            return false;
        }
    }

    processDirectory(sourceDir) {
        if (!fs.existsSync(sourceDir)) {
            console.log(`⚠️  Directory not found: ${sourceDir}`);
            return;
        }

        console.log(`\n📂 Processing: ${sourceDir}`);

        const files = fs.readdirSync(sourceDir);
        let processedCount = 0;

        files.forEach(filename => {
            if (this.isHTMLFile(filename)) {
                const sourcePath = path.join(sourceDir, filename);
                const targetPath = path.join(this.targetDir, filename);

                if (this.moveFile(sourcePath, targetPath)) {
                    console.log(`   ✅ Moved: ${filename}`);
                    processedCount++;
                } else {
                    console.log(`   ⚠️  Skipped: ${filename}`);
                }
            }
        });

        console.log(`   📊 Processed ${processedCount} HTML files`);
    }

    cleanupEmptyDirs() {
        this.sourceDirs.forEach(dir => {
            if (fs.existsSync(dir)) {
                try {
                    const files = fs.readdirSync(dir);
                    const htmlFiles = files.filter(f => this.isHTMLFile(f));

                    if (htmlFiles.length === 0) {
                        console.log(`   🧹 No HTML files remaining in ${dir}`);
                    }
                } catch (e) {
                    // Directory might not exist anymore
                }
            }
        });
    }

    generateReport() {
        console.log('\n' + '='.repeat(60));
        console.log('📋 HTML CONSOLIDATION REPORT');
        console.log('='.repeat(60));

        console.log(`\n✅ Successfully moved: ${this.moved.length} files`);
        this.moved.forEach(item => {
            const filename = path.basename(item.to);
            console.log(`   • ${filename}`);
        });

        if (this.duplicates.length > 0) {
            console.log(`\n⚠️  Duplicates handled: ${this.duplicates.length} files`);
            this.duplicates.forEach(item => {
                const filename = path.basename(item.target);
                console.log(`   • ${filename} (${item.action})`);
            });
        }

        if (this.errors.length > 0) {
            console.log(`\n❌ Errors: ${this.errors.length} files`);
            this.errors.forEach(item => {
                const filename = path.basename(item.file);
                console.log(`   • ${filename}: ${item.error}`);
            });
        }

        console.log(`\n📁 All HTML files are now in: ${this.targetDir}`);

        // List final contents
        try {
            const finalFiles = fs.readdirSync(this.targetDir)
                .filter(f => this.isHTMLFile(f))
                .sort();

            console.log(`\n📄 Final HTML files (${finalFiles.length}):`);
            finalFiles.forEach(file => {
                console.log(`   • ${file}`);
            });
        } catch (e) {
            console.log('   Error listing final files');
        }
    }

    async consolidate() {
        console.log('🦉 HOOTNER HTML Files Consolidation');
        console.log('Moving all HTML files to apps/frontend/html-pages\n');

        // Ensure target directory exists
        this.ensureTargetDir();

        // Process each source directory
        this.sourceDirs.forEach(dir => {
            this.processDirectory(dir);
        });

        // Cleanup
        this.cleanupEmptyDirs();

        // Generate report
        this.generateReport();

        console.log('\n✅ HTML consolidation complete!');
    }
}

// Execute consolidation
const consolidator = new HTMLConsolidator();
consolidator.consolidate().catch(console.error);
