#!/usr/bin/env node

/**
 * Delete all GitHub workflow runs
 * Requires: GITHUB_TOKEN environment variable
 */

const OWNER = 'Hootner';
const REPO = 'hootner';
const TOKEN = process.env.GITHUB_TOKEN;

if (!TOKEN) {
  console.error('❌ GITHUB_TOKEN environment variable required');
  console.log('Create token at: https://github.com/settings/tokens');
  console.log('Required scope: repo (full control)');
  process.exit(1);
}

async function deleteAllRuns() {
  console.log('🗑️  Deleting all workflow runs...\n');
  
  let page = 1;
  let deleted = 0;

  while (true) {
    const response = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/actions/runs?per_page=100&page=${page}`,
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Accept': 'application/vnd.github+json'
        }
      }
    );

    const data = await response.json();
    
    if (!data.workflow_runs || data.workflow_runs.length === 0) {
      break;
    }

    for (const run of data.workflow_runs) {
      try {
        const delResponse = await fetch(
          `https://api.github.com/repos/${OWNER}/${REPO}/actions/runs/${run.id}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${TOKEN}`,
              'Accept': 'application/vnd.github+json'
            }
          }
        );

        if (delResponse.status === 204) {
          deleted++;
          console.log(`✅ Deleted run #${run.id} (${run.name})`);
        }
      } catch (error) {
        console.error(`❌ Failed to delete run #${run.id}`);
      }
    }

    page++;
  }

  console.log(`\n✅ Deleted ${deleted} workflow runs`);
}

deleteAllRuns().catch(console.error);
