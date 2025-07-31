const express = require("express");
const puppeteer = require("puppeteer");
const app = express();
app.use(express.json());

app.post("/comment", async (req, res) => {
  const { videoUrl, comment } = req.body;
  if (!videoUrl || !comment) {
    return res.status(400).json({ error: "Missing videoUrl or comment" });
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  try {
    const page = await browser.newPage();
    await page.goto(videoUrl, { waitUntil: "networkidle2" });
    await page.waitForSelector('[data-e2e="comment-section"]', { timeout: 10000 });
    await page.click('[data-e2e="comment-section"]');
    await page.waitForSelector('div.public-DraftEditor-content');
    await page.click('div.public-DraftEditor-content');
    await page.keyboard.type(comment);
    await page.keyboard.press("Enter");
    await browser.close();
    res.json({ status: "success", message: "Comment sent!" });
  } catch (err) {
    await browser.close();
    res.status(500).json({ error: err.toString() });
  }
});

app.get("/", (req, res) => {
  res.send("TikTok Comment Bot is running!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server ready at http://localhost:${PORT}`));
