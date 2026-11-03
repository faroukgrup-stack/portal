#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
refactor_tool.py — تقسيم صفحة أداة واحدة إلى (HTML + CSS + JS)

الاستخدام:
    python3 scripts/refactor_tool.py <مسار الملف الأصلي> <الاسم النهائي>

أمثلة:
    python3 scripts/refactor_tool.py ~/Downloads/tool16.html tool16
    python3 scripts/refactor_tool.py ~/Downloads/tool1tr.html tool1tr
    python3 scripts/refactor_tool.py ~/Downloads/tool16en.html tool16en

النتيجة داخل المشروع:
    tools/<الاسم>.html      (هيكل HTML فقط)
    css/tools/<الاسم>.css   (كل التنسيقات)
    js/tools/<الاسم>.js     (كل منطق الأداة)

ملاحظات:
    • سكربت الحماية auth-check وروابط "الرئيسية" تُصحَّح تلقائياً لمسار tools/.
    • قواعد التسمية حسب اللغة: toolN.html = عربي، toolNen.html = إنجليزي، toolNtr.html = تركي.
"""
import os, re, sys

DST = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # جذر المشروع

def main(src_path, name):
    if not os.path.isfile(src_path):
        sys.exit(f"الملف غير موجود: {src_path}")
    with open(src_path, encoding="utf-8") as f:
        html = f.read()

    script_pattern = re.compile(r"<script([^>]*)>(.*?)</script>", re.S)

    # 1) استخراج السكربتات المضمّنة أولاً (قد تحتوي <style> داخل نصوص القوالب)
    parts_js = []
    def script_repl(m):
        attrs, inner = m.group(1), m.group(2)
        if "src=" in attrs:
            return m.group(0)
        parts_js.append(inner)
        return f'<script src="../js/tools/{name}.js" defer></script>'
    out_html = script_pattern.sub(script_repl, html)
    tool_js = "\n\n// =====================================================================\n\n".join(parts_js)

    # 2) استخراج كتل <style> المتبقية (الحقيقية في HTML)
    styles = re.findall(r"<style[^>]*>(.*?)</style>", out_html, flags=re.S)
    css = "\n\n".join(styles)
    out_html = re.sub(r"<style[^>]*>.*?</style>",
                      f'<link rel="stylesheet" href="../css/tools/{name}.css">',
                      out_html, flags=re.S)

    # 3) تصحيح المسارات لأن الأداة أصبحت داخل tools/
    out_html = out_html.replace('<script src="auth-check.js"></script>',
                                '<script src="../js/auth-check.js"></script>')
    out_html = out_html.replace('href="index.html"', 'href="../index.html"')

    for d in ("tools", "css/tools", "js/tools"):
        os.makedirs(os.path.join(DST, d), exist_ok=True)
    with open(os.path.join(DST, f"tools/{name}.html"), "w", encoding="utf-8", newline="") as f:
        f.write(out_html)
    if css.strip():
        with open(os.path.join(DST, f"css/tools/{name}.css"), "w", encoding="utf-8", newline="") as f:
            f.write(css)
    if tool_js.strip():
        with open(os.path.join(DST, f"js/tools/{name}.js"), "w", encoding="utf-8", newline="") as f:
            f.write(tool_js)

    print(f"تم: tools/{name}.html + css/tools/{name}.css + js/tools/{name}.js")
    print(f"  (styles: {len(styles)} — scripts: {len(parts_js)})")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
