# Equine Coat Atelier
Статичное приложение (HTML/CSS/JS, без сборки и зависимостей кроме Google Fonts).
## Запуск
Откройте `index.html` двойным кликом или `python3 -m http.server`. На GitHub: Settings → Pages → ветка main. Для PNG и Export PNG лучше http(s), не file://.
## Добавление арта
1. Все PNG — одного размера (по умолчанию 1200×900, меняется в `assets/manifest.js`), прозрачные, с одним якорем.
2. Положите файл по пути из `ASSETS.md` (папки уже созданы). Заменять код не нужно — слой появится сам. Нет файла → плейсхолдер + список "Missing PNG" под превью.
3. Другой путь/имя — правьте `assets/manifest.js`. Порядок слоёв — в `phenotype()` (`js/genetics.js`).
## Структура
`js/genetics.js` локусы, инхеританс, фенотип · `js/health.js` здоровье и броски · `js/app.js` UI/рендер/рандомайзер · `tests/` · `GENES.md` таблицы генов и ограничений.
## Тесты / доки
`node tests/genetics.test.js` · `node tools/build-docs.js` (пересоздаёт ASSETS.md, GENES.md, папки).
## Интерфейс
Сверху вкладки-разделы (иконки `assets/ui/cat_*.png`, ~96×96, необязательны), справа плитки-превью, внизу кнопки. Genotype (правый верх) и Genetics/Health (низ) — по желанию. Двойной Frame Overo (O/O) доступен, но требует броска d20 (игровая механика, не ветеринарная статистика).
## Правила игры
- Health: кубики для melanoma (grey, возраст 15+), CSNB, ERU, MCOA, deafness, skin cancer. Все вероятности игровые (FICTIONAL), настраиваются.
- Foal calculator (кнопка внизу): выберите отца и мать (текущая лошадь или сохранённый .json), увидите точные вероятности по локусам и исходы. При скрещивании двух Frame Overo шанс O/O (летальный ген, жеребёнка не будет) = 25%, решает d20 (1–5).
- Кнопка Creative (внизу): снимает ограничения (любые mane-цвета, primitive без dun, любые пары аллелей, double frame overo с предупреждением).
## Арт: горизонтальный PNG и фон
Все PNG лошади — горизонтальные, одного размера (1600×1000, меняется в `assets/manifest.js`), прозрачные. Фон — отдельный PNG `assets/horse/background/background.png` того же размера, рисуется под лошадью (галочка Background под превью). Плейсхолдер: пунктирный силуэт лошади цвета масти на тёмном фоне с подписью.
## Варианты маркировок
Клик по типу (например Blaze) открывает 5 вариантов (Variant 1–5) с кнопками Back/Remove. Файлы: `markings/face/blaze_1.png … blaze_5.png`, `markings/legs/front_left_coronet_1.png …`, `details/belly_spots_1.png …`. Число вариантов — `NV` в `assets/manifest.js`. Полный список — `ASSETS.md`.
## Shade по мастям
Bay: standard, wild, dark, seal brown. Chestnut: standard, liver, light (+ flaxen mane/tail как фенотип без генотипа). Black: standard, sun-bleached.
## Тип, ослы, глаза, грива и хвост
- Первая вкладка Type: draft / riding / show / pony / mule / donkey. Riding использует `assets/horse/`; draft, show, pony, mule сначала ищут файл в `assets/<тип>/` (те же относительные пути), затем берут общий из `assets/horse/` (под превью пишется, сколько слоёв взято из общей папки). Осёл — свой набор вкладок и локусов (MC1R, ASIP, TBX3, KIT, FGF5), арт в `assets/donkey/`. Модель осла упрощённая и помечена в интерфейсе.
- Мул (63 хромосомы) стерилен: в Foal calculator мулов скрещивать нельзя (лошадь × осёл разрешено и даёт мула или лошака).
- Глаза: клик по цвету открывает 8 вариантов; Heterochromia открывает папки Complete и Sectoral, в каждой по 8 вариантов (`eyes/hetero_complete_1.png` и т.д.).
- Вкладка Coat (сразу после Type): длина шерсти short / medium / long. По умолчанию: draft — long; riding, show, pony — short; mule — short (доступны только short и medium); donkey — short (доступны все три). У осла Long в обычном режиме ставит FGF5 lh/lh, а без такого генотипа long недоступна. Арт — необязательные слои `coat/short|medium|long.png` (`assets/donkey/coat/…` для осла).
- Вкладка Mane & tail у лошади идёт четырьмя разделами сверху вниз: Mane (8 видов), Tail (8 видов), Mane colour, Tail colour. Вид гривы и хвоста выбирается независимо; цвета связаны в обычном режиме и раздельны в Creative. Файлы с номером вида: `mane/<цвет>_<1-8>.png`, `tail/<цвет>_<1-8>.png`, контуры `line/mane_<1-8>.png`, `line/tail_<1-8>.png`, пятна `mane_spots/<паттерн>_<1-8>.png`; для перекраски — `mane/neutral_<1-8>.png`, `tail/neutral_<1-8>.png`.
- У осла в Skin & eyes клик по Brown или Blue открывает 3 варианта (`assets/donkey/eyes/brown_1…3.png`, `blue_1…3.png`).
- Цвет гривы и хвоста подбирается автоматически из доступных вариантов по масти (bay/black — black, silver — silver, chestnut — red). В реалистичном режиме грива и хвост связаны; раздельный цвет доступен в Creative.
- Скрещивание лошадь × осёл (Foal calculator): jack × mare = mule, stallion × jenny = hinny. Общие локусы (Extension/MC1R, Agouti/ASIP, Dun/TBX3) наследуются от обоих родителей, у остальных генов осёл передаёт нормальный аллель (задокументированное допущение). Потомок стерилен, дальше его скрещивать нельзя.

