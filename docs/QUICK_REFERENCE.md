# 🦉 HOOTNER Quick Reference

## First Time Setup (30 seconds)

```bash
npm install
npm run aws:onboard    # Pick "Local Mode" for no AWS
npm run start:all      # Start everything
```

Visit: http://localhost:3000

---

## Common Commands

### Starting & Stopping
| Command | What it does |
|---------|-------------|
| `npm run start:all` | Start everything (easiest!) |
| `npm run dev` | Start with auto-reload |
| `npm run start:platform` | Full platform with all services |
| Ctrl+C | Stop everything |

### AWS Commands  
| Command | What it does |
|---------|-------------|
| `npm run aws:onboard` | Setup wizard (super beginner-friendly!) |
| `npm run aws:status` | Check AWS connection & account info |
| `npm run aws:check` | Quick credential verification |
| `npm run aws:deploy` | Deploy to AWS cloud |

### Development
| Command | What it does |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run lint` | Check code quality |
| `npm run lint:fix` | Auto-fix code issues |
| `npm run format` | Format code nicely |

---

## AWS Modes Explained

### 🏠 Local Mode (No AWS)
- Everything on your computer
- **Cost:** $0
- **Best for:** Learning, development, building features
- **Setup:** 30 seconds

```bash
npm run aws:onboard
# Choose option 1 (Local Mode)
```

### ☁️ AWS Mode
- Real cloud infrastructure  
- **Cost:** ~$0-5/month (free tier)
- **Best for:** Testing with real users, pre-production
- **Setup:** 5-10 minutes with wizard

```bash
npm run aws:onboard
# Choose option 2 (AWS Mode)
# Wizard guides you step-by-step
```

---

## Switching AWS Accounts

```bash
# Using profiles (recommended)
aws configure --profile myaccount
export AWS_PROFILE=myaccount
npm run aws:status  # Verify switch

# Using wizard
npm run aws:onboard  # Walk through setup again
```

After switching:
```bash
npm run aws:deploy  # Deploy to new account
npm run db:setup    # Setup databases
```

---

## Important URLs

| Service | Local URL | What it is |
|---------|-----------|-----------|
| Frontend | http://localhost:3000 | Main app |
| GraphQL API | http://localhost:4000/graphql | API playground |
| Video Service | http://localhost:5003 | Video generation |
| DynamoDB | http://localhost:8000 | Local database |
| Dashboard | http://localhost:9000/dashboard | Monitoring |

---

## Troubleshooting

### ❌ "AWS CLI not found"
```bash
npm run aws:onboard  # Wizard helps install it
```

### ❌ "Cannot connect to AWS"  
```bash
npm run aws:status    # Check what's wrong
npm run aws:onboard   # Re-configure
```

### ❌ "Port already in use"
```bash
npx kill-port 3000 4000 5000 8000
```

### ❌ "npm install failed"
```bash
rm -rf node_modules package-lock.json
npm install
```

### ❌ Still stuck?
1. Read: [docs/AWS_FOR_BEGINNERS.md](AWS_FOR_BEGINNERS.md)
2. Check: [docs/DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)
3. Ask: Open a GitHub issue

---

## AWS Cost Protection

**Set spending limits:**
1. AWS Console → Billing → Budgets
2. Create budget: $5 monthly
3. Get email if you exceed it

**Check costs:**
- AWS Console → Billing Dashboard
- Shows current month costs
- Usually $0 with free tier

---

## Pro Tips

💡 **Start local, deploy later** - No need for AWS until you're ready

💡 **Use profiles** - Easier to manage multiple AWS accounts

💡 **Set billing alerts** - Never get surprised by AWS costs

💡 **Read the docs** - [docs/AWS_FOR_BEGINNERS.md](AWS_FOR_BEGINNERS.md) has everything

💡 **The wizard is your friend** - `npm run aws:onboard` guides you through everything

---

## Need Help?

| Question | Resource |
|----------|----------|
| Never used AWS? | [docs/AWS_FOR_BEGINNERS.md](AWS_FOR_BEGINNERS.md) |
| First day with HOOTNER? | [docs/DAY_ONE.md](DAY_ONE.md) |
| How does it work? | [docs/ARCHITECTURE_DIAGRAM.md](ARCHITECTURE_DIAGRAM.md) |
| API documentation? | [docs/API.md](API.md) |
| All documentation? | [docs/DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) |

---

## Remember

✅ **You don't need AWS to start** - Local mode works great!

✅ **The wizard handles everything** - Just run `npm run aws:onboard`

✅ **Switching accounts is easy** - It's just configuration

✅ **Costs are low** - Free tier covers most development

✅ **Help is available** - Docs are beginner-friendly

**Happy coding! 🦉**
