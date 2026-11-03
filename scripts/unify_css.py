#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
unify_css.py — توحيد CSS لمجموعة أدوات بلغة واحدة (الإنجليزية أو التركية لاحقاً)

الاستخدام:
    python3 scripts/unify_css.py <لغة_الملفات> <مصدر_الملفات>
    # مثال للنسخ الإنجليزية بعد رفعها ووضعها في مجلد مؤقت:
    python3 scripts/unify_css.py en ~/uploads-en

النتيجة (حسب اللغة "en" في المثال):
    css/tools-common-en.css      ← التصميم الموحد للنسخ الإنجليزية
    css/tools/toolNen.css        ← الفروق الخاصة بكل أداة فقط
    css/tools-overrides-en.css   ← التعديلات العامة (تصغير الصفحة والعنوان)

كيف يعمل:
1. يقرأ ملفات toolNen.html من المجلد المصدر (قبل التقسيم أو بعده)
2. يستخرج CSS من كتل <style> (مع تجاهل ما داخل السكربتات)
3. يعتمد النسخة الغالبة من كل قاعدة (توحيد كامل) مع فحص أمان
4. يكتب المشترك + الفروق لكل أداة + ملف overrides جاهز
"""
import os, re, sys
from collections import defaultdict

DST = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MIN_GROUP = 4

def read(p):
    with open(p, encoding="utf-8") as f:
        return f.read()

def norm(s):
    return "".join(s.split())

def parse_rules(text, media=""):
    items, i, n = [], 0, len(text)
    while i < n:
        b = text.find("{", i)
        if b == -1:
            break
        sel = text[i:b].strip()
        depth, j = 1, b + 1
        while j < n and depth:
            if text[j] == "{":
                depth += 1
            elif text[j] == "}":
                depth -= 1
            j += 1
        inner = text[b + 1 : j - 1]
        if sel.startswith("@media"):
            items.extend(parse_rules(inner, media=sel.strip()))
        elif sel.startswith("@"):
            items.append((media, sel + "{" + inner + "}", "@RAW@"))
        else:
            items.append((media, sel, inner.strip()))
        i = j
    return items

def selector_tokens(sel):
    return re.findall(r"[.#][A-Za-z_][\w-]*", sel)

def main(lang, src_dir):
    suffix = {"ar": "", "en": "en", "tr": "tr"}[lang]
    tool_ids = []
    tool_html, tool_items = {}, {}
    for n in range(1, 33):
        for name in (f"tool{n}{suffix}.html", f"tool{n}.html" if suffix == "" else None):
            if not name:
                continue
            p = os.path.join(src_dir, name)
            if os.path.exists(p):
                tool_ids.append(n)
                html = read(p)
                tool_html[n] = html
                hn = re.sub(r"<script[^>]*>.*?</script>", "", html, flags=re.S)
                css = "\n".join(re.findall(r"<style[^>]*>(.*?)</style>", hn, flags=re.S))
                css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
                tool_items[n] = parse_rules(css)
                break
    if not tool_ids:
        sys.exit(f"لم يُعثر على ملفات tool*{suffix}.html في {src_dir}")
    print(f"وجدت {len(tool_ids)} أداة: {tool_ids}")

    groups = defaultdict(lambda: defaultdict(list))
    example = {}
    for n in tool_ids:
        seen = set()
        for media, sel, body in tool_items[n]:
            key = (norm(media), norm(sel))
            bkey = norm(body) if body != "@RAW@" else norm(sel)
            if (key, bkey) in seen:
                continue
            seen.add((key, bkey))
            groups[key][bkey].append(n)
            example[(key, bkey)] = (media, sel, body)

    def other_tools_use_tokens(sel, owner_tools):
        toks = selector_tokens(sel)
        if not toks:
            return True
        for n in tool_ids:
            if n in owner_tools:
                continue
            for tok in toks:
                name = tok[1:]
                if tok[0] == ".":
                    if re.search(r'class="[^"]*\b' + re.escape(name), tool_html[n]):
                        return True
                else:
                    if 'id="' + name in tool_html[n]:
                        return True
        return False

    common_plan = {}
    for key, variants in groups.items():
        owners_all = [t for v in variants.values() for t in v]
        if len(set(owners_all)) >= MIN_GROUP:
            majority = max(variants.items(), key=lambda kv: (len(kv[1]), -min(kv[1])))
            common_plan[key] = example[(key, majority[0])]
        else:
            owners = set(owners_all)
            for bkey in variants:
                media, sel, body = example[(key, bkey)]
                if not other_tools_use_tokens(sel, owners):
                    common_plan.setdefault(key, (media, sel, body))

    common_ordered, added = [], set()
    for n in tool_ids:
        for media, sel, body in tool_items[n]:
            key = (norm(media), norm(sel))
            if key in common_plan and key not in added:
                added.add(key)
                common_ordered.append(common_plan[key])

    def fmt(media, sel, body):
        if body == "@RAW@":
            return sel
        body_fmt = "    " + ";\n    ".join(x.strip() for x in body.split(";") if x.strip()) + ";\n"
        rule = f"{sel} {{\n{body_fmt}}}"
        return f"{media} {{\n    {rule}\n}}" if media else rule

    lang_name = {"ar": "العربية", "en": "الإنجليزية", "tr": "التركية"}[lang]
    header = f"""/*
 * =====================================================================
 * css/tools-common-{lang}.css — التصميم الموحد لأدوات النسخة {lang_name}
 * =====================================================================
 * لتعديل تصميم كل الأدوات في هذه اللغة دفعة واحدة → عدّل هذا الملف.
 * ما تبقى في css/tools/toolN{suffix}.css هو المكونات الخاصة بالأداة فقط.
 */
"""
    write_path = os.path.join(DST, f"css/tools-common-{lang}.css")
    with open(write_path, "w", encoding="utf-8", newline="") as f:
        f.write(header + "\n" + "\n".join(fmt(*it) for it in common_ordered))
    print(f"كتبت {write_path} ({len(common_ordered)} قاعدة)")

    dropped = 0
    for n in tool_ids:
        extras, seen = [], set()
        for media, sel, body in tool_items[n]:
            key = (norm(media), norm(sel))
            bkey = norm(body) if body != "@RAW@" else norm(sel)
            if key in seen:
                continue
            seen.add(key)
            if key in common_plan:
                chosen = common_plan[key]
                chosen_key = norm(chosen[2]) if chosen[2] != "@RAW@" else norm(chosen[1])
                if chosen_key == bkey:
                    continue
                dropped += 1
                continue
            extras.append((media, sel, body))
        p = os.path.join(DST, f"css/tools/tool{n}{suffix}.css")
        if extras:
            with open(p, "w", encoding="utf-8", newline="") as f:
                f.write(f"/* مكونات خاصة بالأداة tool{n}{suffix} */\n\n" + "\n".join(fmt(*it) for it in extras))
        elif os.path.exists(p):
            os.remove(p)
    print(f"حذفت {dropped} اختلافاً (توحيد كامل)")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