## Слойный рендер PNG (js/renderer.js)
Рендер ничего не знает о генетике: `app.js` превращает внешность в spec (список ключей слоёв), `renderer.js` рисует его. Порядок слоёв задаёт только `assets/manifest.js` (`slots`), порядок в spec не важен. Косметика генотип не меняет.

**Порядок (сверху вниз):** mane line → пятна на гриве → цвет гривы → body line → глаза → дилюции / паттерны / отметины → основной цвет → tail line → пятна на хвосте → цвет хвоста. Внутри «дилюции…»: dilutions → patterns (grey, tobiano, leopard…) → markings (primitive, face, legs, details).

**Структура папок** (все пути в `ASSETS.md`):
```
assets/horse/base/  coat/  mane/  tail/  dilutions/  patterns/  primitive/  eyes/  details/
assets/horse/markings/face/  markings/legs/   line/{body,mane,tail}.png
assets/horse/mane_spots/<pattern>.png   tail_spots/<pattern>.png   (необязательные)
assets/horse/background/background.png
assets/<draft|show|pony|mule>/…   (необязательно: тот же путь, что в assets/horse/)
assets/donkey/…
```
**Имена:** строчные, `_` между словами, варианты `_1…_5` (глаза `_1…_8`), ноги `front_left|front_right|hind_left|hind_right`. Имя = ключ из manifest, например `markings/face/blaze_3.png`.

**Подготовка PNG:** все файлы одного размера (1600×1000, `canvas` в manifest), прозрачный фон, одно положение лошади на холсте (слои совпадают пиксель в пиксель), без сжатия поверх альфа-краёв. Линии (`line/*.png`) — только контур на прозрачном фоне, цвет не залит. Слой цвета — закрашенная форма без линий. Пятна на гриве/хвосте — белые области точно по форме гривы/хвоста.

**Перекраска кодом (необязательно):** вместо `base/bay.png`, `base/black.png`, `base/chestnut.png` положите один серый `base/neutral.png` (тени и свет в оттенках серого, белый = полный цвет). Так же `mane/neutral.png` и `tail/neutral.png`. Цвета берутся из `palette` в manifest (hex можно править). Отдельный PNG под ключ всегда главнее перекраски. Яркость/насыщенность (shade) применяется к слою base в любом случае.

**Как добавить новый файл:** положите PNG по пути из manifest. Новый вариант существующего типа — одна строка `add('face.blaze_6','markings/face/blaze_6')` в `assets/manifest.js`. Новый тип слоя — добавьте префикс ключа в нужный `slots`; код рендера менять не нужно. Заново соберите список: `node tools/build-docs.js`.

**Предупреждения:** под превью — отсутствующие PNG (с путём), перекраска, слои из общей папки, необязательные слои, какие группы перерисованы/переиспользованы. В консоли каждое предупреждение пишется один раз.

**Кэш:** картинки и перекрашенные слои кэшируются; слои собраны в группы tail / body / eyes+line / mane, и группа перерисовывается, только если изменились её слои (смена гривы не трогает тело и хвост).

**Look:** кнопки Save look / Load look сохраняют и восстанавливают только внешность (косметика + render spec). Генотип в файл не входит и не меняется.

Тесты: `node tests/genetics.test.js`, `node tests/renderer.test.js` (порядок слоёв, manifest), `node tests/renderer.render.test.js` (композитор на фейковом canvas: кэш групп, перекраска, предупреждения).
