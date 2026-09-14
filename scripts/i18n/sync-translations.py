#!/usr/bin/env python3
"""
sync-translations.py
====================
Sync all 18 locale files against zh-CN (reference — most complete structure).
Uses en-US as English source text for LLM translation.

Approach
--------
- Parse locale files via node.js eval (handles TS object literals natively)
- Diff each locale against zh-CN to find missing key paths
- Group locales into 6 language groups for parallel translation
- Call OpenAI with TEXT response (no JSON schema) → manual parse
- Append translated missing sections into locale files

Response format (from LLM):
    key = translated value
    key2 = another translation

Usage
-----
  cd artifacts/customer-portal/src/i18n
  python3 sync-translations.py
  python3 sync-translations.py --dry-run
  python3 sync-translations.py --locale zh-TW
  python3 sync-translations.py --locale zh-TW --section mktCard.pabean
"""

import argparse
import concurrent.futures
import json
import os
import re
import subprocess
import sys
import urllib.request
from pathlib import Path
from typing import Optional

# ── Config ────────────────────────────────────────────────────────────────────

LOCALES_DIR = Path(__file__).parent / "locales"
REFERENCE   = "zh-CN"   # most complete locale — used as structure reference
EN_SOURCE   = "en-US"   # English source for LLM translation

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
OPENAI_MODEL   = "gpt-4o-mini"
MAX_WORKERS    = 6       # one per language group

# Locale → human-readable name for LLM prompt
LOCALE_NAMES: dict[str, str] = {
    "zh-TW": "Traditional Chinese (Taiwan)",
    "ja-JP": "Japanese",
    "ko-KR": "Korean",
    "de-DE": "German",
    "fr-FR": "French",
    "nl-NL": "Dutch",
    "es-ES": "Spanish",
    "it-IT": "Italian",
    "id-ID": "Indonesian (Bahasa Indonesia)",
    "ms-MY": "Malay (Bahasa Melayu)",
    "en-SG": "English (Singapore — use British spelling)",
    "en-US": "English (US)",
    "en-GB": "English (UK — use British spelling)",
    "en-AU": "English (Australia — use Australian/British spelling)",
    "ar-AE": "Arabic (UAE, right-to-left script)",
    "ar-SA": "Arabic (Saudi Arabia, right-to-left script)",
    "hi-IN": "Hindi",
}

# Language groups: processed in parallel, locales within each group sequential
GROUPS: dict[str, list[str]] = {
    "east_asian": ["zh-TW", "ja-JP", "ko-KR"],
    "european":   ["de-DE", "fr-FR", "nl-NL", "es-ES", "it-IT"],
    "sea":        ["id-ID", "ms-MY"],
    "english":    ["en-US", "en-GB", "en-SG", "en-AU"],
    "semitic":    ["ar-AE", "ar-SA"],
    "indic":      ["hi-IN"],
}

ALL_LOCALES = [lc for lcs in GROUPS.values() for lc in lcs]

# ── Locale file parser ────────────────────────────────────────────────────────

def parse_locale_file(locale: str) -> dict:
    """
    Parse a TypeScript locale file into a Python dict using node.js eval.
    Handles single/double-quoted strings, unquoted keys, nested objects,
    trailing commas — all common in TypeScript object literals.
    File path is embedded directly into the node script (no argv passing).
    """
    file_path = LOCALES_DIR / f"{locale}.ts"
    if not file_path.exists():
        raise FileNotFoundError(f"Locale file not found: {file_path}")

    # Embed path as a JSON string so special chars are safely escaped
    path_json = json.dumps(str(file_path))

    node_script = f"""
const fs = require('fs');
const src = fs.readFileSync({path_json}, 'utf8');

// Strip TypeScript-specific syntax to get a plain JS object literal
let cleaned = src
  .replace(/\\/\\/ @refresh reset\\n?/g, '')
  .replace(/import type[^\\n]+\\n/g, '')
  .replace(/const locale:\\s*DeepRecord\\s*=\\s*/, '')
  .replace(/export default locale;?\\s*$/, '')
  .trim();

// Remove trailing semicolon if present
if (cleaned.endsWith(';')) cleaned = cleaned.slice(0, -1).trimEnd();

try {{
  const obj = (0, eval)('(' + cleaned + ')');
  process.stdout.write(JSON.stringify(obj));
}} catch (e) {{
  process.stderr.write('ParseError: ' + e.message + '\\n');
  process.exit(1);
}}
"""
    result = subprocess.run(
        ["node", "-e", node_script],
        capture_output=True,
        text=True,
        timeout=30,
    )
    if result.returncode != 0:
        raise RuntimeError(
            f"Failed to parse locale '{locale}':\n{result.stderr[:400]}"
        )
    return json.loads(result.stdout)


