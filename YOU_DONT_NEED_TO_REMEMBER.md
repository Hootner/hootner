# You Don't Need to Remember!

## The System Does It For You:

### ✅ Automatic (You Do Nothing):

1. **Pre-commit hook** - Blocks duplicates when you try to commit
2. **CI/CD** - Blocks bad PRs automatically  
3. **AI agents** - Read rules automatically before every action

### 🎯 What You Actually Do:

**Just code normally!**

If you try to create a duplicate:
- Pre-commit hook stops you
- Shows you what's wrong
- You fix it, commit again
- Done!

### 📝 Only 1 Thing to Remember:

**HTML pages go in:** `apps/frontend/html-pages/`

That's it. Everything else is automated.

---

## If You Forget Even That:

The pre-commit hook will remind you:

```bash
git commit -m "add page"
# ❌ DUPLICATE FILES DETECTED:
#   dashboard.html:
#     - apps/frontend/html-pages/dashboard.html
#     - src/frontend/pages/dashboard.html
# 
# 💡 Fix: Delete duplicates, keep only one in apps/frontend/html-pages/
```

**The system tells you exactly what to do!**

---

## TL;DR

**You:** Code normally  
**System:** Prevents mistakes automatically  
**Result:** No duplicates, ever

**Zero mental overhead. Zero things to remember.**
