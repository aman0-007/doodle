#!/usr/bin/env bash
# ==============================================================================
# Setup Git Hooks
# Configures Git to execute .githooks/pre-push whenever `git push` is run.
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🔧 Configuring Git to run APK build on every git push..."

chmod +x "$ROOT_DIR/scripts/build-apk.sh"
chmod +x "$ROOT_DIR/.githooks/pre-push"

if command -v git &> /dev/null && [ -d "$ROOT_DIR/.git" ]; then
    git config core.hooksPath .githooks
    mkdir -p "$ROOT_DIR/.git/hooks"
    cp "$ROOT_DIR/.githooks/pre-push" "$ROOT_DIR/.git/hooks/pre-push"
    chmod +x "$ROOT_DIR/.git/hooks/pre-push"
    echo "✅ Git hooks configured! Whenever you run 'git push', your APK will automatically be built."
else
    echo "ℹ️  No active .git directory detected in current sandbox. When cloned into a git repository, run:"
    echo "    git config core.hooksPath .githooks"
fi