# ── Flatten / unflatten helpers ───────────────────────────────────────────────

def flatten(d: dict, prefix: str = "") -> dict[str, str]:
    """Recursively flatten a nested dict into dotted-path keys."""
    out: dict[str, str] = {}
    for k, v in d.items():
        path = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            out.update(flatten(v, path))
        else:
            out[path] = str(v)
    return out


def get_nested(d: dict, path: str):
    """Get value at dotted path, return None if missing."""
    parts = path.split(".")
    cur = d
    for p in parts:
        if not isinstance(cur, dict) or p not in cur:
            return None
        cur = cur[p]
    return cur


def set_nested(d: dict, path: str, value) -> None:
    """Set value at dotted path, creating intermediate dicts as needed."""
    parts = path.split(".")
    cur = d
    for p in parts[:-1]:
        cur = cur.setdefault(p, {})
    cur[parts[-1]] = value


def path_exists(d: dict, path: str) -> bool:
    """Return True if dotted path exists in d."""
    return get_nested(d, path) is not None


# ── Missing key detection ─────────────────────────────────────────────────────

def find_missing(reference_flat: dict[str, str], target: dict) -> dict[str, str]:
    """
    Return {dotted_path: ref_value} for all paths in reference that
    are absent in target (dict, not flat).
    """
    target_flat = flatten(target)
    return {
        path: val
        for path, val in reference_flat.items()
        if path not in target_flat
    }


def group_missing_by_section(
    missing: dict[str, str], target: dict
) -> dict[str, dict[str, str]]:
    """
    Group missing keys by the direct parent of each leaf key.
    This guarantees leaf_key is always a simple identifier (no dots),
    which is required for the 'key = value' text response format.

    For a path like 'mktCard.pabean.headerTitle':
      section = 'mktCard.pabean', leaf = 'headerTitle'

    For a path like 'customClearance.pageTitle':
      section = 'customClearance', leaf = 'pageTitle'

    Returns {section_path: {leaf_key: ref_value}}
    """
    groups: dict[str, dict[str, str]] = {}

    for dotted_path, value in missing.items():
        parts = dotted_path.split(".")
        # Parent = all parts except the last; leaf = last part
        if len(parts) == 1:
            # Top-level key with no parent — group under "" (root)
            section = ""
            leaf = parts[0]
        else:
            section = ".".join(parts[:-1])
            leaf = parts[-1]
        groups.setdefault(section, {})[leaf] = value

    return groups


# ── OpenAI text response translation ─────────────────────────────────────────

def call_openai_text(prompt: str) -> str:
    """
    Call OpenAI Chat Completions with text response (no JSON schema).
    Returns the raw assistant message text.
    """
    if not OPENAI_API_KEY:
        raise EnvironmentError(
            "OPENAI_API_KEY is not set. "
            "Add it to Replit Secrets or load via GCP Secret Manager."
        )

    payload = json.dumps({
        "model": OPENAI_MODEL,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a professional UI translator specializing in logistics and B2B platforms. "
                    "Return translations exactly in the requested format — one 'key = value' per line. "
                    "No preamble, no explanations, no markdown."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.2,
        "max_tokens": 4000,
    }).encode()

    req = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=payload,
        headers={
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=90) as resp:
        body = json.loads(resp.read())

    return body["choices"][0]["message"]["content"]


