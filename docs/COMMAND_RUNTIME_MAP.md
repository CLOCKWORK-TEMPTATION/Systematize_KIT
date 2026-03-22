# خريطة الربط بين الحوكمة والمحرك

المرجع الرسمي لتصنيف أوامر Systematize Framework for Software Project Governance.

| الأمر | العائلة | المرحلة | الإلزام | نمط التنفيذ | الإسناد التنفيذي | الملاحظة |
| --- | --- | --- | --- | --- | --- | --- |
| `systematize` | Gate | phase-01 | mandatory | llm-only | — | العقد الحاكم الأول لصياغة وثيقة sys. |
| `clarify` | Gate | phase-02 | mandatory | llm-only | — | يعالج الغموض قبل تثبيت الدستور. |
| `constitution` | Gate | phase-03 | mandatory | runtime-backed | generate-constitution | أمر حوكمي مدعوم بمحرك يولد الدستور. |
| `research` | Gate | phase-04 | mandatory | runtime-backed | setup-research | يجهز البحث لكنه يبقى موجّهًا حوكميًا. |
| `plan` | Gate | phase-05 | mandatory | runtime-backed | setup-plan | يربط التخطيط بالبوابات السابقة. |
| `tasks` | Gate | phase-06 | mandatory | runtime-backed | setup-tasks | يفصل التنفيذ إلى مهام تحت الحوكمة. |
| `checklist` | Gate | phase-07 | conditional | llm-only | — | طبقة مراجعة قبل التنفيذ أو التسليم. |
| `review` | Gate | phase-08 | mandatory | llm-only | — | يبقى قرارًا حوكميًا لا أمر تشغيل. |
| `implement` | Gate | phase-09 | mandatory | llm-only | — | تنفيذ موجّه بشريًا أو عبر وكيل، لا أمر CLI مستقل. |
| `status` | Inspection | inspection | mandatory | runtime-backed | feature-status | فحص مباشر لحالة الميزة. |
| `healthcheck` | Inspection | inspection | mandatory | runtime-backed | healthcheck | فحص جودة وتتبع صحة المخرجات. |
| `analyze` | Inspection | deep-inspection | optional | llm-only | — | تحليل عميق مع سياسات منفصلة عن التنفيذ. |
| `sync` | Inspection | change-control | optional | runtime-backed | update-sync-state | تحكم في المزامنة وحالة التغييرات. |
| `diff` | Inspection | change-control | optional | llm-only | — | لا يملك دعم تشغيل رسميًا بعد. |
| `dashboard` | Portfolio | reporting | optional | runtime-backed | export-dashboard | طبقة فوقية للتجميع وليس من قلب الحوكمة. |
| `metrics` | Portfolio | reporting | optional | runtime-backed | record-analytics | يعتمد على بيانات analytics الاختيارية. |
| `export` | Portfolio | reporting | optional | runtime-backed | export-dashboard | قدرة تقريرية اختيارية. |
| `init` | Admin | bootstrap | mandatory | runtime-backed | init | أمر الإدارة التأسيسي للقلب. |
| `quickstart` | Admin | onboarding | optional | llm-only | — | طبقة تهيئة ذهنية للمستخدم. |
| `guide` | Admin | onboarding | optional | llm-only | — | شرح وإرشاد لا تشغيل مباشر. |
| `taskstoissues` | Integration | integration | optional | integration-only | — | تكامل خارجي اختياري رسميًا. |

## تفسير الأنماط

- `llm-only`: أمر حوكمي أو تحليلي بلا أمر تشغيل رسمي مباشر.
- `runtime-backed`: أمر حوكمي أو تقريري مرتبط بأمر فعلي داخل محرك Node.
- `integration-only`: قدرة تكامل خارجية اختيارية وليست جزءًا من القلب.

## تفسير العائلات

- `Gate`: بوابة حوكمة تتحكم في الانتقال بين مراحل العمل.
- `Inspection`: أمر فحص أو رقابة أو متابعة حالة.
- `Portfolio`: أمر تقارير أو رؤية تجميعية فوقية.
- `Admin`: أمر تهيئة أو تشغيل إداري أو تجربة إرشادية.
- `Integration`: أمر يربط الإطار بتكامل خارجي اختياري.

