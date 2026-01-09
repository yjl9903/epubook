#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
VERSION="${1:-${EPUBCHECK_VERSION:-5.3.0}}"
DEST_DIR="${SCRIPT_DIR}/epubcheck"
ZIP_NAME="epubcheck-${VERSION}.zip"
URL="https://github.com/w3c/epubcheck/releases/download/v${VERSION}/${ZIP_NAME}"

if ! command -v unzip >/dev/null 2>&1; then
  echo "Missing unzip. Please install it first."
  exit 1
fi

mkdir -p "${DEST_DIR}"

TMP_DIR="$(mktemp -d)"
cleanup() {
  rm -rf "${TMP_DIR}"
}
trap cleanup EXIT

echo "Downloading ${URL}"
curl -fL "${URL}" -o "${TMP_DIR}/${ZIP_NAME}"

echo "Extracting ${ZIP_NAME}"
unzip -q "${TMP_DIR}/${ZIP_NAME}" -d "${TMP_DIR}/unzipped"

EXTRACT_BASE="${TMP_DIR}/unzipped"
ROOT_DIR=""

if [[ -d "${EXTRACT_BASE}/epubcheck-${VERSION}" ]]; then
  ROOT_DIR="${EXTRACT_BASE}/epubcheck-${VERSION}"
else
  DIR_COUNT="$(find "${EXTRACT_BASE}" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ')"
  FILE_COUNT="$(find "${EXTRACT_BASE}" -mindepth 1 -maxdepth 1 -type f | wc -l | tr -d ' ')"
  if [[ "${DIR_COUNT}" -eq 1 && "${FILE_COUNT}" -eq 0 ]]; then
    ROOT_DIR="$(find "${EXTRACT_BASE}" -mindepth 1 -maxdepth 1 -type d | head -n 1)"
  fi
fi

TARGET_DIR="${DEST_DIR}/epubcheck-${VERSION}"
rm -rf "${TARGET_DIR}"

if [[ -n "${ROOT_DIR}" ]]; then
  mv "${ROOT_DIR}" "${TARGET_DIR}"
else
  mkdir -p "${TARGET_DIR}"
  mv "${EXTRACT_BASE}"/* "${TARGET_DIR}/"
fi

MAIN_JAR="${TARGET_DIR}/epubcheck.jar"
if [[ ! -f "${MAIN_JAR}" ]]; then
  MAIN_JAR="$(find "${TARGET_DIR}" -maxdepth 1 -type f -name "*.jar" | head -n 1)"
fi

if [[ -z "${MAIN_JAR}" || ! -f "${MAIN_JAR}" ]]; then
  echo "Missing epubcheck jar in ${TARGET_DIR} after extraction"
  exit 1
fi

echo "Saved to ${TARGET_DIR}"
