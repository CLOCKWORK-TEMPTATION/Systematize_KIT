# طبقة السياسات الحاكمة

> هذه وثيقة مرجعية.
>
> للبداية التشغيلية:
>
> ```text
> docs/START_HERE.md
> ```

يحتوي هذا المجلد على السياسات الحاكمة الثقيلة التي استُخرجت من ملفات سطح الأوامر مباشرة.

## الغرض

- إبقاء ملفات `commands/*.md` مركزة على التنسيق والتوجيه.
- حفظ النصوص السياسية المستقرة والقابلة لإعادة الاستخدام في طبقة سياسات منفصلة.
- جعل الفصل بين Governance DSL وطبقة السياسات صريحًا داخل المستودع.

## السياسات المستخرجة

- `docs/policies/systematize-policy.md`
- `docs/policies/research-policy.md`
- `docs/policies/tasks-policy.md`
- `docs/policies/analyze-policy.md`
- `docs/policies/checklist-policy.md`
- `docs/policies/implement-policy.md`
- `docs/policies/clarify-policy.md`

## القاعدة التشغيلية

يجب أن يشير كل أمر حوكمة صراحة إلى ملف السياسة المستخرج الخاص به، وأن يعامل تلك السياسة باعتبارها المصدر المعياري للقواعد الثقيلة ومعايير التقييم وعقد المخرجات.
