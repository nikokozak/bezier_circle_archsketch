import { cacheOptions, diverges } from './options.js'

export function draw (vertices, context)
{
    const firstVertex = vertices[0];

    context.beginPath();

    context.moveTo(firstVertex.x_pos, firstVertex.y_pos);

    vertices.forEach((vertex, index) =>
        {
            if (index == 0) return;

            context.bezierCurveTo(
                vertex.cp0x,
                vertex.cp0y,
                vertex.cp1x,
                vertex.cp1y,
                vertex.x_pos,
                vertex.y_pos
            );

            context.strokeStyle = 'white';
            context.stroke();
        });
}

export function calculatePosition (radian, options)
{
    return {
        x: options.posXFn(radian) * options.radius + options.centerX,
        y: options.posYFn(radian) * options.radius + options.centerY
    }
}

export function calculateCPPosition (radian, time, options)
{
    return {
        x: options.controlPointXFn(radian, time) * 
        options.radius * 
        (options.contractionFunc(radian, time) * options.contractionSize) + 
        options.centerX,

        y: options.controlPointYFn(radian, time) *
        options.radius * 
        (options.contractionFunc(radian, time) * options.contractionSize) + 
        options.centerY
    }
}

export function rotationStepFor (numVertices)
{
    return (Math.PI * 2) / (numVertices * 2);
}

export function makeBezierVertex (index, radian, time, options)
{
    const xPosition = calculatePosition(radian + rotationStepFor(options.numVertices), options).x;
    const yPosition = calculatePosition(radian + rotationStepFor(options.numVertices), options).y;
    const cpXPosition = calculateCPPosition(radian, time, options).x;
    const cpYPosition = calculateCPPosition(radian, time, options).y;
    const cpNextXPosition = calculateCPPosition(radian, time + 0.1, options).x;
    const cpNextYPosition = calculateCPPosition(radian, time + 0.1, options).y;

    return {
        index: index,
        x_pos: xPosition,
        y_pos: yPosition,
        radian: radian,

        cp0x_orig: cpXPosition,
        cp0y_orig: cpYPosition,
        cp0x: cpXPosition,
        cp0y: cpYPosition,
        cp0x_next: cpNextXPosition,
        cp0y_next: cpNextYPosition,

        cp1x_orig: cpXPosition,
        cp1y_orig: cpYPosition,
        cp1x: cpXPosition,
        cp1y: cpYPosition,
        cp1x_next: cpNextXPosition,
        cp1y_next: cpNextYPosition
    }
}

export function makeFirstVertex (time, options)
{
    return makeBezierVertex(0, -rotationStepFor(options.numVertices), time, options);
}

export function updateBezierVertexControlPoints (vertex, time, options)
{
    const cpNextXPosition = calculateCPPosition(vertex.radian, time, options).x;
    const cpNextYPosition = calculateCPPosition(vertex.radian, time, options).y;

    vertex.cp0x_orig = vertex.cp0x_next;
    vertex.cp0y_orig = vertex.cp0y_next;

    vertex.cp0x = vertex.cp0x_next;
    vertex.cp0y = vertex.cp0y_next;

    vertex.cp0x_next = cpNextXPosition;
    vertex.cp0y_next = cpNextYPosition;

    vertex.cp1x_orig = vertex.cp1x_next;
    vertex.cp1y_orig = vertex.cp1y_next;

    vertex.cp1x = vertex.cp1x_next;
    vertex.cp1y = vertex.cp1y_next;

    vertex.cp1x_next = cpNextXPosition;
    vertex.cp1y_next = cpNextYPosition;

    return vertex;
}

export function tweenControlPoints (vertex, options)
{
    return gsap.fromTo(
        vertex,
        {

            cp0x: vertex.cp0x_orig,
            cp0y: vertex.cp0y_orig,
            cp1x: vertex.cp1x_orig,
            cp1y: vertex.cp1y_orig,

          },
          {

            cp0x: vertex.cp0x_next,
            cp0y: vertex.cp0y_next,
            cp1x: vertex.cp1x_next,
            cp1y: vertex.cp1y_next,
            duration: options.tweenDuration,
            ease: options.tweenType

          }
    );
}

export function makeVertices (time, options)
{
    const result = Array(options.numVertices);
    const step = rotationStepFor(options.numVertices);
    
    result[0] = makeFirstVertex(time, options);
    
    for (let index = 1; index <= options.numVertices; index++)
    {
        const radian = step + (step * 2 * (index - 1));

        result[index] = makeBezierVertex(index, radian, time, options);
        
        result[index].cp_tween = tweenControlPoints(result[index], options);
        result[index].cp_tween.pause();
    }

    return result;

}

export function refreshVertices (vertices, time, options, optionsCache)
{
    if (diverges(options, optionsCache))
    {
        console.log("Vertices or radius changed");

        vertices = makeVertices(time, options);

        cacheOptions(options);
    }

    vertices.forEach((vertex, index) => 
        {
            if (index == 0) return;

            updateBezierVertexControlPoints(vertex, time, options);
            
            vertex.cp_tween = tweenControlPoints(vertex, options);
            vertex.cp_tween.pause();
        });

    return vertices;
}

export function refresh (vertices, time, options, optionsCache)
{
    const internalTimer = (time % options.cycleSpeed) / (options.cycleSpeed - 1);

    if (internalTimer == 0 || diverges(options, optionsCache))
    {
        options.beforeCycle();
        vertices = refreshVertices(vertices, time, options, optionsCache);
    }

    vertices.forEach((vertex, index) => 
        {
            if (index == 0) return; 
            vertex.cp_tween.progress(internalTimer);
        });

    return vertices;
}
