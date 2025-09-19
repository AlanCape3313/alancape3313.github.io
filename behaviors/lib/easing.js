// The MIT license notice below applies to the function findIntervalBorderIndex
/* The MIT License (MIT)

Copyright (c) 2015 Boris Chumichev

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import { clamp } from './util.js'

/**
 * Utilizes bisection method to search an interval to which
 * point belongs to, then returns an index of left or right
 * border of the interval
 */
function findIntervalBorderIndex(point, intervals, useRightBorder) {
	// If point is beyond given intervals
	if (point < intervals[0]) return 0
	if (point > intervals[intervals.length - 1]) return intervals.length - 1
	// Start searching on a full range of intervals
	let indexOfNumberToCompare = 0
	let leftBorderIndex = 0
	let rightBorderIndex = intervals.length - 1
	// Reduce searching range till it find an interval point belongs to using binary search
	while (rightBorderIndex - leftBorderIndex !== 1) {
		indexOfNumberToCompare = leftBorderIndex + Math.floor((rightBorderIndex - leftBorderIndex) / 2)
		if (point >= intervals[indexOfNumberToCompare]) {
			leftBorderIndex = indexOfNumberToCompare
		} else {
			rightBorderIndex = indexOfNumberToCompare
		}
	}
	return useRightBorder ? rightBorderIndex : leftBorderIndex
}

function stepRange(steps, stop = 1) {
	if (steps < 2) throw new Error(`steps must be > 2, got: ${steps}`)
	const stepLength = stop / steps
	return Array.from({ length: steps }, (_, i) => i * stepLength)
}

/**
 * Easing utility class (no types in JS)
 */
class Easing {
	static step0(n) {
		return n > 0 ? 1 : 0
	}
	static step1(n) {
		return n >= 1 ? 1 : 0
	}
	static linear(t) {
		return t
	}
	static quad(t) {
		return t * t
	}
	static cubic(t) {
		return t * t * t
	}
	static poly(n) {
		return (t) => Math.pow(t, n)
	}
	static sin(t) {
		return 1 - Math.cos((t * Math.PI) / 2)
	}
	static circle(t) {
		return 1 - Math.sqrt(1 - t * t)
	}
	static exp(t) {
		return Math.pow(2, 10 * (t - 1))
	}
	static elastic(bounciness = 1) {
		const p = bounciness * Math.PI
		return (t) => 1 - Math.pow(Math.cos((t * Math.PI) / 2), 3) * Math.cos(t * p)
	}
	static back(s = 1.70158) {
		return (t) => t * t * ((s + 1) * t - s)
	}
	static bounce(k = 0.5) {
		const q = (x) => (121 / 16) * x * x
		const w = (x) => (121 / 4) * k * Math.pow(x - 6 / 11, 2) + 1 - k
		const r = (x) => 121 * k * k * Math.pow(x - 9 / 11, 2) + 1 - k * k
		const t = (x) => 484 * k * k * k * Math.pow(x - 10.5 / 11, 2) + 1 - k * k * k
		return (x) => Math.min(q(x), w(x), r(x), t(x))
	}
	static in(easing) {
		return easing
	}
	static out(easing) {
		return (t) => 1 - easing(1 - t)
	}
	static inOut(easing) {
		return (t) => {
			if (t < 0.5) {
				return easing(t * 2) / 2
			}
			return 1 - easing((1 - t) * 2) / 2
		}
	}
}

const quart = Easing.poly(4)
const quint = Easing.poly(5)
const backFn = (direction, scalar, t) => direction(Easing.back(1.70158 * scalar))(t)
const elasticFn = (direction, bounciness, t) => direction(Easing.elastic(bounciness))(t)
const bounceFn = (direction, bounciness, t) => direction(Easing.bounce(bounciness))(t)

export const easingFunctions = {
	linear: Easing.linear,
	step(steps, x) {
		const intervals = stepRange(steps)
		return intervals[findIntervalBorderIndex(x, intervals, false)]
	},
	easeInQuad: Easing.in(Easing.quad),
	easeOutQuad: Easing.out(Easing.quad),
	easeInOutQuad: Easing.inOut(Easing.quad),
	easeInCubic: Easing.in(Easing.cubic),
	easeOutCubic: Easing.out(Easing.cubic),
	easeInOutCubic: Easing.inOut(Easing.cubic),
	easeInQuart: Easing.in(quart),
	easeOutQuart: Easing.out(quart),
	easeInOutQuart: Easing.inOut(quart),
	easeInQuint: Easing.in(quint),
	easeOutQuint: Easing.out(quint),
	easeInOutQuint: Easing.inOut(quint),
	easeInSine: Easing.in(Easing.sin),
	easeOutSine: Easing.out(Easing.sin),
	easeInOutSine: Easing.inOut(Easing.sin),
	easeInExpo: Easing.in(Easing.exp),
	easeOutExpo: Easing.out(Easing.exp),
	easeInOutExpo: Easing.inOut(Easing.exp),
	easeInCirc: Easing.in(Easing.circle),
	easeOutCirc: Easing.out(Easing.circle),
	easeInOutCirc: Easing.inOut(Easing.circle),
	easeInBack: backFn.bind(null, Easing.in),
	easeOutBack: backFn.bind(null, Easing.out),
	easeInOutBack: backFn.bind(null, Easing.inOut),
	easeInElastic: elasticFn.bind(null, Easing.in),
	easeOutElastic: elasticFn.bind(null, Easing.out),
	easeInOutElastic: elasticFn.bind(null, Easing.inOut),
	easeInBounce: bounceFn.bind(null, Easing.in),
	easeOutBounce: bounceFn.bind(null, Easing.out),
	easeInOutBounce: bounceFn.bind(null, Easing.inOut)
}

// Object with the same keys as easingFunctions and values of the stringified key names
export const EASING_OPTIONS = Object.fromEntries(
	Object.entries(easingFunctions).map((entry) => [entry[0], entry[0]])
)
Object.freeze(EASING_OPTIONS)
export const EASING_DEFAULT = 'linear'

export function hasArgs(easing = '') {
	return (
		easing.includes('Back') ||
		easing.includes('Elastic') ||
		easing.includes('Bounce') ||
		easing === EASING_OPTIONS.step
	)
}

export function lerp(a, b, t) {
	return a + t * (b - a)
}

export function ease(easing, ...args) {
	const fn = easingFunctions[easing]
	if (!fn) throw new Error(`Unknown easing: ${easing}`)
	return fn(...args)
}

export function linearWave(t) {
	t = t + Math.PI * 600
	return Math.abs(t) % (2 * Math.PI) > Math.PI
		? clamp(-(Math.abs(t) % Math.PI) / Math.PI + 1, 0, 1)
		: clamp((Math.abs(t) % Math.PI) / Math.PI, 0, 1)
}

export function linearInterval(t, i) {
	if (t % i > i - 1) return (t % i) - i + 1
	else if (t % i < 1) return -(t % i) + 1
	else return 0
}