def parse_text_response(text: str) -> dict[str, str]:
    """
    Parse LLM text response in 'key = value' format.

    Rules:
    - Lines without ' = ' are silently skipped (preamble, blank lines, etc.)
    - Key must be a valid identifier (alphanumeric + underscore)
    - Value is everything after the first ' = '
    """
    result: dict[str, str] = {}
    for line in text.strip().splitlines():
        line = line.strip()
        if " = " not in line:
            continue
        key, _, value = line.partition(" = ")
        key = key.strip()
        value = value.strip()
        # Validate: key should look like an identifier (letters, digits, underscore)
        if re.match(r"^[a-zA-Z_][a-zA-Z0-9_]*$", key):
            result[key] = value
    return result


def build_translation_prompt(
    locale: str,
    section_path: str,
    missing_kv: dict[str, str],
    en_source_section: dict[str, str],
) -> str:
    """
    Build the LLM prompt for a single section of missing keys.

    missing_kv: {leaf_key: value_from_reference_locale}
    en_source_section: {leaf_key: en-US value} for translation source
    """
    lang_name = LOCALE_NAMES.get(locale, locale)

    # Use en-US as source when available; fall back to reference (zh-CN) value
    source_lines = []
    for leaf_key in missing_kv:
        en_val = en_source_section.get(leaf_key)
        source_lines.append(f"{leaf_key} = {en_val or missing_kv[leaf_key]}")

    return f"""Translate these UI strings to {lang_name}.
Context: logistics / B2B marketplace platform.
Section: {section_path}

Rules:
- Keep {{placeholder}} variables unchanged (e.g. {{days}}, {{currency}}, {{n}}, {{count}})
- Keep brand name "B2B Marketplace and Logistic" unchanged
- Keep codes like "PIB", "PEB", "API", "NIK", "PPJK", "HS", "IDR", "FTA", "COO", "LARTAS" unchanged
- Return ONLY lines in this exact format — one per line:
  key = translation
- No extra text, no numbering, no markdown.

English source:
{chr(10).join(source_lines)}"""


# ── TypeScript block serializer ───────────────────────────────────────────────

def escape_ts_string(s: str) -> str:
    """Escape a string value for use inside single quotes in TypeScript."""
    return s.replace("\\", "\\\\").replace("'", "\\'")


def dict_to_ts_block(d: dict, indent: int = 2) -> str:
    """
    Serialize a Python dict to TypeScript object body (without outer braces).
    Uses single-quoted strings. Recursively handles nested dicts.
    """
    lines: list[str] = []
    pad = " " * indent
    for k, v in d.items():
        if isinstance(v, dict):
            inner = dict_to_ts_block(v, indent + 2)
            lines.append(f"{pad}{k}: {{")
            lines.append(inner)
            lines.append(f"{pad}}},")
        else:
            lines.append(f"{pad}{k}: '{escape_ts_string(str(v))}',")
    return "\n".join(lines)


# ── Locale file insertion ─────────────────────────────────────────────────────

def find_section_close_line(lines: list[str], start: int, section: str) -> int:
    """
    Find the index of the closing line of `section` block starting from `start`.
    Returns -1 if section is not found.

    Uses depth counting to handle nested objects correctly.
    """
    # Find the line where `section:` opens
    section_open = -1
    pattern = re.compile(rf"^\s+{re.escape(section)}\s*:\s*\{{")
    for i in range(start, min(start + 5000, len(lines))):
        if pattern.match(lines[i]):
            section_open = i
            break

    if section_open == -1:
        return -1

    depth = 0
    for i in range(section_open, min(section_open + 2000, len(lines))):
        depth += lines[i].count("{") - lines[i].count("}")
        if depth <= 0 and i > section_open:
            return i

    return -1


