/** Max chars for JD body inside Slack message (Slack hard limit ~40k). */
const JD_REPORT_MAX = 3500;

const SLACK_CHAT_POST = "https://slack.com/api/chat.postMessage";

/**
 * Env (server only), in priority order:
 * 1) SLACK_BOT_TOKEN + SLACK_CHANNEL_ID — Slack Web API `chat.postMessage` (bot `xoxb-…`).
 * 2) SLACK_BOT_URL or SLACK_WEBHOOK_URL — Incoming Webhook (optional SLACK_CHANNEL_ID in body when supported).
 */

/**
 * First N lines, ellipsis, last M lines of the **full** JD (split on newlines first).
 * A previous bug clipped by character *before* splitting, so "last 3 lines" were really the
 * end of the truncated prefix (~3500 chars), not the real job posting tail.
 * If the final snippet still exceeds JD_REPORT_MAX (very long lines), it is clipped once at the end.
 */
export function formatJdPreview(jd, firstLines = 3, lastLines = 3) {
  const text = String(jd || "").trim();
  if (!text) return "(empty)";

  const lines = text.split(/\r?\n/);

  let out;
  if (lines.length <= firstLines + lastLines) {
    out = lines.join("\n");
  } else {
    const head = lines.slice(0, firstLines).join("\n");
    const tail = lines.slice(-lastLines).join("\n");
    out = `${head}\n…\n${tail}`;
  }

  if (out.length > JD_REPORT_MAX) {
    return `${out.slice(0, JD_REPORT_MAX)}…`;
  }
  return out;
}

function slackWebhookUrl() {
  return (process.env.SLACK_BOT_URL || process.env.SLACK_WEBHOOK_URL || "").trim();
}

async function sendViaBotToken(token, channel, messageText) {
  const res = await fetch(SLACK_CHAT_POST, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      channel,
      text: messageText,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!data.ok) {
    console.error("[slack-report] chat.postMessage", data.error || res.status, JSON.stringify(data).slice(0, 500));
  }
}

async function sendViaWebhook(url, messageText, channelOverride) {
  const payload = { text: messageText };
  if (channelOverride) payload.channel = channelOverride;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    console.error("[slack-report] webhook HTTP", res.status, errBody.slice(0, 500));
  }
}

/**
 * Posts a success-only PDF summary to Slack (bot token preferred, else Incoming Webhook).
 */
export async function sendSlackPdfSuccessReport({ fileName, aiAgent, promptId, jd }) {
  const jdBlock = formatJdPreview(jd).replace(/```/g, "'''");
  const messageText = [
    "*PDF generated (success)*",
    `*FileName:* ${fileName}`,
    `*AI Agent:* ${aiAgent}`,
    `*Prompt:* ${promptId || "—"}`,
    "*JD:*",
    "```",
    jdBlock,
    "```",
  ].join("\n");

  const token = (process.env.SLACK_BOT_TOKEN || "").trim();
  const channel = (process.env.SLACK_CHANNEL_ID || "").trim();
  const webhook = slackWebhookUrl();

  try {
    if (token) {
      if (!channel) {
        console.error("[slack-report] SLACK_CHANNEL_ID is required when SLACK_BOT_TOKEN is set");
        return;
      }
      await sendViaBotToken(token, channel, messageText);
      return;
    }
    if (webhook) {
      await sendViaWebhook(webhook, messageText, channel || undefined);
    }
  } catch (e) {
    console.error("[slack-report]", e?.message || e);
  }
}
