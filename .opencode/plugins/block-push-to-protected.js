// Plugin de OpenCode: bloquea cualquier `git push` que escriba sobre una rama protegida.
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const setup = async (ctx = {}) => {
  const worktree =
    ctx.location?.directory ||
    ctx.worktree ||
    ctx.directory ||
    ctx.cwd ||
    process.env.PWD ||
    process.cwd();
  if (!worktree || typeof worktree !== "string") {
    console.error("[block-push-to-protected] No valid worktree/directory provided to plugin");
    return;
  }
  const script = join(worktree, ".claude/hooks/block-push-to-protected.sh");

  // V2 API
  if (ctx.tool?.hook) {
    try {
      await ctx.tool.hook("execute.before", (event) => {
        if (event.tool !== "bash") return;
        const command = event.input?.command || event.args?.command || event.parameters?.command;
        if (typeof command !== "string" || !command.includes("push")) return;

        const result = spawnSync("bash", [script], {
          cwd: worktree,
          input: JSON.stringify({ tool_input: { command } }),
          encoding: "utf8",
        });
        if (result.status !== 0 || !result.stdout.trim()) return;

        let decision;
        try {
          decision = JSON.parse(result.stdout).hookSpecificOutput;
        } catch {
          return;
        }
        if (decision?.permissionDecision === "deny") {
          throw new Error(decision.permissionDecisionReason);
        }
      });
    } catch (e) {
      console.error("[block-push-to-protected] Failed to register hook:", e);
    }
    return;
  }

  // V1 API
  return {
    "tool.execute.before": async (input, output) => {
      if (input.tool !== "bash") return;
      const command = output.args?.command || input.args?.command;
      if (typeof command !== "string" || !command.includes("push")) return;

      const result = spawnSync("bash", [script], {
        cwd: worktree,
        input: JSON.stringify({ tool_input: { command } }),
        encoding: "utf8",
      });
      if (result.status !== 0 || !result.stdout.trim()) return;

      let decision;
      try {
        decision = JSON.parse(result.stdout).hookSpecificOutput;
      } catch {
        return;
      }
      if (decision?.permissionDecision === "deny") {
        throw new Error(decision.permissionDecisionReason);
      }
    },
  };
};

export default {
  id: "block-push-to-protected",
  setup,
  server: setup,
};
