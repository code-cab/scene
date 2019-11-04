function cssCallback(elem) {
    return (props) => {
        let transform = '';
        if (props.x !== undefined || props.y !== undefined || props.z !== undefined) {
            let x = props.x || 0, y = props.y || 0, z = props.z || 0;
            transform += `translate3d(${x}px,${y}px,${z}px) `;
        }
        if (props.rotate !== undefined) {
            transform += `rotate(${props.rotate}deg) `;
        }
        if (props.scale !== undefined) {
            transform += `scale(${props.scale},${props.scale}) `;
        } else if (props.scalex !== undefined || props.scaley !== undefined) {
            transform += `scale(${props.scalex||1},${props.scaley||1}) `;
        }
        elem.style.transform = transform;

    }
}

export default class Scene {

    constructor(startValue, endValue) {
        this._startValue = startValue;
        this._endValue = endValue;
        this._items = {};
        this._idCount = 1;
    }

    get startValue() {
        return this._startValue;
    }
    set startValue(value) {
        this._startValue = value;
    }
    get endValue() {
        return this._endValue;
    }
    set endValue(value) {
        this._endValue = value;
    }

    /**
     *
     * @param id
     * @param target
     * @param callback
     */
    addItem(idOrTarget, callback) {
        let id;
        let target;
        if (typeof idOrTarget === 'string') {
            id = idOrTarget
        } else if (idOrTarget instanceof HTMLElement) {
            id = `__item_${this._idCount++}__`;
            target = idOrTarget;
            if (!callback) callback = cssCallback(idOrTarget);
        } else {
            id = `__item_${this._idCount++}__`;
            target = idOrTarget;
        }
        this._items[id] = {
            id: id,
            target: target,
            callback: callback,
            steps: [],
            currProps: {},
            props: {}
        }
    }

    setItemValueCallback(idOrTarget, callback) {
        let item = this.getItem(idOrTarget);
        item.valueCallback = callback;
    }

    step(idOrTarget, at, props, opts) {
        let item = this.getItem(idOrTarget);
        item.steps.push({
            at: at,
            props: props,
            opts: opts
        });
        item.steps.sort((a, b) => a.at - b.at);
        item.props = {};
        for (let step of item.steps) {
            for (let prop in step.props) {
                item.props[prop] = true;
            }
        }
    }

    getItem(idOrTarget) {
        let item;
        if (typeof idOrTarget === 'string') {
            item = this._items[idOrTarget];
        } else {
            for (let id in this._items) {
                if (this._items[id].target === idOrTarget) {
                    item = this._items[id];
                    break;
                }
            }
        }
        if (!item) {
            throw new Error("Invalid id or target " + idOrTarget);
        }
        return item;
    }

    animate(value) {
        let phase = (value - this._startValue) / (this._endValue - this._startValue);
        for (let id in this._items) {
            let itemChanged = false;
            let item = this._items[id];
            let v = 0;
            let props = {};
            let stepPhases = {};
            let idx;
            for (let prop in item.props) {
                let prevStep = undefined;
                let nextStep = undefined;
                for (idx = 0; idx < item.steps.length; idx += 1) {
                    let step = item.steps[idx];
                    if (step.props[prop] === undefined) continue;
                    if (value >= step.at) {
                        prevStep = step;
                    }
                    if (value < step.at) {
                        break;
                    }
                }
                if (idx < item.steps.length) {
                    nextStep = item.steps[idx];
                }
                if (!prevStep && nextStep) {
                    // FirstStep
                    prevStep = {
                        at: this.startValue,
                        props: nextStep.props
                    }
                } else if (!nextStep && prevStep) {
                    nextStep = {
                        at: this.endValue,
                        props: prevStep.props
                    }
                }
                let at1 = prevStep.at || 0;
                let at2 = nextStep.at;
                let stepPhase = 1;
                if (at1 !== at2) {
                    stepPhase = (value - at1) / (at2 - at1);
                }
                stepPhases[prop] = stepPhase;
                props[prop] = this._phaseToValue(item, prop, prevStep, nextStep, value, stepPhases[prop]);
                if (props[prop] !== item.currProps[prop]) {
                    item.currProps[prop] = props[prop];
                    itemChanged = true;
                }

            }
            if (itemChanged) {
                if (item.callback) {
                    item.callback(props, id, stepPhases, value);
                } else if (item.target) {
                    for (let prop in props) {
                        item.target[prop] = props[prop];
                    }
                }
            }
        }
    }

    _phaseToValue(item, prop, prevStep, nextStep, phase, stepPhase) {
        let v1 = prevStep.props[prop];
        let v2 = nextStep.props[prop];
        if (nextStep.opts && nextStep.opts['timing']) {
            stepPhase = this._timing(stepPhase, nextStep.opts['timing']);
        }
        let v = (v2 - v1) * stepPhase + v1;
        if (item.valueCallback) {
            let vRet = item.valueCallback(prop, v, stepPhase, v1, v2, phase);
            if (vRet !== undefined) v = vRet;
        }
        return v;
    }

