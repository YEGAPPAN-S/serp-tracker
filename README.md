# 📊 SERP Rank Tracker - Final Version

**Professional SERP tracking for marketers • Generates HTML reports**

---

## ✨ What This Does

Tracks your website rankings in Google search across multiple countries and generates a **beautiful HTML table report** that opens in a new tab.

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Extract Files
- Unzip `serp-tracker.zip`
- Place in a permanent location

### Step 2: Load Extension
1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (top-right toggle)
4. Click "Load unpacked"
5. Select the `serp-tracker` folder
6. Done!

---

## 📖 How to Use

1. **Click extension icon** in Chrome toolbar
2. **Select website** from dropdown (8 pre-configured sites)
3. **Enter keywords** (1-10, one per line)
4. **Check countries** (1-5 countries)
5. **Select search depth** (Top 10 to Top 100)
6. **Click "Check Rankings"**
7. **Wait** (~30-60 seconds)
8. **View HTML report** in new tab automatically!

---

## 🎯 Your 8 Websites

- 🛒 Flycart (flycart.org)
- 📧 Retainful (retainful.com)
- 🎁 WPLoyalty (wployalty.net)
- ⬆️ UpsellWP (upsellwp.com)
- ✨ SparkEditor (sparkeditor.com)
- 🤝 Afflr (afflr.io)
- 🔄 Relay (wprelay.com)
- 🎯 Yuko (yuko.so)

---

## 🌍 Countries Supported

- 🇺🇸 United States
- 🇬🇧 United Kingdom
- 🇨🇦 Canada
- 🇮🇳 India
- 🇩🇪 Germany

---

## 🎨 HTML Report Features

Your report opens in a new tab with:

### Header:
- Website name and domain
- Generation timestamp

### Statistics Cards:
- Total keywords checked
- Total checks performed
- Number of found rankings
- Average position

### Results Table:
- **Keyword** column
- **Found** status (✓ Yes / ✗ No)
- **Positions by Country** with color-coded badges:
  - 🟢 Green (#1-3) - Excellent!
  - 🟢 Light Green (#4-10) - Great!
  - 🟡 Yellow (#11-20) - Good
  - 🟠 Orange (#21-50) - Fair
  - 🔴 Pink (#51-100) - Needs work
  - ⚪ Gray - Not found
- **Page Details** with title and clickable URL

---

## ⚙️ Search Depth Options

- **Top 10** - Fastest (checks first page only)
- **Top 20** - First 2 pages
- **Top 30** - First 3 pages
- **Top 50** - First 5 pages
- **Top 100** - Most comprehensive (recommended)

---

## 💡 Best Practices

### For Accurate Results:
- ✅ Use incognito mode for unbiased results
- ✅ Check during off-peak hours (2am-6am or 2pm-4pm)
- ✅ Wait 5 minutes between runs
- ✅ Check max 10 keywords per run
- ✅ Compare week-over-week trends

### Timing Estimates:
- 1 keyword × 1 country = ~30 seconds
- 5 keywords × 2 countries = ~2 minutes
- 10 keywords × 5 countries = ~8 minutes

---

## 🛠️ Troubleshooting

### Extension won't load?
- Make sure "Developer mode" is enabled
- Check all files are in the folder
- Try restarting Chrome

### Takes too long?
- Normal! Each check needs 3-4 seconds
- Reduce search depth to Top 30 or Top 50
- Check fewer keywords/countries

### Shows incorrect positions?
- Make sure domain is exact (no www or https)
- Increase search depth to Top 100
- Use incognito mode

### Report doesn't open?
- Check popup blocker settings
- Make sure Chrome can open local files
- Look for the tab - it opens automatically

---

## 📊 Example Usage

```
Website: Flycart
Keywords:
  woocommerce checkout plugin
  cart abandonment
  woocommerce upsell

Countries: 🇺🇸 USA, 🇬🇧 UK
Search Depth: Top 100

Result: Opens HTML report showing:
- woocommerce checkout plugin: 🇺🇸 #7, 🇬🇧 #12
- cart abandonment: 🇺🇸 #15, 🇬🇧 Not Found
- woocommerce upsell: 🇺🇸 #23, 🇬🇧 #18
```

---

## 🔒 Privacy

- ✅ **No data collection** - Everything runs locally
- ✅ **No external servers** - Just you and Google
- ✅ **No tracking** - Complete privacy
- ✅ **Results in your browser** - HTML files you control

---

## 📁 File Structure

```
serp-tracker-final/
├── manifest.json         # Extension config
├── popup.html            # User interface
├── popup.js              # Main logic
├── background.js         # Ranking checker
├── content.js            # Search page script
├── styles.css            # Styling
├── icons/
│   ├── icon.png       # Toolbar icon # Extension icon # Store icon
│   ├── favicon.ico    # Result page Fav Icon
└── README.md            # This file
```

---

## 💯 Key Features

- ✅ **8 pre-configured websites** (dropdown selection)
- ✅ **5 countries** (checkbox selection)
- ✅ **Up to 10 keywords** per check
- ✅ **Up to 100 results** (multi-page scraping)
- ✅ **HTML report** (opens in new tab)
- ✅ **Color-coded badges** (instant visual feedback)
- ✅ **Professional design** (marketer-friendly)
- ✅ **No Google Sheets** (simple HTML output)
- ✅ **No configuration** (just install and use)

---

## 🎯 Perfect For

- SEO managers tracking keyword performance
- Content marketers finding opportunities
- Agency teams doing client reports
- Solo marketers on a budget
- Anyone tracking rankings for 8 specific websites

---

## 🆘 Need Help?

### Common Questions:

**Q: Can I add more websites?**
A: Yes, edit `popup.html` line 25-32 to add your domains.

**Q: Why does it take so long?**
A: We add delays to avoid Google blocking. This is normal and necessary.

**Q: Can I export the report?**
A: Yes! In the report, press Ctrl+P and save as PDF.

**Q: Does it work in other browsers?**
A: Only Chrome (uses Chrome Extension API).

**Q: Will Google block me?**
A: No, if you follow best practices (5-10 keywords, wait between runs).

---

## 📝 Version Info

- **Version:** 1.0.0 Final
- **Release:** November 2025
- **Built for:** Marketers tracking specific websites
- **Output:** HTML reports (no Google Sheets required)

---

## 🎉 You're Ready!

1. ✅ Install extension
2. ✅ Select website
3. ✅ Enter keywords
4. ✅ Check countries
5. ✅ Click "Check Rankings"
6. ✅ Get HTML report!

**No configuration. No complexity. Just results.** 🚀
