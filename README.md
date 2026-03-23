# إطار

هذا المستودع يقدّم إطار حوكمة وتشغيل للمشروعات البرمجية متعددة المراحل.

الهدف ليس جمع أوامر متناثرة، بل فرض مسار حاكم واضح يبدأ من تعريف المشكلة ثم ينتقل إلى التوضيح والدستور والبحث والتخطيط والمهام والمراجعة والتنفيذ.

## ابدأ من هنا

وثيقة البداية الرسمية:

```text
docs/START_HERE.md
```

المدخل الأول المعتمد:

```text
/syskit.guide
```

<!-- GENERATED:PRIMARY_SURFACE:BEGIN -->
## السطح الأول

هذا السطح يعرض أوامر البداية فقط، ويخفي الطبقات التشغيلية والاختيارية حتى لا يتضخم القرار الأول.

| الأمر | دوره على السطح الأول | حالته |
| --- | --- | --- |
| `/syskit.systematize` | العقد الحاكم الأول لصياغة وثيقة sys. | إلزامي بحسب الحالة |
| `/syskit.init` | أمر الإدارة التأسيسي للقلب. | إلزامي بحسب الحالة |
| `/syskit.guide` | شرح وإرشاد لا تشغيل مباشر. | اختياري |

المسار الإلزامي الكامل بعد نقطة البداية:

```text
/syskit.systematize -> /syskit.clarify -> /syskit.constitution -> /syskit.research -> /syskit.plan -> /syskit.tasks -> /syskit.review -> /syskit.implement
```

أما الأوامر التشغيلية والاختيارية فتوجد في المرجع الثانوي:

```text
docs/REFERENCE.md
```
<!-- GENERATED:PRIMARY_SURFACE:END -->

## أوامر التحقق

```text
npm run setup:hooks
npm run test
npm run generate:docs
npm run verify
npm run package:dist
```

يُعاد تثبيت الحاجز المحلي عند الحاجة عبر:

```text
npm run setup:hooks
```

ملف الحاجز المتتبع:

```text
.Systematize/scripts/hooks/pre-commit
```

وسلسلة التحقق الرسمية التي يشغّلها:

```text
npm run verify
```

## الطبقة المرجعية

إذا أردت الوثائق الثقيلة بدل سطح البداية:

```text
docs/REFERENCE.md
```

## التوزيع الرسمي

الحزمة الرسمية تُبنى عبر:

```text
npm run package:dist
```
