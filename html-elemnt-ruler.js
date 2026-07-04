function startElementRuler(options = {}) {
    const {
        color = '#ff3b30',
        hoverColor = '#007aff',
        hoverFill = 'rgba(0, 122, 255, 0.08)',
        edgeColor = '#ff9500',
        centerColor = '#34c759',
        edgeCenterColor = '#af52de',
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
    let isShiftPressed = false;

    let lastMouseEvent = null;
    let measurements = [];

    const hoverLayer = document.createElementNS(svgNS, 'g');
    const measureLayer = document.createElementNS(svgNS, 'g');

    svg.appendChild(measureLayer);
    svg.appendChild(hoverLayer);

    function getScrollX() {
        return window.scrollX || window.pageXOffset || 0;
    }

    function getScrollY() {
        return window.scrollY || window.pageYOffset || 0;
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function clearHover() {
        hoverLayer.innerHTML = '';
    }

    function clearMeasure() {
        measurements = [];
        firstPoint = null;
        renderMeasurements();
        console.log('Измерения очищены');
    }

    function undoMeasure() {
        if (firstPoint) {
            firstPoint = null;
            renderMeasurements();
            console.log('Выбор первой точки отменён');
            return;
        }

        if (!measurements.length) {
            console.log('Нет измерений для отмены');
            return;
        }

        measurements.pop();
        renderMeasurements();
        console.log('Последнее измерение отменено');
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

    function getPageRect(element) {
        const rect = element.getBoundingClientRect();
        const scrollX = getScrollX();
        const scrollY = getScrollY();

        return {
            left: rect.left + scrollX,
            top: rect.top + scrollY,
            right: rect.right + scrollX,
            bottom: rect.bottom + scrollY,
            width: rect.width,
            height: rect.height
        };
    }

    function rectToViewport(rect) {
        const scrollX = getScrollX();
        const scrollY = getScrollY();

        return {
            left: rect.left - scrollX,
            top: rect.top - scrollY,
            right: rect.right - scrollX,
            bottom: rect.bottom - scrollY,
            width: rect.width,
            height: rect.height
        };
    }

    function pointToViewport(point) {
        return {
            ...point,
            x: point.x - getScrollX(),
            y: point.y - getScrollY()
        };
    }

    function getNearestEdgeData(element, clientX, clientY) {
        const rect = element.getBoundingClientRect();

        const distances = [
            {
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
        return distances[0];
    }

    function getNearestEdgePoint(element, clientX, clientY) {
        const scrollX = getScrollX();
        const scrollY = getScrollY();
        const rect = getPageRect(element);
        const edgeData = getNearestEdgeData(element, clientX, clientY);

        return {
            type: 'edge',
            edge: edgeData.edge,
            label: edgeData.edge,
            element,
            elementLabel: getElementLabel(element),
            rect,
            x: edgeData.x + scrollX,
            y: edgeData.y + scrollY,
            x1: edgeData.x1 + scrollX,
            y1: edgeData.y1 + scrollY,
            x2: edgeData.x2 + scrollX,
            y2: edgeData.y2 + scrollY
        };
    }

    function getEdgeCenterPoint(element, clientX, clientY) {
        const scrollX = getScrollX();
        const scrollY = getScrollY();
        const rect = getPageRect(element);
        const edgeData = getNearestEdgeData(element, clientX, clientY);

        let x = edgeData.x;
        let y = edgeData.y;

        if (edgeData.edge === 'left' || edgeData.edge === 'right') {
            y = rectToViewport(rect).top + rect.height / 2;
        }

        if (edgeData.edge === 'top' || edgeData.edge === 'bottom') {
            x = rectToViewport(rect).left + rect.width / 2;
        }

        return {
            type: 'edge-center',
            edge: edgeData.edge,
            label: `${edgeData.edge} center`,
            element,
            elementLabel: getElementLabel(element),
            rect,
            x: x + scrollX,
            y: y + scrollY,
            x1: edgeData.x1 + scrollX,
            y1: edgeData.y1 + scrollY,
            x2: edgeData.x2 + scrollX,
            y2: edgeData.y2 + scrollY
        };
    }

    function getCenterPoint(element) {
        const rect = getPageRect(element);

        return {
            type: 'center',
            edge: 'center',
            label: 'center',
            element,
            elementLabel: getElementLabel(element),
            rect,
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
    }

    function getPointByMode(element, clientX, clientY, mode = {}) {
        if (mode.centerMode) {
            return getCenterPoint(element);
        }

        if (mode.edgeCenterMode) {
            return getEdgeCenterPoint(element, clientX, clientY);
        }

        return getNearestEdgePoint(element, clientX, clientY);
    }

    function getPointLabel(point) {
        if (point.type === 'center') {
            return 'центр';
        }

        if (point.type === 'edge-center') {
            return `центр ${point.edge}`;
        }

        return point.edge;
    }

    function createSvgElement(name, attrs = {}) {
        const el = document.createElementNS(svgNS, name);

        Object.entries(attrs).forEach(([key, value]) => {
            el.setAttribute(key, value);
        });

        return el;
    }

    function appendLabel(layer, text, x, y, options = {}) {
        const {
            fill = color,
            bg = 'white',
            stroke = fill,
            anchor = 'middle',
            weight = '700',
            paddingX = 6,
            paddingY = 4
        } = options;

        const label = createSvgElement('text', {
            x,
            y,
            fill,
            'font-size': fontSize,
            'font-family': 'Arial, sans-serif',
            'font-weight': weight,
            'text-anchor': anchor
        });

        label.textContent = text;
        layer.appendChild(label);

        const box = label.getBBox();

        const labelBg = createSvgElement('rect', {
            x: box.x - paddingX,
            y: box.y - paddingY,
            width: box.width + paddingX * 2,
            height: box.height + paddingY * 2,
            rx: 5,
            fill: bg,
            stroke,
            'stroke-width': 1
        });

        layer.insertBefore(labelBg, label);

        return { label, labelBg };
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
        const vp = pointToViewport(point);
        const size = 8;

        const hLine = createSvgElement('line', {
            x1: vp.x - size,
            y1: vp.y,
            x2: vp.x + size,
            y2: vp.y,
            stroke: markColor,
            'stroke-width': 2
        });

        const vLine = createSvgElement('line', {
            x1: vp.x,
            y1: vp.y - size,
            x2: vp.x,
            y2: vp.y + size,
            stroke: markColor,
            'stroke-width': 2
        });

        const circle = createSvgElement('circle', {
            cx: vp.x,
            cy: vp.y,
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
        const edgeCenterMode = isShiftPressed && !centerMode;

        const point = getPointByMode(element, clientX, clientY, {
            centerMode,
            edgeCenterMode
        });

        const rect = rectToViewport(point.rect);

        if (rect.width <= 0 || rect.height <= 0) {
            return;
        }

        const activeColor = centerMode
            ? centerColor
            : edgeCenterMode
                ? edgeCenterColor
                : hoverColor;

        const box = createSvgElement('rect', {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
            fill: hoverFill,
            stroke: activeColor,
            'stroke-width': 1,
            'stroke-dasharray': '4 3'
        });

        hoverLayer.appendChild(box);

        if (centerMode) {
            const vp = pointToViewport(point);

            const centerGuideHorizontal = createSvgElement('line', {
                x1: rect.left,
                y1: vp.y,
                x2: rect.right,
                y2: vp.y,
                stroke: centerColor,
                'stroke-width': 1,
                'stroke-dasharray': '3 3'
            });

            const centerGuideVertical = createSvgElement('line', {
                x1: vp.x,
                y1: rect.top,
                x2: vp.x,
                y2: rect.bottom,
                stroke: centerColor,
                'stroke-width': 1,
                'stroke-dasharray': '3 3'
            });

            hoverLayer.appendChild(centerGuideHorizontal);
            hoverLayer.appendChild(centerGuideVertical);
            drawCenterMark(point, hoverLayer, centerColor);
        } else {
            const edgeStart = pointToViewport({ x: point.x1, y: point.y1 });
            const edgeEnd = pointToViewport({ x: point.x2, y: point.y2 });
            const vp = pointToViewport(point);

            const edge = createSvgElement('line', {
                x1: edgeStart.x,
                y1: edgeStart.y,
                x2: edgeEnd.x,
                y2: edgeEnd.y,
                stroke: edgeCenterMode ? edgeCenterColor : edgeColor,
                'stroke-width': 3
            });

            hoverLayer.appendChild(edge);

            if (edgeCenterMode) {
                const diamond = createSvgElement('rect', {
                    x: vp.x - 5,
                    y: vp.y - 5,
                    width: 10,
                    height: 10,
                    fill: 'white',
                    stroke: edgeCenterColor,
                    'stroke-width': 2,
                    transform: `rotate(45 ${vp.x} ${vp.y})`
                });

                hoverLayer.appendChild(diamond);
            } else {
                const dot = createSvgElement('circle', {
                    cx: vp.x,
                    cy: vp.y,
                    r: 4,
                    fill: edgeColor
                });

                hoverLayer.appendChild(dot);
            }
        }

        const modeText = [
            centerMode ? 'ALT: центр элемента' : null,
            edgeCenterMode ? 'SHIFT: центр грани' : null,
            !centerMode && !edgeCenterMode ? 'грань' : null,
            isCtrlPressed ? 'CTRL: ровная линия' : null
        ].filter(Boolean).join(' | ');

        const labelText = `${getElementLabel(element)} | ${Math.round(rect.width)}×${Math.round(rect.height)}px | ${modeText}`;

        appendLabel(
            hoverLayer,
            labelText,
            rect.left,
            Math.max(14, rect.top - 8),
            {
                fill: activeColor,
                stroke: activeColor,
                anchor: 'start'
            }
        );
    }

    function drawPointMarker(point, index, layer = measureLayer) {
        const vp = pointToViewport(point);

        if (point.type === 'center') {
            drawCenterMark(point, layer, color);
        } else if (point.type === 'edge-center') {
            const diamond = createSvgElement('rect', {
                x: vp.x - 6,
                y: vp.y - 6,
                width: 12,
                height: 12,
                fill: 'white',
                stroke: color,
                'stroke-width': 2,
                transform: `rotate(45 ${vp.x} ${vp.y})`
            });

            layer.appendChild(diamond);
        } else {
            const circle = createSvgElement('circle', {
                cx: vp.x,
                cy: vp.y,
                r: 5,
                fill: color,
                stroke: 'white',
                'stroke-width': 2
            });

            layer.appendChild(circle);
        }

        appendLabel(layer, String(index), vp.x + 14, vp.y - 10, {
            fill: 'white',
            bg: color,
            stroke: color,
            anchor: 'middle',
            paddingX: 6,
            paddingY: 3
        });
    }

    function drawMeasurement(item) {
        const layer = measureLayer;

        const pointA = item.pointA;
        const pointB = item.pointB;

        let finalPointB = pointB;
        let modeLabel = '';

        if (item.forceStraight) {
            finalPointB = getAlignedPoint(pointA, pointB);

            if (finalPointB.alignMode === 'horizontal') {
                modeLabel = ' | по X';
            } else {
                modeLabel = ' | по Y';
            }
        }

        const viewA = pointToViewport(pointA);
        const viewB = pointToViewport(pointB);
        const viewFinalB = pointToViewport(finalPointB);

        const dx = Math.round(Math.abs(finalPointB.x - pointA.x));
        const dy = Math.round(Math.abs(finalPointB.y - pointA.y));
        const distance = Math.round(
            Math.sqrt(
                Math.pow(finalPointB.x - pointA.x, 2) +
                Math.pow(finalPointB.y - pointA.y, 2)
            )
        );

        const axisCorner = {
            x: viewFinalB.x,
            y: viewA.y
        };

        if (!item.forceStraight && dx > 0 && dy > 0) {
            const xGuide = createSvgElement('line', {
                x1: viewA.x,
                y1: viewA.y,
                x2: axisCorner.x,
                y2: axisCorner.y,
                stroke: color,
                'stroke-width': 1,
                'stroke-dasharray': '4 4',
                opacity: '0.55'
            });

            const yGuide = createSvgElement('line', {
                x1: axisCorner.x,
                y1: axisCorner.y,
                x2: viewFinalB.x,
                y2: viewFinalB.y,
                stroke: color,
                'stroke-width': 1,
                'stroke-dasharray': '4 4',
                opacity: '0.55'
            });

            layer.appendChild(xGuide);
            layer.appendChild(yGuide);

            appendLabel(layer, `X: ${dx}px`, (viewA.x + axisCorner.x) / 2, axisCorner.y - 8, {
                fill: color,
                stroke: color
            });

            appendLabel(layer, `Y: ${dy}px`, viewFinalB.x + 34, (axisCorner.y + viewFinalB.y) / 2, {
                fill: color,
                stroke: color
            });
        }

        const line = createSvgElement('line', {
            x1: viewA.x,
            y1: viewA.y,
            x2: viewFinalB.x,
            y2: viewFinalB.y,
            stroke: color,
            'stroke-width': strokeWidth
        });

        layer.appendChild(line);

        if (item.forceStraight) {
            const guideLine = createSvgElement('line', {
                x1: viewB.x,
                y1: viewB.y,
                x2: viewFinalB.x,
                y2: viewFinalB.y,
                stroke: color,
                'stroke-width': 1,
                'stroke-dasharray': '4 4',
                opacity: '0.6'
            });

            layer.appendChild(guideLine);
        }

        drawPointMarker(pointA, 1, layer);
        drawPointMarker(pointB, 2, layer);

        const midX = (viewA.x + viewFinalB.x) / 2;
        const midY = (viewA.y + viewFinalB.y) / 2;

        const fromLabel = getPointLabel(pointA);
        const toLabel = getPointLabel(pointB);

        appendLabel(
            layer,
            `${distance}px | X: ${dx}px | Y: ${dy}px${modeLabel} | ${fromLabel} → ${toLabel}`,
            midX,
            midY - 10,
            {
                fill: color,
                stroke: color
            }
        );

        return {
            distance,
            dx,
            dy,
            fromLabel,
            toLabel
        };
    }

    function renderMeasurements() {
        measureLayer.innerHTML = '';

        measurements.forEach(item => {
            drawMeasurement(item);
        });

        if (firstPoint) {
            drawPointMarker(firstPoint, 1, measureLayer);

            const vp = pointToViewport(firstPoint);

            appendLabel(
                measureLayer,
                `Точка 1: ${getPointLabel(firstPoint)}`,
                vp.x,
                vp.y + 28,
                {
                    fill: color,
                    stroke: color
                }
            );
        }
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
        isShiftPressed = event.shiftKey;

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

        const point = getPointByMode(target, event.clientX, event.clientY, {
            centerMode: event.altKey,
            edgeCenterMode: event.shiftKey && !event.altKey
        });

        if (!firstPoint) {
            firstPoint = point;
            renderMeasurements();

            console.log(
                'Первая точка выбрана:',
                getPointLabel(point),
                point.element
            );

            return;
        }

        const measurement = {
            pointA: firstPoint,
            pointB: point,
            forceStraight: event.ctrlKey
        };

        measurements.push(measurement);

        const result = drawMeasurement(measurement);

        console.log(
            'Расстояние:',
            result.distance + 'px',
            'X:',
            result.dx + 'px',
            'Y:',
            result.dy + 'px'
        );
        console.log('От:', result.fromLabel, firstPoint.element);
        console.log('До:', result.toLabel, point.element);

        firstPoint = null;
        renderMeasurements();
    }

    function onKeyDown(event) {
        if (!enabled) return;

        const key = event.key.toLowerCase();

        if (event.key === 'Control') {
            isCtrlPressed = true;
            redrawHoverFromLastMouse();
        }

        if (event.key === 'Alt') {
            isAltPressed = true;
            redrawHoverFromLastMouse();
        }

        if (event.key === 'Shift') {
            isShiftPressed = true;
            redrawHoverFromLastMouse();
        }

        if (event.key === 'Escape') {
            destroy();
        }

        if (key === 'c') {
            clearMeasure();
        }

        if (key === 'z') {
            undoMeasure();
        }
    }

    function onKeyUp(event) {
        if (!enabled) return;

        if (event.key === 'Control') {
            isCtrlPressed = false;
            redrawHoverFromLastMouse();
        }

        if (event.key === 'Alt') {
            isAltPressed = false;
            redrawHoverFromLastMouse();
        }

        if (event.key === 'Shift') {
            isShiftPressed = false;
            redrawHoverFromLastMouse();
        }
    }

    function onScrollOrResize() {
        if (!enabled) return;

        renderMeasurements();
        redrawHoverFromLastMouse();
    }

    function destroy() {
        enabled = false;

        document.removeEventListener('mousemove', onMouseMove, true);
        document.removeEventListener('click', onClick, true);
        document.removeEventListener('keydown', onKeyDown, true);
        document.removeEventListener('keyup', onKeyUp, true);
        window.removeEventListener('scroll', onScrollOrResize, true);
        window.removeEventListener('resize', onScrollOrResize, true);

        svg.remove();

        console.log('JS-линейка выключена');
    }

    document.addEventListener('mousemove', onMouseMove, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('keyup', onKeyUp, true);

    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize, true);

    console.log('HTML-ElementRuler started');

    return {
        destroy,
        clear: clearMeasure,
        undo: undoMeasure
    };
}
