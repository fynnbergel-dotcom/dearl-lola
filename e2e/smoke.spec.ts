import { expect, test } from "@playwright/test";

test("a Lola gets a compliment and can save it", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("We’ve been expecting you");

  await page.getByPlaceholder("What's your name?").fill("Lolá");
  await page.getByRole("button", { name: /come in/i }).click();

  await expect(page.getByRole("heading", { name: /how’s today treating you/i })).toBeVisible();
  await page.getByRole("radio", { name: /tired/i }).click();
  await page
    .getByRole("radio", { name: /poetic/i })
    .first()
    .click();
  await page.getByRole("button", { name: /make my day/i }).click();

  const card = page.locator("article blockquote");
  await expect(card).not.toBeEmpty({ timeout: 15_000 });
  const save = page.getByRole("button", { name: /^save$/i });
  await expect(save).toBeEnabled({ timeout: 15_000 });
  const first = (await card.innerText()).trim();
  expect(first.length).toBeGreaterThan(20);

  await save.click();
  await expect(page.getByRole("button", { name: /^saved$/i })).toHaveAttribute("aria-pressed", "true");

  // Another one should never repeat the previous compliment.
  await page.getByRole("button", { name: /another one/i }).click();
  await expect(save).toBeEnabled({ timeout: 15_000 });
  expect((await card.innerText()).trim()).not.toBe(first);

  // It shows up in the collection.
  await page.getByRole("link", { name: /collection/i }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Lola’s Collection");
  await expect(page.getByText(first)).toBeVisible();
});

test("non-Lolas are welcomed as honorary Lolas", async ({ page }) => {
  await page.goto("/");
  await page.getByPlaceholder("What's your name?").fill("sam");
  await page.getByRole("button", { name: /come in/i }).click();
  await expect(page.getByText(/reserved for Lolas/i)).toBeVisible();
  await page.getByRole("button", { name: /accept the title/i }).click();
  await expect(page.getByText(/honorary lola, sam/i)).toBeVisible();
});

test("returning visitors are welcomed back", async ({ page }) => {
  await page.goto("/");
  await page.getByPlaceholder("What's your name?").fill("Lola");
  await page.getByRole("button", { name: /come in/i }).click();
  await expect(page.getByRole("heading", { name: /how’s today treating you/i })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Welcome back, Lola");
});

test("API validates input and streams a fallback without a key", async ({ request }) => {
  const bad = await request.post("/api/compliment", { data: { name: "", timeOfDay: "noon" } });
  expect(bad.status()).toBe(400);

  const ok = await request.post("/api/compliment", {
    data: { name: "Lola", style: "funny", timeOfDay: "morning" },
  });
  expect(ok.status()).toBe(200);
  expect(ok.headers()["x-compliment-source"]).toBe("fallback");
  expect((await ok.text()).length).toBeGreaterThan(20);
});

test("share page renders and OG image is generated", async ({ page, request }) => {
  await page.goto("/share?c=You%20make%20rooms%20warmer.&s=heartfelt");
  await expect(page.getByText("You make rooms warmer.")).toBeVisible();
  const og = await request.get("/api/og?c=You%20make%20rooms%20warmer.&s=heartfelt");
  expect(og.status()).toBe(200);
  expect(og.headers()["content-type"]).toContain("image/png");
});
