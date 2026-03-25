#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
INSTALL_ROOT="${WALKIE_INSTALL_ROOT:-${HOME}/.walkie-talkie}"

detect_platform() {
  case "$(uname -s)" in
    Linux) echo "linux" ;;
    Darwin) echo "macos" ;;
    *) echo "unsupported" ;;
  esac
}

detect_arch() {
  case "$(uname -m)" in
    x86_64|amd64) echo "x64" ;;
    arm64|aarch64) echo "arm64" ;;
    *) echo "unsupported" ;;
  esac
}

print_summary() {
  local platform arch
  platform="$(detect_platform)"
  arch="$(detect_arch)"

  cat <<EOF
Walkie-Talkie install.sh boundary
Platform: ${platform}
Architecture: ${arch}
Install root: ${INSTALL_ROOT}
Repo root: ${PROJECT_ROOT}
EOF
}

print_plan() {
  cat <<'EOF'
Planned bootstrap steps:
1. verify Linux/macOS support
2. verify node and npm availability
3. detect whether a repo checkout is present
4. if repo exists: run npm install
5. if repo exists: run npm run install:local
6. if repo does not exist: exit with hosted-download-not-yet-wired guidance
EOF
}

require_command() {
  local name="$1"
  if ! command -v "${name}" >/dev/null 2>&1; then
    echo "Missing required command: ${name}" >&2
    exit 1
  fi
}

ensure_supported_platform() {
  local platform arch
  platform="$(detect_platform)"
  arch="$(detect_arch)"

  if [[ "${platform}" == "unsupported" ]]; then
    echo "install.sh currently supports Linux and macOS only." >&2
    exit 1
  fi

  if [[ "${arch}" == "unsupported" ]]; then
    echo "install.sh currently supports x64 and arm64 only." >&2
    exit 1
  fi
}

has_repo_checkout() {
  [[ -f "${PROJECT_ROOT}/package.json" ]] && grep -q '"name": "walkie-talkie-workspace"' "${PROJECT_ROOT}/package.json"
}

run_repo_bootstrap() {
  echo "Repo checkout detected at ${PROJECT_ROOT}"
  echo "Running npm install..."
  (cd "${PROJECT_ROOT}" && npm install)
  echo "Running local install flow..."
  (cd "${PROJECT_ROOT}" && npm run install:local)
  echo "Walkie-Talkie bootstrap completed."
}

print_hosted_boundary_message() {
  cat <<'EOF'
Hosted download/bootstrap is not wired yet in this step.
Current supported path:
1. clone the repository
2. cd into walkie-talkie
3. run: npm run install:local

The hosted release download path will be completed in later M21 steps.
EOF
}

main() {
  local mode="${1:-}"

  if [[ "${mode}" == "--check" ]]; then
    print_summary
    echo "Check mode: install.sh boundary is present."
    return 0
  fi

  if [[ "${mode}" == "--print-plan" ]]; then
    print_summary
    print_plan
    return 0
  fi

  ensure_supported_platform
  require_command node
  require_command npm

  print_summary

  if has_repo_checkout; then
    run_repo_bootstrap
    return 0
  fi

  print_hosted_boundary_message
  return 1
}

main "${1:-}"
