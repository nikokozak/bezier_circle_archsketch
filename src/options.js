import noise from './noise.js'

// Application options
export default {

    centerX: 200,
    centerY: 200,
    radius: 200,

    numVertices: 10,

    posXFn: x => Math.sin(x),
    posYFn: y => Math.cos(y),

    controlPointXFn: x => Math.sin(x),
    controlPointYFn: y => Math.cos(y),

    contractionSize: 1,

    cycleSpeed: 60,

    contractionFunc: (i, time) => { return noise(i, i, time) },

    beforeCycle: () => {},

    bgColor: 40,
    traceAmt: 0.2,
    paused: false,

    tweenType: 'elastic',
    tweenDuration: 2,

}

export const cache = {};

export function cacheOptions (options) 
{
    Object.entries(options)
        .reduce((accum, [key, value]) =>
        {
            accum[key] = value;
            return accum;
        }, cache);

    return options;
}

export function diverges (options, optionsCache)
{
    return (options.numVertices != optionsCache.numVertices ||
        options.radius != optionsCache.radius);
}
