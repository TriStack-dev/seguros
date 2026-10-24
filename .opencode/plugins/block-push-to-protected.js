// Plugin de OpenCode: bloquea cualquier `git push` que escriba sobre una rama protegida.
// Enforza AGENTS.md: "Nunca se trabaja ni se pushea directo a main".
//
// Reutiliza el mismo script que Claude Code y Codex (.claude/hooks/block-push-to-protected.sh):
// le pasa por stdin el payload que ese script espera ({"tool_input": {"command": ...}}) y, si
// la respuesta es un deny, tira un error. En OpenCode, tirar en `tool.execute.before` cancela
// la ejecución del tool y le devuelve el mensaje al agente.
//
// Es solo un aviso temprano: la regla la hace cumplir .githooks/pre-push, corra el agente que corra.
import { spawnSync } from "node:child_process";
import { join } from "node:path";

export const BlockPushToProtected = async ({ worktree }) => {
  const script = join(worktree, ".claude/hooks/block-push-to-protected.sh");

  return {
    "tool.execute.before": async (input, output) => {
      if (input.tool !== "bash") return;
      const command = output.args?.command;
      if (typeof command !== "string" || !command.includes("push")) return;

      const result = spawnSync("bash", [script], {
        cwd: worktree,
        input: JSON.stringify({ tool_input: { command } }),
        encoding: "utf8",
      });
      // Si el script no corre (sin bash o sin jq), no bloqueamos: el pre-push sigue cubriendo.
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