def insert_flat_keys_into_section(
    lines: list[str],
    section_path: str,
    flat_keys: dict[str, str],
) -> int:
    """
    Insert flat (non-nested) key-value pairs before the closing `}` of
    the section identified by `section_path` (e.g. "mktCard.pabean").

    Returns number of keys inserted.
    Only inserts keys that are not already present.
    """
    # Navigate nested path to find the innermost section
    path_parts = section_path.split(".")
    search_start = 0

    for part in path_parts:
        close = find_section_close_line(lines, search_start, part)
        if close == -1:
            print(
                f"  WARN: section '{section_path}' not found (part '{part}' missing)",
                file=sys.stderr,
            )
            return 0
        # Update search_start to inside this section for next level
        open_line = -1
        p = re.compile(rf"^\s+{re.escape(part)}\s*:\s*\{{")
        for i in range(search_start, close):
            if p.match(lines[i]):
                open_line = i
                break
        search_start = open_line + 1 if open_line != -1 else search_start
        final_close = close

    # Check which keys already exist in the block
    close_line = final_close
    block_text = "\n".join(lines[search_start:close_line])
    existing = set()
    for k in flat_keys:
        if re.search(rf"^\s+{re.escape(k)}\s*:", block_text, re.MULTILINE):
            existing.add(k)

    to_insert = {k: v for k, v in flat_keys.items() if k not in existing}
    if not to_insert:
        return 0

    # Determine indent level from the closing line
    close_text = lines[close_line]
    indent_match = re.match(r"(\s+)", close_text)
    base_indent = indent_match.group(1) if indent_match else "    "
    key_indent = base_indent + "  "

    insertion_lines = [
        f"{key_indent}{k}: '{escape_ts_string(v)}',"
        for k, v in to_insert.items()
    ]
    insertion = "\n".join(insertion_lines) + "\n"
    lines.insert(close_line, insertion)
    return len(to_insert)


def append_top_level_section(
    lines: list[str],
    section_name: str,
    section_dict: dict,
) -> bool:
    """
    Append a new top-level section before the closing `};` of the locale object.
    Returns True on success.
    """
    # Find the last `};` which closes the `const locale = { ... };`
    closing_idx = -1
    for i in range(len(lines) - 1, -1, -1):
        stripped = lines[i].strip()
        if stripped == "};" or stripped == "},":
            closing_idx = i
            break

    if closing_idx == -1:
        print(
            f"  WARN: Could not find locale closing '}},' to append section '{section_name}'",
            file=sys.stderr,
        )
        return False

    ts_body = dict_to_ts_block(section_dict, indent=4)
    block = f"  {section_name}: {{\n{ts_body}\n  }},"
    lines.insert(closing_idx, block + "\n")
    return True


def append_subsection_to_section(
    lines: list[str],
    parent_section: str,
    sub_name: str,
    sub_dict: dict,
) -> bool:
    """
    Append a new sub-section `sub_name` before the closing `}` of `parent_section`.
    Returns True on success.
    """
    close = find_section_close_line(lines, 0, parent_section)
    if close == -1:
        print(
            f"  WARN: parent section '{parent_section}' not found",
            file=sys.stderr,
        )
        return False

    # Determine indent from the parent close line
    close_text = lines[close]
    indent_match = re.match(r"(\s+)", close_text)
    base_indent = indent_match.group(1) if indent_match else "  "
    sub_indent = len(base_indent) + 2

    ts_body = dict_to_ts_block(sub_dict, indent=sub_indent + 2)
    block = f"{base_indent}  {sub_name}: {{\n{ts_body}\n{base_indent}  }},"
    lines.insert(close, block + "\n")
    return True


# ── Single locale sync ────────────────────────────────────────────────────────

