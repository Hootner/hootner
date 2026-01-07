#!/usr/bin/env python3
import os
import json
import hashlib
import shutil
from datetime import datetime

class VersionControl:
    def __init__(self, repo_dir='.vcs'):
        self.repo_dir = repo_dir
        self.commits_dir = os.path.join(repo_dir, 'commits')
        self.head_file = os.path.join(repo_dir, 'HEAD')
        
        if not os.path.exists(repo_dir):
            os.makedirs(self.commits_dir)
            self.write_head('main')
    
    def write_head(self, commit_id):
        with open(self.head_file, 'w') as f:
            f.write(commit_id)
    
    def read_head(self):
        if os.path.exists(self.head_file):
            with open(self.head_file) as f:
                return f.read().strip()
        return None
    
    def hash_file(self, filepath):
        with open(filepath, 'rb') as f:
            return hashlib.md5(f.read()).hexdigest()
    
    def commit(self, message, files):
        commit_id = hashlib.md5(str(datetime.now()).encode()).hexdigest()[:8]
        commit_dir = os.path.join(self.commits_dir, commit_id)
        os.makedirs(commit_dir)
        
        commit_data = {
            'id': commit_id,
            'message': message,
            'timestamp': str(datetime.now()),
            'parent': self.read_head(),
            'files': {}
        }
        
        for filepath in files:
            if os.path.exists(filepath):
                file_hash = self.hash_file(filepath)
                dest = os.path.join(commit_dir, os.path.basename(filepath))
                shutil.copy2(filepath, dest)
                commit_data['files'][filepath] = file_hash
        
        with open(os.path.join(commit_dir, 'commit.json'), 'w') as f:
            json.dump(commit_data, f, indent=2)
        
        self.write_head(commit_id)
        print(f"✓ Committed {commit_id}: {message}")
        return commit_id
    
    def log(self):
        commit_id = self.read_head()
        
        while commit_id and commit_id != 'main':
            commit_file = os.path.join(self.commits_dir, commit_id, 'commit.json')
            if not os.path.exists(commit_file):
                break
            
            with open(commit_file) as f:
                commit = json.load(f)
            
            print(f"commit {commit['id']}")
            print(f"Date: {commit['timestamp']}")
            print(f"    {commit['message']}\n")
            
            commit_id = commit.get('parent')

# Test
vcs = VersionControl()

# Create test files
with open('test1.txt', 'w') as f:
    f.write('Hello VCS')

vcs.commit('Initial commit', ['test1.txt'])
vcs.commit('Second commit', ['test1.txt'])
vcs.log()
