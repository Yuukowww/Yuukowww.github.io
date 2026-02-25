#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

CONFIG_FILE="${CONFIG_FILE:-$ROOT_DIR/.sync-posts.conf}"
POSTS_DIR="${POSTS_DIR:-source/_posts}"
STATE_DIR="${STATE_DIR:-$ROOT_DIR/.sync}"
STATE_FILE="${STATE_FILE:-$STATE_DIR/posts_last_sync_commit}"
REMOTE_TARGET="${REMOTE_TARGET:-}"
SSH_PORT="${SSH_PORT:-}"
RSYNC_RSH="${RSYNC_RSH:-}"

if [[ -f "$CONFIG_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$CONFIG_FILE"
fi

REMOTE_TARGET="${REMOTE_TARGET:-}"
POSTS_DIR="${POSTS_DIR:-source/_posts}"
STATE_DIR="${STATE_DIR:-$ROOT_DIR/.sync}"
STATE_FILE="${STATE_FILE:-$STATE_DIR/posts_last_sync_commit}"
SSH_PORT="${SSH_PORT:-}"
RSYNC_RSH="${RSYNC_RSH:-}"

usage() {
  cat <<'EOF'
用法:
  ./scripts/sync_posts.sh sync        # 增量同步 markdown（默认）
  ./scripts/sync_posts.sh dry-run     # 预览将同步哪些文件
  ./scripts/sync_posts.sh reset       # 将同步基线重置为当前 HEAD
  ./scripts/sync_posts.sh status      # 查看当前同步基线

配置方式:
  1) 复制 .sync-posts.conf.example 为 .sync-posts.conf
  2) 设置 REMOTE_TARGET，例如:
     REMOTE_TARGET="user@server:/var/www/hexo_blog_backup"
EOF
}

die() {
  echo "[sync-posts] $*" >&2
  exit 1
}

ensure_dependencies() {
  command -v git >/dev/null 2>&1 || die "未找到 git"
  command -v rsync >/dev/null 2>&1 || die "未找到 rsync"
}

ensure_repo_root() {
  local repo_root
  repo_root="$(git -C "$ROOT_DIR" rev-parse --show-toplevel 2>/dev/null || true)"
  [[ -n "$repo_root" ]] || die "当前目录不是 git 仓库"
  ROOT_DIR="$repo_root"
}

current_head() {
  git -C "$ROOT_DIR" rev-parse HEAD
}

print_status() {
  local head
  head="$(current_head)"
  echo "[sync-posts] 仓库根目录: $ROOT_DIR"
  echo "[sync-posts] posts 目录: $POSTS_DIR"
  echo "[sync-posts] 当前 HEAD:  $head"
  if [[ -f "$STATE_FILE" ]]; then
    echo "[sync-posts] 同步基线:   $(cat "$STATE_FILE")"
  else
    echo "[sync-posts] 同步基线:   (未初始化)"
  fi
}

reset_state() {
  mkdir -p "$STATE_DIR"
  current_head >"$STATE_FILE"
  echo "[sync-posts] 已重置同步基线为: $(cat "$STATE_FILE")"
}

collect_changed_files() {
  local tmpfile
  tmpfile="$1"
  : >"$tmpfile"

  if [[ -f "$STATE_FILE" ]]; then
    local base
    base="$(cat "$STATE_FILE")"
    git -C "$ROOT_DIR" diff --name-only --diff-filter=AMR "$base..HEAD" -- "$POSTS_DIR" | grep -E '\.md$' || true
  else
    git -C "$ROOT_DIR" ls-files "$POSTS_DIR" | grep -E '\.md$' || true
  fi >>"$tmpfile"

  git -C "$ROOT_DIR" diff --name-only -- "$POSTS_DIR" | grep -E '\.md$' || true >>"$tmpfile"
  git -C "$ROOT_DIR" diff --name-only --cached -- "$POSTS_DIR" | grep -E '\.md$' || true >>"$tmpfile"
  git -C "$ROOT_DIR" ls-files --others --exclude-standard "$POSTS_DIR" | grep -E '\.md$' || true >>"$tmpfile"

  sort -u "$tmpfile" -o "$tmpfile"
}

run_sync() {
  local dry_run
  dry_run="$1"

  [[ -n "$REMOTE_TARGET" ]] || die "未配置 REMOTE_TARGET，请先编辑 .sync-posts.conf"
  mkdir -p "$STATE_DIR"

  local filelist
  filelist="$(mktemp)"
  trap 'rm -f "$filelist"' EXIT

  collect_changed_files "$filelist"

  if [[ ! -s "$filelist" ]]; then
    echo "[sync-posts] 没有检测到需要同步的 markdown 文件"
    return 0
  fi

  echo "[sync-posts] 将同步以下文件:"
  sed 's#^#  - #' "$filelist"

  local -a rsync_opts
  rsync_opts=(-avz --files-from="$filelist")
  if [[ "$dry_run" == "1" ]]; then
    rsync_opts+=(-n)
    echo "[sync-posts] dry-run 模式，不会真正上传文件"
  fi

  if [[ -z "$RSYNC_RSH" && -n "$SSH_PORT" ]]; then
    RSYNC_RSH="ssh -p $SSH_PORT"
  fi
  if [[ -n "$RSYNC_RSH" ]]; then
    rsync_opts+=(-e "$RSYNC_RSH")
  fi

  rsync "${rsync_opts[@]}" "$ROOT_DIR/" "$REMOTE_TARGET"

  if [[ "$dry_run" != "1" ]]; then
    current_head >"$STATE_FILE"
    echo "[sync-posts] 同步成功，基线更新为: $(cat "$STATE_FILE")"
  fi
}

main() {
  local cmd="${1:-sync}"

  ensure_dependencies
  ensure_repo_root

  case "$cmd" in
  sync)
    run_sync 0
    ;;
  dry-run)
    run_sync 1
    ;;
  reset)
    reset_state
    ;;
  status)
    print_status
    ;;
  -h | --help | help)
    usage
    ;;
  *)
    usage
    die "未知命令: $cmd"
    ;;
  esac
}

main "$@"