def sync_locale(
    locale: str,
    reference_data: dict,
    reference_flat: dict[str, str],
    en_flat: dict[str, str],
    dry_run: bool = False,
    only_section: Optional[str] = None,
) -> dict[str, int]:
    """
    Sync a single locale against reference (zh-CN).
    Returns {section: keys_inserted}.
    """
    file_path = LOCALES_DIR / f"{locale}.ts"
    print(f"[{locale}] Parsing...")

    try:
        target_data = parse_locale_file(locale)
    except Exception as e:
        print(f"[{locale}] ERROR parsing: {e}", file=sys.stderr)
        return {}

    missing = find_missing(reference_flat, target_data)

    if not missing:
        print(f"[{locale}] ✓ No missing keys")
        return {}

    print(f"[{locale}] Found {len(missing)} missing key(s)")

    # Group missing by deepest existing ancestor
    grouped = group_missing_by_section(missing, target_data)

    if only_section:
        grouped = {
            s: kv for s, kv in grouped.items()
            if s == only_section or s.startswith(only_section + ".")
        }
        if not grouped:
            print(f"[{locale}] No missing keys in section '{only_section}'")
            return {}

    results: dict[str, int] = {}

    with open(file_path, encoding="utf-8") as f:
        file_content = f.read()
    lines = file_content.split("\n")

    for section_path, leaf_keys in sorted(grouped.items()):
        print(f"[{locale}]   Section '{section_path}': {len(leaf_keys)} missing key(s)")

        # ── Build English source for this section ──────────────────────────
        en_section: dict[str, str] = {}
        section_prefix = section_path + "." if section_path else ""
        for leaf_key in leaf_keys:
            full_path = section_prefix + leaf_key if section_path else leaf_key
            en_val = en_flat.get(full_path)
            if en_val:
                en_section[leaf_key] = en_val

        # ── Translate via OpenAI ───────────────────────────────────────────
        if locale in ("en-US", "en-GB", "en-SG", "en-AU"):
            # English locales: use en-US values directly, adjust spelling if needed
            translated = {k: en_section.get(k, v) for k, v in leaf_keys.items()}
        else:
            prompt = build_translation_prompt(
                locale, section_path, leaf_keys, en_section
            )
            if dry_run:
                print(f"[{locale}]   [DRY RUN] Would call OpenAI for {len(leaf_keys)} keys")
                print(f"--- Prompt preview ({locale}/{section_path}) ---")
                print(prompt[:800])
                print("---")
                results[section_path] = len(leaf_keys)
                continue

            try:
                response_text = call_openai_text(prompt)
                translated = parse_text_response(response_text)
                print(
                    f"[{locale}]   Translated {len(translated)}/{len(leaf_keys)} keys"
                )
            except Exception as e:
                print(
                    f"[{locale}]   ERROR translating '{section_path}': {e}",
                    file=sys.stderr,
                )
                continue

        if dry_run:
            results[section_path] = len(translated)
            continue

        # ── Insert translated keys into file ───────────────────────────────
        path_parts = section_path.split(".")

        if len(path_parts) == 1:
            # Top-level section
            if not path_exists(target_data, section_path):
                # Section doesn't exist at all → append full nested block
                # Build nested structure from flat leaf_keys → nested dict
                section_dict = _build_nested_from_flat(
                    {f"{section_path}.{k}": translated.get(k, leaf_keys[k])
                     for k in leaf_keys},
                    prefix=section_path,
                )
                ok = append_top_level_section(lines, section_path, section_dict)
                if ok:
                    results[section_path] = len(leaf_keys)
            else:
                # Section exists, insert flat keys
                n = insert_flat_keys_into_section(
                    lines, section_path,
                    {k: translated.get(k, leaf_keys[k]) for k in leaf_keys},
                )
                results[section_path] = n

        elif len(path_parts) == 2:
            parent, child = path_parts
            if not path_exists(target_data, section_path):
                # Sub-section missing → append to parent
                sub_dict = {k: translated.get(k, leaf_keys[k]) for k in leaf_keys}
                if not path_exists(target_data, parent):
                    # Parent also missing → create both
                    full_dict = {child: sub_dict}
                    ok = append_top_level_section(lines, parent, full_dict)
                else:
                    ok = append_subsection_to_section(lines, parent, child, sub_dict)
                if ok:
                    results[section_path] = len(leaf_keys)
            else:
                n = insert_flat_keys_into_section(
                    lines, section_path,
                    {k: translated.get(k, leaf_keys[k]) for k in leaf_keys},
                )
                results[section_path] = n

        else:
            # 3+ levels deep: build full path up from deepest existing point
            # Find deepest existing ancestor
            existing_ancestor = ""
            for depth in range(len(path_parts), 0, -1):
                candidate = ".".join(path_parts[:depth])
                if path_exists(target_data, candidate):
                    existing_ancestor = candidate
                    break

            missing_chain = path_parts[len(existing_ancestor.split(".")):] if existing_ancestor else path_parts

            if not existing_ancestor:
                # Nothing exists → build entire path from scratch
                full_dict = _build_nested_from_leaf_path(
                    path_parts[1:],
                    {k: translated.get(k, leaf_keys[k]) for k in leaf_keys},
                )
                ok = append_top_level_section(lines, path_parts[0], full_dict)
                if ok:
                    results[section_path] = len(leaf_keys)
            elif len(missing_chain) == 1:
                # One level missing — append sub-section to existing ancestor
                sub_dict = {k: translated.get(k, leaf_keys[k]) for k in leaf_keys}
                ok = append_subsection_to_section(
                    lines, existing_ancestor, missing_chain[0], sub_dict
                )
                if ok:
                    results[section_path] = len(leaf_keys)
            else:
                # Multiple levels missing within existing ancestor
                innermost_name = missing_chain[-1]
                middle = missing_chain[:-1]
                sub_dict = {k: translated.get(k, leaf_keys[k]) for k in leaf_keys}
                wrapped = _build_nested_from_leaf_path(middle, sub_dict)

                # Append the outermost missing level to the existing ancestor
                outer_name = missing_chain[0]
                ok = append_subsection_to_section(
                    lines, existing_ancestor, outer_name,
                    _build_nested_from_leaf_path(missing_chain[1:], sub_dict),
                )
                if ok:
                    results[section_path] = len(leaf_keys)

    if not dry_run and any(v > 0 for v in results.values()):
        new_content = "\n".join(lines)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        total = sum(results.values())
        print(f"[{locale}] ✓ Wrote {total} key(s) to {file_path.name}")

    return results


