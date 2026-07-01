function startElementRuler(options = {}) {
    const {
        color = '#ff3b30',
        hoverColor = '#007aff',
        hoverFill = 'rgba(0, 122, 255, 0.08)',
        edgeColor = '#ff9500',
        centerColor = '#34c759',
        strokeWidth = 2,
        fontSize = 12,
        zIndex = 999999,
        clearPrevious = true,
        className = 'js-element-ruler-overlay'
    } = options;

    if (clearPrevious) {
        document.querySelectorAll(`.${className}`).forEach(el => el.remove());
    }

    const svgNS = 'http://www.w3.org/2000/svg';

    const svg = document.createElementNS(svgNS, 'svg');
    svg.classList.add(className);

    Object.assign(svg.style, {
        position: 'fixed',
        inset: '0',
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex,
        overflow: 'visible'
    });

    document.body.appendChild(svg);

    let firstPoint = null;
    let enabled = true;
    let isCtrlPressed = false;
    let isAltPressed = false;
    let lastMouseEvent = null;

    const hoverLayer = document.createElementNS(svgNS, 'g');
    const measureLayer = document.createElementNS(svgNS, 'g');

    svg.appendChild(hoverLayer);
    svg.appendChild(measureLayer);

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function clearHover() {
        hoverLayer.innerHTML = '';
    }

    function clearMeasure() {
        measureLayer.innerHTML = '';
        firstPoint = null;
    }

    function getElementLabel(element) {
        let label = element.tagName.toLowerCase();

        if (element.id) {
            label += `#${element.id}`;
        }

        if (element.className && typeof element.className === 'string') {
            const classes = element.className
                .trim()
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 3);

            if (classes.length) {
                label += `.${classes.join('.')}`;
            }
        }

        return label;
    }

    function getNearestEdgePoint(element, clientX, clientY) {
        const rect = element.getBoundingClientRect();

        const distances = [
            {
                type: 'edge',
                edge: 'left',
                distance: Math.abs(clientX - rect.left),
                x: rect.left,
                y: clamp(clientY, rect.top, rect.bottom),
                x1: rect.left,
                y1: rect.top,
                x2: rect.left,
                y2: rect.bottom
            },
            {
                type: 'edge',
                edge: 'right',
                distance: Math.abs(clientX - rect.right),
                x: rect.right,
                y: clamp(clientY, rect.top, rect.bottom),
                x1: rect.right,
                y1: rect.top,
                x2: rect.right,
                y2: rect.bottom
            },
            {
                type: 'edge',
                edge: 'top',
                distance: Math.abs(clientY - rect.top),
                x: clamp(clientX, rect.left, rect.right),
                y: rect.top,
                x1: rect.left,
                y1: rect.top,
                x2: rect.right,
                y2: rect.top
            },
            {
                type: 'edge',
                edge: 'bottom',
                distance: Math.abs(clientY - rect.bottom),
                x: clamp(clientX, rect.left, rect.right),
                y: rect.bottom,
                x1: rect.left,
                y1: rect.bottom,
                x2: rect.right,
                y2: rect.bottom
            }
        ];

        distances.sort((a, b) => a.distance - b.distance);

        return {
            element,
            rect,
            label: distances[0].edge,
            ...distances[0]
        };
    }

    function getCenterPoint(element) {
        const rect = element.getBoundingClientRect();

        return {
            type: 'center',
            edge: 'center',
            label: 'center',
            element,
            rect,
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
    }

    function getPointByMode(element, clientX, clientY, centerMode = false) {
        if (centerMode) {
            return getCenterPoint(element);
        }

        return getNearestEdgePoint(element, clientX, clientY);
    }

    function createSvgElement(name, attrs = {}) {
        const el = document.createElementNS(svgNS, name);

        Object.entries(attrs).forEach(([key, value]) => {
            el.setAttribute(key, value);
        });

        return el;
    }

    function getAlignedPoint(pointA, pointB) {
        const dx = pointB.x - pointA.x;
        const dy = pointB.y - pointA.y;

        if (Math.abs(dx) >= Math.abs(dy)) {
            return {
                ...pointB,
                y: pointA.y,
                alignMode: 'horizontal'
            };
        }

        return {
            ...pointB,
            x: pointA.x,
            alignMode: 'vertical'
        };
    }

    function drawCenterMark(point, layer = hoverLayer, markColor = centerColor) {
        const size = 8;

        const hLine = createSvgElement('line', {
            x1: point.x - size,
            y1: point.y,
            x2: point.x + size,
            y2: point.y,
            stroke: markColor,
            'stroke-width': 2
        });

        const vLine = createSvgElement('line', {
            x1: point.x,
            y1: point.y - size,
            x2: point.x,
            y2: point.y + size,
            stroke: markColor,
            'stroke-width': 2
        });

        const circle = createSvgElement('circle', {
            cx: point.x,
            cy: point.y,
            r: 4,
            fill: 'white',
            stroke: markColor,
            'stroke-width': 2
        });

        layer.appendChild(hLine);
        layer.appendChild(vLine);
        layer.appendChild(circle);
    }

    function drawHover(element, clientX, clientY) {
        clearHover();

        if (!element || element === document.body || element === document.documentElement) {
            return;
        }

        const centerMode = isAltPressed;
        const point = getPointByMode(element, clientX, clientY, centerMode);
        const rect = point.rect;

        if (rect.width <= 0 || rect.height <= 0) {
            return;
        }

        const box = createSvgElement('rect', {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
            fill: hoverFill,
            stroke: centerMode ? centerColor : hoverColor,
            'stroke-width': 1,
            'stroke-dasharray': '4 3'
        });

        hoverLayer.appendChild(box);

        if (centerMode) {
            const centerGuideHorizontal = createSvgElement('line', {
                x1: rect.left,
                y1: point.y,
                x2: rect.right,
                y2: point.y,
                stroke: centerColor,
                'stroke-width': 1,
                'stroke-dasharray': '3 3'
            });

            const centerGuideVertical = createSvgElement('line', {
                x1: point.x,
                y1: rect.top,
                x2: point.x,
                y2: rect.bottom,
                stroke: centerColor,
                'stroke-width': 1,
                'stroke-dasharray': '3 3'
            });

            hoverLayer.appendChild(centerGuideHorizontal);
            hoverLayer.appendChild(centerGuideVertical);
            drawCenterMark(point, hoverLayer, centerColor);
        } else {
            const edge = createSvgElement('line', {
                x1: point.x1,
                y1: point.y1,
                x2: point.x2,
                y2: point.y2,
                stroke: edgeColor,
                'stroke-width': 3
            });

            const dot = createSvgElement('circle', {
                cx: point.x,
                cy: point.y,
                r: 4,
                fill: edgeColor
            });

            hoverLayer.appendChild(edge);
            hoverLayer.appendChild(dot);
        }

        const modeText = [
            centerMode ? 'ALT: центр' : 'грань',
            isCtrlPressed ? 'CTRL: ровная линия' : null
        ].filter(Boolean).join(' | ');

        const labelText = `${getElementLabel(element)} | ${Math.round(rect.width)}×${Math.round(rect.height)}px | ${modeText}`;

        const label = createSvgElement('text', {
            x: rect.left,
            y: Math.max(14, rect.top - 8),
            fill: centerMode ? centerColor : hoverColor,
            'font-size': fontSize,
            'font-family': 'Arial, sans-serif',
            'font-weight': '700'
        });

        label.textContent = labelText;

        hoverLayer.appendChild(label);

        const labelBox = label.getBBox();

        const labelBg = createSvgElement('rect', {
            x: labelBox.x - 5,
            y: labelBox.y - 3,
            width: labelBox.width + 10,
            height: labelBox.height + 6,
            rx: 4,
            fill: 'white',
            stroke: centerMode ? centerColor : hoverColor,
            'stroke-width': 1
        });

        hoverLayer.insertBefore(labelBg, label);
    }

    function drawSelectedPoint(point) {
        if (point.type === 'center') {
            drawCenterMark(point, measureLayer, color);
            return;
        }

        const circle = createSvgElement('circle', {
            cx: point.x,
            cy: point.y,
            r: 5,
            fill: color,
            stroke: 'white',
            'stroke-width': 2
        });

        measureLayer.appendChild(circle);
    }

    function drawLine(pointA, pointB, forceStraight = false) {
        let finalPointB = pointB;
        let distance;
        let modeLabel = '';

        if (forceStraight) {
            finalPointB = getAlignedPoint(pointA, pointB);

            if (finalPointB.alignMode === 'horizontal') {
                distance = Math.round(Math.abs(finalPointB.x - pointA.x));
                modeLabel = ' по X';
            } else {
                distance = Math.round(Math.abs(finalPointB.y - pointA.y));
                modeLabel = ' по Y';
            }
        } else {
            const dx = finalPointB.x - pointA.x;
            const dy = finalPointB.y - pointA.y;

            distance = Math.round(Math.sqrt(dx * dx + dy * dy));
        }

        const line = createSvgElement('line', {
            x1: pointA.x,
            y1: pointA.y,
            x2: finalPointB.x,
            y2: finalPointB.y,
            stroke: color,
            'stroke-width': strokeWidth
        });

        const guideLine = forceStraight
            ? createSvgElement('line', {
                x1: pointB.x,
                y1: pointB.y,
                x2: finalPointB.x,
                y2: finalPointB.y,
                stroke: color,
                'stroke-width': 1,
                'stroke-dasharray': '4 4',
                opacity: '0.6'
            })
            : null;

        const midX = (pointA.x + finalPointB.x) / 2;
        const midY = (pointA.y + finalPointB.y) / 2;

        const label = createSvgElement('text', {
            x: midX,
            y: midY - 8,
            fill: color,
            'font-size': fontSize,
            'font-family': 'Arial, sans-serif',
            'font-weight': '700',
            'text-anchor': 'middle'
        });

        const fromLabel = pointA.type === 'center' ? 'центр' : pointA.edge;
        const toLabel = pointB.type === 'center' ? 'центр' : pointB.edge;

        label.textContent = `${distance}px${modeLabel} | ${fromLabel} → ${toLabel}`;

        measureLayer.appendChild(line);

        if (guideLine) {
            measureLayer.appendChild(guideLine);
        }

        measureLayer.appendChild(label);

        const labelBox = label.getBBox();

        const labelBg = createSvgElement('rect', {
            x: labelBox.x - 5,
            y: labelBox.y - 3,
            width: labelBox.width + 10,
            height: labelBox.height + 6,
            rx: 4,
            fill: 'white',
            stroke: color,
            'stroke-width': 1
        });

        measureLayer.insertBefore(labelBg, label);

        console.log('Расстояние:', distance + 'px' + modeLabel);
        console.log('От:', fromLabel, pointA.element);
        console.log('До:', toLabel, pointB.element);

        return distance;
    }

    function getRealTarget(event) {
        const elements = document.elementsFromPoint(event.clientX, event.clientY);

        return elements.find(el => {
            return el !== svg &&
                !el.classList?.contains(className) &&
                el !== document.body &&
                el !== document.documentElement;
        });
    }

    function redrawHoverFromLastMouse() {
        if (!lastMouseEvent) return;

        const target = getRealTarget(lastMouseEvent);
        drawHover(target, lastMouseEvent.clientX, lastMouseEvent.clientY);
    }

    function onMouseMove(event) {
        if (!enabled) return;

        lastMouseEvent = event;
        isCtrlPressed = event.ctrlKey;
        isAltPressed = event.altKey;

        const target = getRealTarget(event);
        drawHover(target, event.clientX, event.clientY);
    }

    function onClick(event) {
        if (!enabled) return;

        const target = getRealTarget(event);

        if (!target) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        const centerMode = event.altKey;
        const point = getPointByMode(target, event.clientX, event.clientY, centerMode);

        drawSelectedPoint(point);

        if (!firstPoint) {
            firstPoint = point;

            console.log(
                'Первая точка выбрана:',
                point.type === 'center' ? 'центр' : point.edge,
                point.element
            );

            return;
        }

        drawLine(firstPoint, point, event.ctrlKey);
        firstPoint = null;
    }

    function onKeyDown(event) {
        if (event.key === 'Control') {
            isCtrlPressed = true;
            redrawHoverFromLastMouse();
        }

        if (event.key === 'Alt') {
            isAltPressed = true;
            redrawHoverFromLastMouse();
        }

        if (event.key === 'Escape') {
            destroy();
        }

        if (event.key.toLowerCase() === 'c') {
            clearMeasure();
            console.log('Измерения очищены');
        }
    }

    function onKeyUp(event) {
        if (event.key === 'Control') {
            isCtrlPressed = false;
            redrawHoverFromLastMouse();
        }

        if (event.key === 'Alt') {
            isAltPressed = false;
            redrawHoverFromLastMouse();
        }
    }

    function destroy() {
        enabled = false;

        document.removeEventListener('mousemove', onMouseMove, true);
        document.removeEventListener('click', onClick, true);
        document.removeEventListener('keydown', onKeyDown, true);
        document.removeEventListener('keyup', onKeyUp, true);

        svg.remove();

        console.log('JS-линейка выключена');
    }

    document.addEventListener('mousemove', onMouseMove, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('keyup', onKeyUp, true);

    console.log('JS-линейка включена.');
    console.log('Наведи мышь на элемент — увидишь его границы.');
    console.log('Клик 1 — выбрать первую точку.');
    console.log('Клик 2 — выбрать вторую точку.');
    console.log('ALT зажат — выбор центра элемента.');
    console.log('CTRL зажат на втором клике — линия будет строго горизонтальной или вертикальной.');
    console.log('ALT + CTRL — центр элемента + ровная линия.');
    console.log('C — очистить измерения.');
    console.log('Escape — выключить.');

    return {
        destroy,
        clear: clearMeasure
    };
}