    _timing(stepPhase, timingFunc) {
        let s = timingFunc.split(' ');
        let timingName = s.shift();
        let params = s.map(e => parseFloat(e));
        return timing(stepPhase, timingName, params);
    }
};

function timing(stepPhase, timingName, params) {
    let fn = TIMING[timingName.toLocaleLowerCase()];
    return fn ? fn(stepPhase, params) : stepPhase;
}

/**
 * Ease timings from Tweenjs
 * @see https://github.com/CreateJS/TweenJS/blob/master/src/tweenjs/Ease.js
 *
 */

const TIMING = {
    powin(phase, params) {return Math.pow(phase, params[0]);},
    powout(phase, params) {return 1-Math.pow(1-phase, params[0]);},
    powinout(phase, params) {return phase<0.5?0.5*Math.pow(phase*2, params[0]):1-0.5*Math.abs(Math.pow(2-phase*2, params[0]));},
    ease(phase) {return timing(phase, 'easeinout')},
    easein(phase) {return timing(phase, 'powin', [2])},
    easeout(phase) {return timing(phase, 'powout', [2])},
    easeinout(phase) {return timing(phase, 'powinout', [2])},
    cubin(phase) {return timing(phase, 'powin', [3])},
    cubout(phase) {return timing(phase, 'powout', [3])},
    cubinout(phase) {return timing(phase, 'powinout', [3])},
    sinin(phase) {return 1-Math.cos(phase * Math.PI/2);},
    sinout(phase) {return Math.sin(phase * Math.PI/2);},
    sininout(phase) {return -0.5*(Math.cos(phase * Math.PI) - 1);},
    backin(phase, params) {
        let amount = params[0] || 1.7;
        return phase*phase*((amount+1)*phase-amount);
    },
    backout(phase, params) {
        let amount = params[0] || 1.7;
        return (--phase*phase*((amount+1)*phase + amount) + 1);
    },
    backinout(phase, params) {
        let amount = (params[0] || 1.7)*1.525;
        if ((phase*=2)<1) return 0.5*(phase*phase*((amount+1)*phase-amount));
        return 0.5*((phase-=2)*phase*((amount+1)*phase+amount)+2);
    },
    circin(phase) {return -(Math.sqrt(1-phase*phase)-1);},
    circout(phase) {return Math.sqrt(1-(--phase)*phase)},
    circinout(phase) {
        if ((phase*=2) < 1) return -0.5*(Math.sqrt(1-phase*phase)-1);
        return 0.5*(Math.sqrt(1-(phase-=2)*phase)+1);
    },
    bouncein(phase) {return 1-timing(phase, 'bounceout', [1-phase]);},
    bounceout(phase) {
        if (phase < 1/2.75) {
            return (7.5625*phase*phase);
        } else if (phase < 2/2.75) {
            return (7.5625*(phase-=1.5/2.75)*phase+0.75);
        } else if (phase < 2.5/2.75) {
            return (7.5625*(phase-=2.25/2.75)*phase+0.9375);
        } else {
            return (7.5625*(phase-=2.625/2.75)*phase +0.984375);
        }
    },
    bounceinout(phase) {
        if (phase<0.5) return Ease.bounceIn (phase*2) * .5;
        return Ease.bounceOut(phase*2-1)*0.5+0.5;
    },
    elasticin(phase, params) {
        const amplitude = params[0] || 1;
        const period = params[0] || 0.3;
        const pi2 = Math.PI*2;
        if (phase==0 || phase==1) return phase;
        var s = period/pi2*Math.asin(1/amplitude);
        return -(amplitude*Math.pow(2,10*(phase-=1))*Math.sin((phase-s)*pi2/period));
    },
    elasticout(phase, params) {
        const amplitude = params[0] || 1;
        const period = params[0] || 0.3;
        const pi2 = Math.PI*2;
        if (phase==0 || phase==1) return phase;
        var s = period/pi2 * Math.asin(1/amplitude);
        return (amplitude*Math.pow(2,-10*phase)*Math.sin((phase-s)*pi2/period )+1);
    },
    elasticinout(phase, params) {
        const amplitude = params[0] || 1;
        const period = (params[0] || 0.3) *1.5;
        const pi2 = Math.PI*2;
        const s = period/pi2 * Math.asin(1/amplitude);
        if ((phase*=2)<1) return -0.5*(amplitude*Math.pow(2,10*(phase-=1))*Math.sin( (phase-s)*pi2/period ));
        return amplitude*Math.pow(2,-10*(phase-=1))*Math.sin((phase-s)*pi2/period)*0.5+1;
    }
};