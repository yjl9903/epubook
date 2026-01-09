#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
VERSION="${EPUBCHECK_VERSION:-5.3.0}"
BASE_DIR="${SCRIPT_DIR}/epubcheck/epubcheck-${VERSION}"
JAR_PATH="${BASE_DIR}/epubcheck.jar"
JAVA_BIN="${JAVA_BIN:-java}"

if [[ ! -f "${JAR_PATH}" ]]; then
  echo "Missing ${JAR_PATH}"
  echo "Run: ${SCRIPT_DIR}/download-epubcheck.sh ${VERSION}"
  exit 1
fi

if [[ $# -lt 1 ]]; then
  echo "Usage: ${0##*/} <epub-file> [epubcheck-args...]"
  exit 2
fi

exec "${JAVA_BIN}" -jar "${JAR_PATH}" "$@"
