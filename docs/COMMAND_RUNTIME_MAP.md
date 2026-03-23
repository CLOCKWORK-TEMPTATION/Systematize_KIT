# خريطة الربط بين الحوكمة والمحرك

المرجع الرسمي لتصنيف أوامر الإطار الحاكم.

| الأمر | العائلة | المرحلة | الإلزام | الظهور | نمط التنفيذ | الإسناد التنفيذي | الملاحظة |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `systematize` | Gate | phase-01 | mandatory | primary | strong-hybrid | setup-systematize | العقد الحاكم الأول لصياغة وثيقة sys. |
| `clarify` | Gate | phase-02 | mandatory | primary | strong-hybrid | setup-clarify | يعالج الغموض قبل تثبيت الدستور. |
| `constitution` | Gate | phase-03 | mandatory | primary | runtime-backed | generate-constitution | أمر حوكمي مدعوم بمحرك يولد الدستور. |
| `research` | Gate | phase-04 | mandatory | primary | runtime-backed | setup-research | يجهز البحث لكنه يبقى موجّهًا حوكميًا. |
| `plan` | Gate | phase-05 | mandatory | primary | runtime-backed | setup-plan | يربط التخطيط بالبوابات السابقة. |
| `tasks` | Gate | phase-06 | mandatory | primary | runtime-backed | setup-tasks | يفصل التنفيذ إلى مهام تحت الحوكمة. |
| `checklist` | Gate | phase-07 | conditional | optional | runtime-backed | setup-checklist | طبقة مراجعة قبل التنفيذ أو التسليم. |
| `review` | Gate | phase-08 | mandatory | primary | strong-hybrid | setup-review | يبقى قرارًا حوكميًا لا أمر تشغيل. |
| `implement` | Gate | phase-09 | mandatory | primary | strong-hybrid | setup-implement | تنفيذ موجّه بشريًا أو عبر وكيل، لا أمر CLI مستقل. |
| `status` | Inspection | inspection | mandatory | operational | runtime-backed | feature-status | فحص مباشر لحالة الميزة. |
| `healthcheck` | Inspection | inspection | mandatory | operational | runtime-backed | healthcheck | فحص جودة وتتبع صحة المخرجات. |
| `analyze` | Inspection | deep-inspection | optional | optional | hybrid | setup-analyze | تحليل عميق مع سياسات منفصلة عن التنفيذ. |
| `sync` | Inspection | change-control | optional | operational | runtime-backed | update-sync-state | تحكم في المزامنة وحالة التغييرات. |
| `diff` | Inspection | change-control | optional | optional | runtime-backed | setup-diff | مقارنة تنفيذية بين الحالة الحالية وآخر خط مزامنة معروف. |
| `dashboard` | Portfolio | reporting | optional | optional | runtime-backed | export-dashboard | طبقة فوقية للتجميع وليس من قلب الحوكمة. |
| `metrics` | Portfolio | reporting | optional | optional | runtime-backed | record-analytics | يعتمد على بيانات التحليلات الاختيارية. |
| `export` | Portfolio | reporting | optional | optional | runtime-backed | export-dashboard | قدرة تقريرية اختيارية. |
| `init` | Admin | bootstrap | mandatory | primary | runtime-backed | init | أمر الإدارة التأسيسي للقلب. |
| `quickstart` | Admin | onboarding | optional | optional | hybrid | setup-quickstart | طبقة تهيئة ذهنية للمستخدم. |
| `guide` | Admin | onboarding | optional | primary | hybrid | setup-guide | شرح وإرشاد لا تشغيل مباشر. |
| `taskstoissues` | Integration | integration | optional | optional | hybrid | setup-taskstoissues | تكامل خارجي اختياري رسميًا. |

## تفسير الأنماط

- `runtime-backed`: أمر حوكمي أو تقريري يملك جسرًا تنفيذيًا حتميًا داخل المحرك ويصدر قرار قبول أو رفض قابلًا للتحقق.
- `strong-hybrid`: أمر يبقي المحتوى التوليدي جزئيًا، لكن الإدخال والمسارات والتحقق والرفض النهائي محكومة بعقد تنفيذي صارم داخل المحرك.
- `hybrid`: أمر يجمع بين فرض تنفيذي runtime وإنتاج توليدي — المدخلات والمخرجات والبوابات مفروضة تنفيذيًا.

## طبقات الظهور

- `primary`: يظهر على السطح الأول وبدايات الاستخدام.
- `operational`: يظهر في السطح التشغيلي اليومي بعد فهم المسار.
- `optional`: يبقى في الطبقة المرجعية أو الاختيارية ولا يتسرب إلى نقطة البداية.

## تفسير العائلات

- `Gate`: بوابة حوكمة تتحكم في الانتقال بين مراحل العمل.
- `Inspection`: أمر فحص أو رقابة أو متابعة حالة.
- `Portfolio`: أمر تقارير أو رؤية تجميعية فوقية.
- `Admin`: أمر تهيئة أو تشغيل إداري أو تجربة إرشادية.
- `Integration`: أمر يربط الإطار بتكامل خارجي اختياري.
