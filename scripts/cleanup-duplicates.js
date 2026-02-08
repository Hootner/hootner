#!/usr/bin/env node

/**
 * HOOTNER Duplicate Cleanup Script
 * Consolidates duplicate files and fixes architecture conflicts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const CLEANUP_PLAN = {
	// Phase 1: Remove archive/backup duplicates
	archiveCleanup: [
		'apps/frontend/html-pages/_archive',
	],

	// Phase 2: Consolidate frontend pages
	frontendConsolidation: {
		primary: 'apps/frontend/html-pages',
		duplicates: [
			'apps/frontend/public',
			'src/frontend/pages',
			'heptagonal/4-interface/ui/pages',
		],
	},

	// Phase 3: Fix architecture naming (hexarchy -> heptagonal)
	architectureRename: {
		from: 'hexarchy',
		to: 'heptagonal',
		note: 'hexarchy is sparse (4 layers), heptagonal is complete (9 layers)',
	},

	// Phase 4: Consolidate AI agents
	agentConsolidation: {
		primary: 'heptagonal/2-intelligence/ai-services/agents',
		duplicates: ['frameworks/ai/agents'],
	},

	// Phase 5: Fix broken symlinks
	symlinkFixes: ['_tooling/codegpt', '_tooling/kiro', '_tooling/pm2'],
};

function analyzeFile(filePath) {
	try {
		const stats = fs.statSync(filePath);
		const content = fs.readFileSync(filePath, 'utf8');
		return {
			size: stats.size,
			lines: content.split('\n').length,
			modified: stats.mtime,
			hash: content.substring(0, 100),
		};
	} catch (err) {
		return null;
	}
}

function findDuplicateHTMLFiles() {
	const htmlFiles = {};
	const dirs = [
		'apps/frontend/html-pages',
		'apps/frontend/public',
		'src/frontend/pages',
		'heptagonal/4-interface/ui/pages',
	];

	dirs.forEach((dir) => {
		const fullPath = path.join(ROOT, dir);
		if (!fs.existsSync(fullPath)) return;

		const files = fs.readdirSync(fullPath).filter((f) => f.endsWith('.html'));
		files.forEach((file) => {
			if (!htmlFiles[file]) htmlFiles[file] = [];
			htmlFiles[file].push({
				path: path.join(dir, file),
				info: analyzeFile(path.join(fullPath, file)),
			});
		});
	});

	return Object.entries(htmlFiles).filter(([_, locations]) => locations.length > 1);
}

function generateCleanupReport() {
	console.log('🔍 HOOTNER DUPLICATE CLEANUP ANALYSIS\n');
	console.log('=' .repeat(60));

	// Find duplicate HTML files
	const duplicates = findDuplicateHTMLFiles();
	console.log(`\n📄 DUPLICATE HTML FILES: ${duplicates.length} files with multiple copies\n`);

	duplicates.forEach(([filename, locations]) => {
		console.log(`\n${filename}:`);
		locations.forEach((loc) => {
			if (loc.info) {
				console.log(
					`  - ${loc.path} (${loc.info.lines} lines, ${new Date(loc.info.modified).toLocaleDateString()})`
				);
			}
		});
	});

	// Architecture conflicts
	console.log('\n\n🏗️  ARCHITECTURE CONFLICTS:\n');
	console.log('  ❌ hexarchy/ - Sparse (4 layers: 3,4,5,7)');
	console.log('  ✅ heptagonal/ - Complete (9 layers: 0-8)');
	console.log('  ⚠️  Documentation references hexarchy/ but should use heptagonal/');

	// Broken symlinks
	console.log('\n\n🔗 BROKEN SYMLINKS:\n');
	CLEANUP_PLAN.symlinkFixes.forEach((link) => {
		const fullPath = path.join(ROOT, link);
		const exists = fs.existsSync(fullPath);
		console.log(`  ${exists ? '✅' : '❌'} ${link}`);
	});

	// Cleanup recommendations
	console.log('\n\n📋 CLEANUP PLAN:\n');
	console.log('Phase 1: Remove archive backups');
	console.log(`  → Delete: ${CLEANUP_PLAN.archiveCleanup.join(', ')}`);
	console.log(`\nPhase 2: Consolidate frontend pages`);
	console.log(`  → Keep: ${CLEANUP_PLAN.frontendConsolidation.primary}`);
	console.log(`  → Remove: ${CLEANUP_PLAN.frontendConsolidation.duplicates.join(', ')}`);
	console.log(`\nPhase 3: Rename hexarchy → heptagonal in docs`);
	console.log(`  → Update: .github/copilot-instructions.md, README.md, docs/`);
	console.log(`\nPhase 4: Consolidate AI agents`);
	console.log(`  → Keep: ${CLEANUP_PLAN.agentConsolidation.primary}`);
	console.log(`  → Remove: ${CLEANUP_PLAN.agentConsolidation.duplicates.join(', ')}`);
	console.log(`\nPhase 5: Remove broken symlinks`);
	console.log(`  → Delete: ${CLEANUP_PLAN.symlinkFixes.join(', ')}`);

	console.log('\n\n💾 ESTIMATED SPACE SAVINGS:\n');
	const archiveSize = getDirectorySize(
		path.join(ROOT, 'apps/frontend/html-pages/_archive')
	);
	console.log(`  Archive cleanup: ~${(archiveSize / 1024).toFixed(2)} KB`);
	console.log(`  Duplicate pages: ~${duplicates.length * 50} KB (estimated)`);
	console.log(`  Total savings: ~${((archiveSize + duplicates.length * 50000) / 1024).toFixed(2)} KB`);

	console.log('\n\n⚠️  SAFETY NOTES:\n');
	console.log('  1. Backup before running cleanup');
	console.log('  2. Run tests after each phase');
	console.log('  3. Update import paths in code');
	console.log('  4. Commit after each phase');

	console.log('\n\n🚀 TO EXECUTE CLEANUP:\n');
	console.log('  node scripts/cleanup-duplicates.js --execute');
	console.log('\n' + '='.repeat(60) + '\n');
}

function getDirectorySize(dirPath) {
	if (!fs.existsSync(dirPath)) return 0;
	let size = 0;
	try {
		const files = fs.readdirSync(dirPath);
		files.forEach((file) => {
			const filePath = path.join(dirPath, file);
			const stats = fs.statSync(filePath);
			if (stats.isDirectory()) {
				size += getDirectorySize(filePath);
			} else {
				size += stats.size;
			}
		});
	} catch (err) {
		// Ignore errors
	}
	return size;
}

function executeCleanup() {
	console.log('🚨 EXECUTING CLEANUP - THIS WILL DELETE FILES!\n');
	console.log('Press Ctrl+C within 5 seconds to cancel...\n');

	setTimeout(() => {
		console.log('Starting cleanup...\n');

		// Phase 1: Remove archives
		console.log('Phase 1: Removing archive backups...');
		CLEANUP_PLAN.archiveCleanup.forEach((dir) => {
			const fullPath = path.join(ROOT, dir);
			if (fs.existsSync(fullPath)) {
				fs.rmSync(fullPath, { recursive: true, force: true });
				console.log(`  ✅ Deleted: ${dir}`);
			}
		});

		console.log('\n✅ Cleanup Phase 1 complete!');
		console.log('\n⚠️  Manual steps required for remaining phases:');
		console.log('  - Review duplicate files before deletion');
		console.log('  - Update import paths in code');
		console.log('  - Run tests after each phase');
	}, 5000);
}

// Main execution
const args = process.argv.slice(2);
if (args.includes('--execute')) {
	executeCleanup();
} else {
	generateCleanupReport();
}
