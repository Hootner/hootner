#!/usr/bin/env node

/**
 * HOOTNER Immediate Safe Cleanup
 * Phase 1: Remove archives and broken symlinks (SAFE - no functional impact)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

console.log('🧹 HOOTNER IMMEDIATE SAFE CLEANUP\n');
console.log('This will remove:');
console.log('  1. Archive backups (apps/frontend/html-pages/_archive)');
console.log('  2. Broken symlinks (_tooling/codegpt, kiro, pm2)');
console.log('\n⚠️  This is SAFE - no functional code will be affected\n');

const itemsToRemove = [
	'apps/frontend/html-pages/_archive',
	'_tooling/codegpt',
	'_tooling/kiro',
	'_tooling/pm2',
];

let totalSize = 0;
let removedCount = 0;

itemsToRemove.forEach((item) => {
	const fullPath = path.join(ROOT, item);
	if (fs.existsSync(fullPath)) {
		try {
			const stats = fs.statSync(fullPath);
			if (stats.isDirectory()) {
				const size = getDirectorySize(fullPath);
				totalSize += size;
				fs.rmSync(fullPath, { recursive: true, force: true });
				console.log(`✅ Removed: ${item} (${(size / 1024).toFixed(2)} KB)`);
			} else {
				fs.unlinkSync(fullPath);
				console.log(`✅ Removed: ${item}`);
			}
			removedCount++;
		} catch (err) {
			console.log(`❌ Failed to remove ${item}: ${err.message}`);
		}
	} else {
		console.log(`⏭️  Skipped: ${item} (doesn't exist)`);
	}
});

console.log(`\n✅ Cleanup complete!`);
console.log(`   Removed: ${removedCount} items`);
console.log(`   Space freed: ${(totalSize / 1024).toFixed(2)} KB`);
console.log(`\n📋 Next steps:`);
console.log(`   1. Review: docs/CLEANUP_PLAN.md`);
console.log(`   2. Run: node scripts/cleanup-duplicates.js`);
console.log(`   3. Commit: git add -A && git commit -m "chore: remove archives and broken symlinks"`);

function getDirectorySize(dirPath) {
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