# ── Nested dict helpers ───────────────────────────────────────────────────────

def _build_nested_from_flat(flat: dict[str, str], prefix: str) -> dict:
    """Build nested dict from flat {prefix.a.b: val} → {a: {b: val}}."""
    result: dict = {}
    plen = len(prefix) + 1 if prefix else 0
    for path, val in flat.items():
        rel = path[plen:] if prefix else path
        set_nested(result, rel, val)
    return result


def _build_nested_from_leaf_path(path_parts: list[str], leaf_dict: dict) -> dict:
    """Wrap leaf_dict in nested dicts for each path part."""
    if not path_parts:
        return leaf_dict
    return {path_parts[0]: _build_nested_from_leaf_path(path_parts[1:], leaf_dict)}


# ── Group runner ─────────────────────────────────────────────────────────────

def run_group(
    group_name: str,
    locales: list[str],
    reference_data: dict,
    reference_flat: dict[str, str],
    en_flat: dict[str, str],
    dry_run: bool,
    only_locale: Optional[str],
    only_section: Optional[str],
) -> dict[str, dict[str, int]]:
    """Process all locales in a language group sequentially."""
    group_results: dict[str, dict[str, int]] = {}
    for locale in locales:
        if only_locale and locale != only_locale:
            continue
        if locale == REFERENCE:
            continue  # skip reference locale
        try:
            res = sync_locale(
                locale,
                reference_data,
                reference_flat,
                en_flat,
                dry_run=dry_run,
                only_section=only_section,
            )
            group_results[locale] = res
        except Exception as e:
            print(f"[{group_name}/{locale}] FATAL: {e}", file=sys.stderr)
    return group_results


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Sync all locale files against zh-CN reference via OpenAI."
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be translated without writing files or calling OpenAI.",
    )
    parser.add_argument(
        "--locale",
        metavar="LOCALE",
        help="Only sync this locale (e.g. zh-TW). Default: all.",
    )
    parser.add_argument(
        "--section",
        metavar="SECTION",
        help="Only sync this section path (e.g. mktCard.pabean). Default: all.",
    )
    parser.add_argument(
        "--list-missing",
        action="store_true",
        help="Just list missing key paths for each locale without translating.",
    )
    args = parser.parse_args()

    # ── Load reference and English source ────────────────────────────────────
    print(f"Loading reference locale: {REFERENCE}")
    try:
        reference_data = parse_locale_file(REFERENCE)
    except Exception as e:
        print(f"FATAL: Cannot parse reference locale '{REFERENCE}': {e}", file=sys.stderr)
        sys.exit(1)

    reference_flat = flatten(reference_data)
    print(f"  → {len(reference_flat)} key paths in reference")

    print(f"Loading English source: {EN_SOURCE}")
    try:
        en_data = parse_locale_file(EN_SOURCE)
    except Exception as e:
        print(f"WARN: Cannot parse EN source '{EN_SOURCE}': {e}", file=sys.stderr)
        en_data = {}
    en_flat = flatten(en_data)
    print(f"  → {len(en_flat)} key paths in EN source")

    # ── List-missing mode ─────────────────────────────────────────────────────
    if args.list_missing:
        target_locales = [args.locale] if args.locale else ALL_LOCALES
        for locale in target_locales:
            if locale == REFERENCE:
                continue
            try:
                target_data = parse_locale_file(locale)
            except Exception as e:
                print(f"[{locale}] ERROR: {e}", file=sys.stderr)
                continue
            missing = find_missing(reference_flat, target_data)
            if missing:
                print(f"\n[{locale}] {len(missing)} missing keys:")
                for path in sorted(missing):
                    print(f"  {path}")
            else:
                print(f"[{locale}] ✓ complete")
        return

    # ── Sync mode ─────────────────────────────────────────────────────────────
    if not OPENAI_API_KEY and not args.dry_run:
        print(
            "ERROR: OPENAI_API_KEY not set. "
            "Run with --dry-run to preview, or set OPENAI_API_KEY.",
            file=sys.stderr,
        )
        sys.exit(1)

    # Build group tasks
    tasks: list[tuple[str, list[str]]] = []
    for group_name, group_locales in GROUPS.items():
        if args.locale:
            if args.locale in group_locales:
                tasks.append((group_name, [args.locale]))
                break
        else:
            tasks.append((group_name, group_locales))

    if not tasks:
        print(
            f"ERROR: Locale '{args.locale}' not found in any group.",
            file=sys.stderr,
        )
        sys.exit(1)

    print(f"\nProcessing {len(tasks)} group(s) in parallel (max {MAX_WORKERS} workers)...")
    print(f"Mode: {'DRY RUN' if args.dry_run else 'LIVE'}\n")

    all_results: dict[str, dict[str, int]] = {}

    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        future_to_group = {
            executor.submit(
                run_group,
                group_name,
                group_locales,
                reference_data,
                reference_flat,
                en_flat,
                args.dry_run,
                args.locale,
                args.section,
            ): group_name
            for group_name, group_locales in tasks
        }
        for future in concurrent.futures.as_completed(future_to_group):
            group_name = future_to_group[future]
            try:
                group_results = future.result()
                all_results.update(group_results)
            except Exception as e:
                print(f"Group '{group_name}' FAILED: {e}", file=sys.stderr)

    # ── Summary ───────────────────────────────────────────────────────────────
    print("\n── Summary ─────────────────────────────────────────────────────────")
    grand_total = 0
    for locale, sections in sorted(all_results.items()):
        total = sum(sections.values())
        grand_total += total
        if total > 0:
            detail = ", ".join(f"{s}:{n}" for s, n in sections.items())
            print(f"  {locale}: {total} key(s) — [{detail}]")
        else:
            print(f"  {locale}: ✓ complete (no changes)")
    print(f"\nTotal keys {'staged' if args.dry_run else 'inserted'}: {grand_total}")


if __name__ == "__main__":
    main()
