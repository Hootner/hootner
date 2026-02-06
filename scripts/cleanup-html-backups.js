#!/usr/bin/env node

/**
 * HTML Cleanup Script
 * Reviews backup files and provides cleanup options
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class HTMLCleanup {
    constructor() {
        this.projectRoot = path.resolve(__dirname, '..');
        this.htmlDir = path.join(this.projectRoot, 'apps/frontend/html-pages');
        this.archiveDir = path.join(this.htmlDir, '_archive');
        this.backupFiles = [];
        this.mainFiles = [];
    }

    ensureArchiveDir(timestamp, subdir = 'legacy-backups') {
        const dir = path.join(this.archiveDir, subdir, timestamp);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        return dir;
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

    scanFiles() {
        const files = fs.readdirSync(this.htmlDir);

        files.forEach(file => {
            if (file.endsWith('.backup.html')) {
                this.backupFiles.push(file);
            } else if (file.endsWith('.html')) {
                this.mainFiles.push(file);
            }
        });
    }

    migrateLegacyBackups() {
        this.scanFiles();

        if (this.backupFiles.length === 0) {
            console.log('✅ No legacy .backup.html files found');
            return;
        }

        const timestamp = this.getTimestamp();
        const destDir = this.ensureArchiveDir(timestamp, 'legacy-backups');

        console.log(`📦 Migrating ${this.backupFiles.length} legacy backups into: ${destDir}`);

        this.backupFiles.forEach(backupFile => {
            const fromPath = path.join(this.htmlDir, backupFile);
            const toName = backupFile.replace(/\.backup\.html$/i, '.html');
            const toPath = path.join(destDir, toName);
            fs.renameSync(fromPath, toPath);
            console.log(`   ✅ Moved: ${backupFile} → _archive/legacy-backups/${timestamp}/${toName}`);
        });
    }

    compareFiles(backupFile, mainFile) {
        try {
            const backupPath = path.join(this.htmlDir, backupFile);
            const mainPath = path.join(this.htmlDir, mainFile);

            const backupContent = fs.readFileSync(backupPath, 'utf8');
            const mainContent = fs.readFileSync(mainPath, 'utf8');

            return {
                backup: backupFile,
                main: mainFile,
                backupSize: backupContent.length,
                mainSize: mainContent.length,
                identical: backupContent === mainContent,
                backupNewer: backupContent.length > mainContent.length
            };
        } catch (e) {
            return { error: e.message };
        }
    }

    cleanupBackups() {
        console.log('🧹 HTML Backup Files Cleanup\n');

        // Preferred workflow: archive legacy backups rather than keep *.backup.html in the root folder.
        this.migrateLegacyBackups();

        // Re-scan after migration (should normally be 0 now)
        this.backupFiles = [];
        this.mainFiles = [];
        this.scanFiles();

        console.log(`Found ${this.backupFiles.length} legacy backup files remaining in root`);
        console.log(`Found ${this.mainFiles.length} main HTML files\n`);

        let removedCount = 0;
        let keptCount = 0;

        this.backupFiles.forEach(backupFile => {
            const mainFile = backupFile.replace('.backup.html', '.html');
            const comparison = this.compareFiles(backupFile, mainFile);

            if (comparison.error) {
                console.log(`❌ Error comparing ${backupFile}: ${comparison.error}`);
                return;
            }

            if (comparison.identical) {
                // Files are identical, safe to remove backup
                const backupPath = path.join(this.htmlDir, backupFile);
                fs.unlinkSync(backupPath);
                console.log(`🗑️  Removed identical backup: ${backupFile}`);
                removedCount++;
            } else {
                // Files are different, keep backup for manual review
                console.log(`⚠️  Kept different backup: ${backupFile} (${comparison.backupSize} vs ${comparison.mainSize} chars)`);
                keptCount++;
            }
        });

        console.log(`\n📊 Cleanup Summary:`);
        console.log(`   ✅ Removed ${removedCount} identical backups`);
        console.log(`   ⚠️  Kept ${keptCount} different backups for review`);

        if (keptCount > 0) {
            console.log(`\n💡 Review remaining backup files manually:`);
            this.backupFiles.forEach(backupFile => {
                if (fs.existsSync(path.join(this.htmlDir, backupFile))) {
                    console.log(`   • ${backupFile}`);
                }
            });
        }
    }

    generateInventory() {
        this.scanFiles();

        console.log('\n📋 HTML Files Inventory:');
        console.log('='.repeat(50));

        const categories = {
            'Core Pages': ['index.html', 'dashboard.html', 'login.html', 'profile.html'],
            'Video Features': ['video-player.html', 'upload-video.html', 'my-videos.html', 'live-stream.html'],
            'AI Features': ['ai-video.html', 'auto-editor.html', 'ultra-editor.html'],
            'Admin Tools': ['admin-session-manager.html', 'agent-management.html', 'devops-monitoring.html'],
            'Security': ['security-command-center.html', 'security-demo.html', 'usb-passkey-demo.html'],
            'Social Features': ['feed.html', 'feed-react.html', 'messages.html', 'collaboration.html'],
            'Business': ['marketplace.html', 'pricing.html', 'analytics.html'],
            'Development': ['code-editor.html', 'config.html'],
            'Other': []
        };

        const categorized = new Set();

        Object.entries(categories).forEach(([category, files]) => {
            const existingFiles = files.filter(file => {
                const exists = this.mainFiles.includes(file);
                if (exists) categorized.add(file);
                return exists;
            });

            if (existingFiles.length > 0) {
                console.log(`\n${category} (${existingFiles.length}):`);
                existingFiles.forEach(file => {
                    console.log(`   • ${file}`);
                });
            }
        });

        // Show uncategorized files
        const uncategorized = this.mainFiles.filter(file => !categorized.has(file));
        if (uncategorized.length > 0) {
            console.log(`\nOther (${uncategorized.length}):`);
            uncategorized.forEach(file => {
                console.log(`   • ${file}`);
            });
        }

        console.log(`\n📊 Total: ${this.mainFiles.length} HTML files organized`);
    }
}

// Execute cleanup
const cleanup = new HTMLCleanup();
cleanup.cleanupBackups();
cleanup.generateInventory();
