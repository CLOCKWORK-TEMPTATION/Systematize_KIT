# Systematize Framework for Software Project Governance

إطار حاكم ثقيل للمشروعات البرمجية متعددة المراحل. الهدف ليس جمع أدوات متفرقة، بل فرض عقد تشغيلي واضح يضبط الانتقال من تعريف المشكلة إلى التوضيح والدستور والبحث والتخطيط والمهام ثم التنفيذ والمراجعة.

## أبدأ من أين؟

إذا كان سؤالك الأول هو من أين تبدأ، فابدأ من وثيقة البداية التشغيلية:

```text
docs/START_HERE.md
```

والمدخل الرسمي الوحيد هو:

```text
/syskit.guide
```

هذا المسار يختصر القرار الأول ثم يدفع التفاصيل الثقيلة إلى الطبقة المرجعية عند الحاجة.

## المسار السعيد الافتراضي

ابدأ من:

```text
/syskit.guide
```

ثم اتبع التوصية الوحيدة التالية.

في المستودع المهيأ يكون المسار الكامل الافتراضي:

```text
/syskit.systematize -> /syskit.clarify -> /syskit.constitution -> /syskit.research -> /syskit.plan -> /syskit.tasks -> /syskit.review -> /syskit.implement
```

وإذا لم تكن التهيئة الأولى مكتملة فستكون التوصية الأولى:

```text
/syskit.init
```

## التوزيع الرسمي

الأمر الرسمي:

```text
npm run package:dist
```

## أوامر التحقق

```text
npm run setup:hooks
npm run test
npm run generate:docs
npm run verify
```

يُثبَّت hook المنع المحلي قبل الالتزام تلقائيًا عند تشغيل:

```text
npm ci
```

أو:

```text
npm install
```

ويمكن إعادة تثبيته يدويًا عند الحاجة عبر:

```text
npm run setup:hooks
```

ملف hook المتتبَّع داخل المستودع موجود في:

```text
.Systematize/scripts/hooks/pre-commit
```

ويشغّل:

```text
npm run verify:docs
```

قبل السماح بأي

```text
git commit
```

## الوثائق الرسمية المولدة

- خريطة الربط بين الأوامر والمحرك:
  `docs/COMMAND_RUNTIME_MAP.md`
- شجرة المشروع الفعلية:
  `docs/_project_tree.json`

## الطبقة المرجعية

للوثائق الثقيلة والمرجعية:

```text
docs/REFERENCE.md
```

## مبدأ التوسع

القاعدة الحاكمة من الآن فصاعدًا:

```text
حسم حدود القلب أولًا
ثم فتح قدرات التوسع الاختيارية
```
