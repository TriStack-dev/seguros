#!/usr/bin/env bash
# PreToolUse (Bash) hook: blocks any `git push` that would write to a protected branch.
# Enforces AGENTS.md: "Nunca se trabaja ni se pushea directo a main".
#
# Reads the hook payload on stdin and prints a deny decision when the command
# would push to main/master. Anything else exits silently (no decision = normal flow).
set -uo pipefail

PROTECTED=("main" "master")

deny() {
  jq -n --arg reason "$1" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: $reason
    }
  }'
  exit 0
}

is_protected() {
  local branch=$1 p
  for p in "${PROTECTED[@]}"; do
    [[ "$branch" == "$p" ]] && return 0
  done
  return 1
}

payload=$(cat)
command=$(printf '%s' "$payload" | jq -r '.tool_input.command // empty' 2>/dev/null) || exit 0
[[ -n "$command" ]] || exit 0
[[ "$command" == *push* ]] || exit 0

current_branch=$(git symbolic-ref --short -q HEAD 2>/dev/null || echo "")

# Inspect each statement separately so `cd x && git push origin main` is caught too.
while IFS= read -r segment; do
  [[ -n "${segment// }" ]] || continue
  read -r -a tok <<<"$segment"
  n=${#tok[@]}

  # Locate the `git` executable token.
  i=0
  while (( i < n )); do
    [[ "${tok[i]}" == "git" || "${tok[i]}" == */git ]] && break
    ((i++))
  done
  (( i < n )) || continue
  ((i++))

  # Skip git's global options (some take a separate value).
  while (( i < n )); do
    case "${tok[i]}" in
      -C|-c|--git-dir|--work-tree|--namespace|--exec-path) ((i += 2)) ;;
      -*) ((i++)) ;;
      *) break ;;
    esac
  done
  (( i < n )) && [[ "${tok[i]}" == "push" ]] || continue
  ((i++))

  # Split the push arguments into flags and positionals (remote + refspecs).
  positionals=()
  while (( i < n )); do
    case "${tok[i]}" in
      --all|--mirror)
        deny "Bloqueado por el hook del repo: \`${tok[i]}\` pushea todas las ramas, incluida main. Pusheá solo tu rama step/NN-nombre-corto. Ver AGENTS.md."
        ;;
      -o|--push-option|--receive-pack|--exec|--repo) ((i += 2)) ;;
      -*) ((i++)) ;;
      *) positionals+=("${tok[i]}"); ((i++)) ;;
    esac
  done

  if (( ${#positionals[@]} <= 1 )); then
    # No refspec: git pushes the current branch (or the configured upstream).
    if is_protected "$current_branch"; then
      deny "Bloqueado por el hook del repo: estás en '$current_branch' y este push iría directo a una rama protegida. Creá una rama step/NN-nombre-corto y abrí un PR. Ver AGENTS.md."
    fi
    continue
  fi

  # Check the destination side of every refspec.
  for refspec in "${positionals[@]:1}"; do
    dst=${refspec#+}
    [[ "$dst" == *:* ]] && dst=${dst#*:}
    dst=${dst#refs/heads/}
    [[ "$dst" == "HEAD" ]] && dst=$current_branch
    if is_protected "$dst"; then
      deny "Bloqueado por el hook del repo: el push escribe sobre '$dst', que es una rama protegida. Pusheá tu rama step/NN-nombre-corto y abrí un PR. Ver AGENTS.md."
    fi
  done
done < <(printf '%s\n' "$command" | tr ';&|\n' '\n')

exit 0
