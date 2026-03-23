# الطبقة المرجعية

هذه الصفحة تجمع الطبقة الثقيلة والمرجعية.

إذا كان هدفك هو بدء المسار، فارجع أولًا إلى:

```text
docs/START_HERE.md
```

<!-- GENERATED:SECONDARY_SURFACE:BEGIN -->
## فهرس السطح الثانوي

### السطح التشغيلي

| الأمر | العائلة | النمط | الملاحظة |
| --- | --- | --- | --- |
| `/syskit.status` | Inspection | runtime-backed | فحص مباشر لحالة الميزة. |
| `/syskit.healthcheck` | Inspection | runtime-backed | فحص جودة وتتبع صحة المخرجات. |
| `/syskit.sync` | Inspection | runtime-backed | تحكم في المزامنة وحالة التغييرات. |

### السطح الاختياري

| الأمر | العائلة | النمط | الملاحظة |
| --- | --- | --- | --- |
| `/syskit.checklist` | Gate | runtime-backed | طبقة مراجعة قبل التنفيذ أو التسليم. |
| `/syskit.analyze` | Inspection | hybrid | تحليل عميق مع سياسات منفصلة عن التنفيذ. |
| `/syskit.diff` | Inspection | runtime-backed | مقارنة تنفيذية بين الحالة الحالية وآخر خط مزامنة معروف. |
| `/syskit.dashboard` | Portfolio | runtime-backed | طبقة فوقية للتجميع وليس من قلب الحوكمة. |
| `/syskit.metrics` | Portfolio | runtime-backed | يعتمد على بيانات التحليلات الاختيارية. |
| `/syskit.export` | Portfolio | runtime-backed | قدرة تقريرية اختيارية. |
| `/syskit.quickstart` | Admin | hybrid | طبقة تهيئة ذهنية للمستخدم. |
| `/syskit.taskstoissues` | Integration | hybrid | تكامل خارجي اختياري رسميًا. |

الخريطة الكاملة تبقى هنا:

```text
docs/COMMAND_RUNTIME_MAP.md
```
<!-- GENERATED:SECONDARY_SURFACE:END -->

## الوثائق المرجعية

المعمارية:

```text
docs/ARCHITECTURE.md
```

حدود الحزمة:

```text
docs/PACKAGE_BOUNDARY.md
```

القدرات الاختيارية:

```text
docs/OPTIONAL_CAPABILITIES.md
```

التوزيع الرسمي:

```text
docs/DISTRIBUTION.md
```

طبقة السياسات:

```text
docs/policies/README.md
```
