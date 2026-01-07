# TODO Tree Manager

Minimal Python CLI tool for managing hierarchical TODO lists in plain text.

## Features

- **Tree View**: Pretty-print hierarchical tasks with box-drawing characters
- **Toggle Done**: Mark tasks complete with `[x]` or incomplete with `[ ]`
- **Search**: Find tasks by keyword across the entire tree
- **Plain Text**: No databases, just simple indented text files

## Usage

### View the TODO tree
```bash
node tools/todo-tree.cjs todo-tree.txt show
```

### Mark a task as done (or toggle back to incomplete)
```bash
node tools/todo-tree.cjs todo-tree.txt done "rate limiting"
```

### Search for tasks
```bash
node tools/todo-tree.cjs todo-tree.txt search "security"
```

## File Format

Use 4-space indentation for hierarchy:

```
Main Task [ ]
    Subtask 1 [ ]
    Subtask 2 [x]
        Sub-subtask [ ]
Another Main Task [x]
```

- `[ ]` = incomplete
- `[x]` = complete

## Integration with HOOTNER

This tool complements the existing TODO tracking system:

- **TODO_REPORT.md**: Auto-generated from code comments (368 items)
- **todo-tree.txt**: Manual high-level project planning
- **scripts/scan-todos.js**: Scans codebase for TODO comments

## Why This Tool?

- **Lightweight**: 80 lines of Node.js, no dependencies
- **Fast**: Instant startup, works offline
- **Simple**: Plain text = version control friendly
- **Flexible**: Easy to customize for your workflow
- **Cross-platform**: Works on Windows, Mac, Linux

## Examples

```bash
# View all tasks
node tools/todo-tree.cjs todo-tree.txt show

# Mark security task done
node tools/todo-tree.cjs todo-tree.txt done "CSRF"

# Find all frontend tasks
node tools/todo-tree.cjs todo-tree.txt search "frontend"
```

## Tips

- Keep todo-tree.txt for high-level planning
- Use TODO comments in code for implementation details
- Run `npm run todos:scan` to generate TODO_REPORT.md from code
- Commit todo-tree.txt to track project progress
