# Systematize Framework for Software Project Governance

إطار حاكم ثقيل للمشروعات البرمجية متعددة المراحل. الهدف ليس جمع أدوات متفرقة، بل فرض عقد تشغيلي واضح يضبط الانتقال من تعريف المشكلة إلى التوضيح والدستور والبحث والتخطيط والمهام ثم التنفيذ والمراجعة.

## الهوية المعمارية

- طبقة الحوكمة:
  `commands/*.md`
- المحرك التنفيذي الرسمي:
  `.Systematize/scripts/node`
- طبقة التوافق:
  `.Systematize/scripts/powershell`
- طبقة التحكم:
  `.Systematize/config`
  و
  `.Systematize/memory`
- طبقة السياسات:
  `docs/policies`
- طبقة القدرات الاختيارية:
  `analytics`
  و
  `alerts`
  و
  `export`
  و
  `taskstoissues`

## حدود الحزمة

يوجد حدّان مقصودان للحزمة:

- الحزمة الجذرية مخصصة للتحقق والتوليد والاختبارات والوثائق.
- الحزمة الداخلية داخل:
  `.Systematize/scripts/node`
  هي محرك التشغيل الرسمي.

الشرح الرسمي لحدود الحزمة موجود في:
`docs/PACKAGE_BOUNDARY.md`

## القدرات الاختيارية

العقد الرسمي للقدرات الاختيارية موجود في:
`docs/OPTIONAL_CAPABILITIES.md`

## طبقة السياسات

العقد الرسمي لفصل السياسة عن الأمر موجود في:
`docs/policies/README.md`

## التوزيع الرسمي

العقد الرسمي للتوزيع وبناء الحزمة موجود في:
`docs/DISTRIBUTION.md`

الأمر الرسمي:

```text
npm run package:dist
```

## أوامر العمل الأساسية

```text
systematize -> clarify -> constitution -> research -> plan -> tasks -> review -> implement
```

## أوامر التحقق

```text
npm run test
npm run generate:docs
npm run verify
```

## الوثائق الرسمية المولدة

- خريطة الربط بين الأوامر والمحرك:
  `docs/COMMAND_RUNTIME_MAP.md`
- شجرة المشروع الفعلية:
  `docs/_project_tree.json`

## مبدأ التوسع

القاعدة الحاكمة من الآن فصاعدًا:

```text
حسم حدود القلب أولًا
ثم فتح قدرات التوسع الاختيارية
```
