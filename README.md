# HTML Element Ruler

**Language:** [Русский](#русская-версия) | [English](#english-version)

---

# Русская версия

## О проекте

**HTML Element Ruler** — это небольшая JavaScript-линейка для измерения расстояний между HTML-элементами прямо на странице.

Инструмент добавляет поверх страницы SVG-оверлей, подсвечивает элемент под курсором, показывает его размеры и позволяет измерять расстояние между гранями или центрами элементов.

Проект удобен для вёрстки, отладки интерфейсов, проверки отступов, сравнения расстояний между блоками и быстрого визуального анализа layout'а без установки расширений.

## Возможности

* подсветка элемента под курсором;
* отображение размеров элемента;
* выбор ближайшей грани элемента;
* измерение расстояния между двумя точками;
* измерение от центра элемента до центра другого элемента;
* режим строго горизонтальной или вертикальной линии;
* отображение расстояния в пикселях;
* очистка измерений;
* отключение линейки без перезагрузки страницы;
* настройка цветов, толщины линий, размера текста и z-index.

## Быстрый старт

Можно подключить скрипт через CDN прямо из консоли браузера:

```js
document.head.appendChild(document.createElement('script')).src = 'https://cdn.jsdelivr.net/gh/kalininDanil17Y/HTML-ElementRuler@87af493/html-elemnt-ruler.min.js';
```

После загрузки запустить линейку:

```js
const ruler = startElementRuler();
```

## Управление

| Действие                | Описание                                               |
| ----------------------- | ------------------------------------------------------ |
| Навести мышь на элемент | Подсветить элемент и показать его размеры              |
| Первый клик             | Выбрать первую точку измерения                         |
| Второй клик             | Выбрать вторую точку и показать расстояние             |
| `Alt`                   | Переключиться на режим выбора центра элемента          |
| `Ctrl`                  | Построить строго горизонтальную или вертикальную линию |
| `Alt + Ctrl`            | Измерить расстояние между центрами по X или Y          |
| `C`                     | Очистить текущие измерения                             |
| `Escape`                | Выключить линейку                                      |

## Режимы измерения

### Измерение между гранями

По умолчанию линейка выбирает ближайшую грань элемента относительно курсора.

Это удобно, когда нужно проверить расстояние между блоками, кнопками, карточками, контейнерами или другими элементами интерфейса.

### Измерение между центрами

Если зажать `Alt`, линейка переключается в режим центра элемента.

В этом режиме отображается центр текущего элемента, а клик выбирает именно центральную точку.

### Ровная линия

Если зажать `Ctrl` во время выбора второй точки, линия будет построена строго по горизонтали или вертикали.

Инструмент сам выберет направление по большей разнице между координатами X и Y.

## Пример использования

```js
const ruler = startElementRuler();
```

Остановить линейку:

```js
ruler.destroy();
```

Очистить измерения:

```js
ruler.clear();
```

## Настройка

Функция `startElementRuler()` принимает объект с настройками:

```js
const ruler = startElementRuler({
  color: '#ff3b30',
  hoverColor: '#007aff',
  hoverFill: 'rgba(0, 122, 255, 0.08)',
  edgeColor: '#ff9500',
  centerColor: '#34c759',
  strokeWidth: 2,
  fontSize: 12,
  zIndex: 999999
});
```

## Параметры

| Параметр        | Описание                                     | Значение по умолчанию      |
| --------------- | -------------------------------------------- | -------------------------- |
| `color`         | Основной цвет линий измерения                | `#ff3b30`                  |
| `hoverColor`    | Цвет подсветки элемента                      | `#007aff`                  |
| `hoverFill`     | Заливка подсвеченного элемента               | `rgba(0, 122, 255, 0.08)`  |
| `edgeColor`     | Цвет активной грани                          | `#ff9500`                  |
| `centerColor`   | Цвет центра элемента                         | `#34c759`                  |
| `strokeWidth`   | Толщина линии измерения                      | `2`                        |
| `fontSize`      | Размер текста подписей                       | `12`                       |
| `zIndex`        | z-index SVG-оверлея                          | `999999`                   |
| `clearPrevious` | Удалять предыдущую линейку при новом запуске | `true`                     |
| `className`     | CSS-класс SVG-оверлея                        | `js-element-ruler-overlay` |

## API

После запуска функция возвращает объект управления:

| Метод       | Описание                                      |
| ----------- | --------------------------------------------- |
| `destroy()` | Полностью выключает линейку и удаляет оверлей |
| `clear()`   | Очищает выбранные точки и линии измерения     |

## Подключение через script tag

```html
<script src="https://cdn.jsdelivr.net/gh/kalininDanil17Y/HTML-ElementRuler@87af493/html-elemnt-ruler.min.js"></script>
<script>
  const ruler = startElementRuler();
</script>
```

## Для чего можно использовать

* проверка расстояний между элементами;
* отладка вёрстки;
* визуальная проверка pixel-perfect интерфейса;
* измерение отступов;
* анализ чужих страниц;
* быстрые замеры без DevTools;
* демонстрация размеров элементов при разработке UI.

## Примечание

Инструмент предназначен в первую очередь для разработки и отладки интерфейсов. Его удобно запускать вручную через консоль браузера или подключать временно на тестовых страницах.

---

# English Version

## About

**HTML Element Ruler** is a small JavaScript ruler for measuring distances between HTML elements directly on a web page.

The tool adds an SVG overlay on top of the page, highlights the element under the cursor, displays its size, and allows measuring distances between element edges or centers.

It is useful for layout debugging, UI inspection, spacing checks, and quick visual analysis without installing browser extensions.

## Features

* highlights the element under the cursor;
* displays element size;
* detects the nearest element edge;
* measures distance between two selected points;
* supports center-to-center measurement;
* supports strictly horizontal or vertical measurements;
* displays distance in pixels;
* allows clearing measurements;
* can be disabled without reloading the page;
* customizable colors, line width, font size, and z-index.

## Quick Start

You can load the script from CDN directly in the browser console:

```js
document.head.appendChild(document.createElement('script')).src = 'https://cdn.jsdelivr.net/gh/kalininDanil17Y/HTML-ElementRuler@87af493/html-elemnt-ruler.min.js';
```

Then start the ruler:

```js
const ruler = startElementRuler();
```

## Controls

| Action                     | Description                                      |
| -------------------------- | ------------------------------------------------ |
| Move mouse over an element | Highlight the element and display its size       |
| First click                | Select the first measurement point               |
| Second click               | Select the second point and display the distance |
| `Alt`                      | Switch to element center mode                    |
| `Ctrl`                     | Draw a strictly horizontal or vertical line      |
| `Alt + Ctrl`               | Measure between element centers by X or Y        |
| `C`                        | Clear current measurements                       |
| `Escape`                   | Disable the ruler                                |

## Measurement Modes

### Edge measurement

By default, the ruler selects the nearest edge of the element based on the cursor position.

This is useful when checking distances between blocks, buttons, cards, containers, or other UI elements.

### Center measurement

Hold `Alt` to switch to center mode.

In this mode, the ruler displays the center of the current element, and clicking selects the center point.

### Straight line measurement

Hold `Ctrl` when selecting the second point to force the line to be strictly horizontal or vertical.

The tool automatically chooses the direction based on the larger difference between the X and Y coordinates.

## Usage Example

```js
const ruler = startElementRuler();
```

Stop the ruler:

```js
ruler.destroy();
```

Clear measurements:

```js
ruler.clear();
```

## Configuration

The `startElementRuler()` function accepts an options object:

```js
const ruler = startElementRuler({
  color: '#ff3b30',
  hoverColor: '#007aff',
  hoverFill: 'rgba(0, 122, 255, 0.08)',
  edgeColor: '#ff9500',
  centerColor: '#34c759',
  strokeWidth: 2,
  fontSize: 12,
  zIndex: 999999
});
```

## Options

| Option          | Description                             | Default                    |
| --------------- | --------------------------------------- | -------------------------- |
| `color`         | Main measurement line color             | `#ff3b30`                  |
| `hoverColor`    | Hover outline color                     | `#007aff`                  |
| `hoverFill`     | Highlight fill color                    | `rgba(0, 122, 255, 0.08)`  |
| `edgeColor`     | Active edge color                       | `#ff9500`                  |
| `centerColor`   | Element center color                    | `#34c759`                  |
| `strokeWidth`   | Measurement line width                  | `2`                        |
| `fontSize`      | Label font size                         | `12`                       |
| `zIndex`        | SVG overlay z-index                     | `999999`                   |
| `clearPrevious` | Remove previous ruler instance on start | `true`                     |
| `className`     | SVG overlay CSS class                   | `js-element-ruler-overlay` |

## API

After initialization, the function returns a control object:

| Method      | Description                                  |
| ----------- | -------------------------------------------- |
| `destroy()` | Disables the ruler and removes the overlay   |
| `clear()`   | Clears selected points and measurement lines |

## Script Tag Usage

```html
<script src="https://cdn.jsdelivr.net/gh/kalininDanil17Y/HTML-ElementRuler@87af493/html-elemnt-ruler.min.js"></script>
<script>
  const ruler = startElementRuler();
</script>
```

## Use Cases

* checking distances between elements;
* debugging layout;
* visual pixel-perfect inspection;
* measuring spacing;
* inspecting existing pages;
* quick measurements without DevTools;
* demonstrating element sizes during UI development.

## Note

This tool is mainly intended for development and UI debugging. It is convenient to run manually from the browser console or temporarily include on test pages.
