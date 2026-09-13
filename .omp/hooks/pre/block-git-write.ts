import type { HookAPI } from "@oh-my-pi/pi-coding-agent/extensibility/hooks";

/**
 * Blocks `git commit` / `git push` invoked through the `bash` tool unless a human
 * explicitly confirms it in an interactive UI session. In a session without UI
 * (subagent, `--print`, non-interactive dispatch) it always blocks — there is no one
 * to ask, and the repo rule (.omp/AGENTS.md) is "never without an explicit ask".
 *
 * Scope and honest limits (found by an independent audit, 2026-09-12): this is a
 * best-effort backstop for the realistic case — an agent running `git commit`/`git push`
 * directly, chained (&&/;/|), with -C/-c/--git-dir flags, or through a configured git
 * alias whose expansion contains commit/push. It also unwraps one level of `$(...)`/
 * backtick command substitution and `eval "..."`/`bash -c "..."` (and sh/zsh/dash/ksh -c)
 * so a write hidden behind those doesn't slip through. It is NOT a shell sandbox: an agent
 * deliberately obfuscating further (e.g. base64-decoding a command, writing a script file
 * and executing it, or a git alias configured with `!` shell-out logic this hook doesn't
 * parse) can still get around it. The real guarantee is the model's own contract
 * (.omp/AGENTS.md); this hook is the seatbelt for the common/accidental case, not a cage.
 */

const SEPARATOR = /&&|\|\||;|\||\n/;
const MAX_RECURSION_DEPTH = 4;

function splitOnShellSeparators(command: string): string[] {
  const segments: string[] = [];
  let current = "";
  let quote: '"' | "'" | null = null;

  for (let i = 0; i < command.length; i++) {
    const char = command[i];

    if (quote) {
      current += char;
      if (char === quote) quote = null;
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      current += char;
      continue;
    }

    const rest = command.slice(i);
    const match = rest.match(new RegExp(`^(?:${SEPARATOR.source})`));
    if (match) {
      segments.push(current);
      current = "";
      i += match[0].length - 1;
      continue;
    }

    current += char;
  }

  segments.push(current);
  return segments;
}

/** Extracts the inner text of `$(...)` (paren-balanced) and `` `...` `` substitutions. */
function extractSubstitutions(text: string): string[] {
  const found: string[] = [];

  for (let i = 0; i < text.length - 1; i++) {
    if (text[i] === "$" && text[i + 1] === "(") {
      let depth = 1;
      let j = i + 2;
      while (j < text.length && depth > 0) {
        if (text[j] === "(") depth++;
        else if (text[j] === ")") depth--;
        j++;
      }
      found.push(text.slice(i + 2, depth === 0 ? j - 1 : j));
      i = j - 1;
    }
  }

  const backtickRe = /`([^`]*)`/g;
  let match: RegExpExecArray | null;
  while ((match = backtickRe.exec(text))) found.push(match[1]);

  return found;
}

/** Extracts the quoted argument of `eval "..."` and `(bash|sh|zsh|dash|ksh) -c "..."`. */
function extractShellStrings(text: string): string[] {
  const found: string[] = [];
  const evalRe = /\beval\s+(['"])([\s\S]*?)\1/g;
  const dashCRe = /\b(?:bash|sh|zsh|dash|ksh)\s+-c\s+(['"])([\s\S]*?)\1/g;
  let match: RegExpExecArray | null;
  while ((match = evalRe.exec(text))) found.push(match[2]);
  while ((match = dashCRe.exec(text))) found.push(match[2]);
  return found;
}

let cachedAliasSubcommands: Set<string> | null = null;

/** Best-effort: git aliases (`git config --get-regexp '^alias\.'`) whose expansion commits/pushes. */
function getGitAliasSubcommands(): Set<string> {
  if (cachedAliasSubcommands) return cachedAliasSubcommands;
  const result = new Set<string>();
  try {
    const proc = Bun.spawnSync(["git", "config", "--get-regexp", "^alias\\."]);
    const out = proc.stdout.toString("utf8");
    for (const line of out.split("\n")) {
      const match = line.match(/^alias\.(\S+)\s+(.*)$/);
      if (!match) continue;
      const [, name, expansion] = match;
      if (/(?:^|[\s!])(?:commit|push)\b/.test(expansion)) result.add(name);
    }
  } catch {
    // git unavailable or no aliases configured; alias detection is best-effort only.
  }
  cachedAliasSubcommands = result;
  return result;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildGitWritePattern(): RegExp {
  const aliasNames = [...getGitAliasSubcommands()].map(escapeRegExp);
  const subcommands = ["commit", "push", ...aliasNames].join("|");
  return new RegExp(
    `^(?:\\S+=\\S+\\s+)*(?:command\\s+)?(?:\\./)?git\\s+` +
      `(?:(?:-C|-c|--git-dir|--work-tree)(?:=\\S+|\\s+\\S+)?\\s+|--\\S+\\s+)*` +
      `(?:--\\s+)?(${subcommands})\\b`,
  );
}

function findGitWriteCommand(command: string, depth = 0): string | null {
  if (depth > MAX_RECURSION_DEPTH) return null;
  const pattern = buildGitWritePattern();

  for (const segment of splitOnShellSeparators(command)) {
    const trimmed = segment.trim();
    if (pattern.test(trimmed)) return trimmed;

    for (const inner of [...extractSubstitutions(trimmed), ...extractShellStrings(trimmed)]) {
      const nested = findGitWriteCommand(inner, depth + 1);
      if (nested) return nested;
    }
  }

  return null;
}

export default function (pi: HookAPI): void {
  pi.on("tool_call", async (event, ctx) => {
    if (event.toolName !== "bash") return;

    const command = String(event.input.command ?? "");
    const offender = findGitWriteCommand(command);
    if (!offender) return;

    if (!ctx.hasUI) {
      return {
        block: true,
        reason:
          `git commit/push blocked: no UI to ask for confirmation, and this repo's rule ` +
          `(.omp/AGENTS.md) is never to commit/push without an explicit human ask. ` +
          `Offending segment: \`${offender}\``,
      };
    }

    const allowed = await ctx.ui.confirm(
      "git commit/push blocked by policy",
      `This session is about to run:\n  ${offender}\n\n` +
        `.omp/AGENTS.md says never to commit/push without an explicit ask. ` +
        `Did the user explicitly ask for this commit/push, right now, in this conversation?`,
    );

    if (!allowed) {
      return {
        block: true,
        reason: `git commit/push blocked: not confirmed as an explicit user request. Offending segment: \`${offender}\``,
      };
    }
  });
}
