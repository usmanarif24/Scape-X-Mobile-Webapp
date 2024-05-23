class Device {
    constructor() {
        this.currentMoving = true;
        this.lastMoving = true;
        this.currentTilted = true;
        this.lastTilted = true;
        this.joined = false;
        this.connected = false;
        this.accelerationFilter = new Vector3Filter();
        this.rotationRateFilter = new Vector3Filter();
        this.onMotionChangedCallbacks = [];
        setInterval(() => this.update(), 1 / 60.0); // 60 fps
    }
    requestPermission() {
        if (typeof (DeviceMotionEvent) !== 'undefined' && typeof (DeviceMotionEvent.requestPermission) === 'function') {
            DeviceMotionEvent.requestPermission()
                .then(response => {
                if (response === 'granted') {
                    window.addEventListener('devicemotion', (event) => this.onMotion(event));
                    this.joined = true;
                }
            })
                .catch(console.error);
        }
        else {
            window.addEventListener('devicemotion', (event) => this.onMotion(event));
            this.joined = true;
        }
        if (typeof (DeviceOrientationEvent) !== 'undefined' && typeof (DeviceOrientationEvent.requestPermission) === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(response => {
                if (response === 'granted') {
                    window.addEventListener('deviceorientation', (event) => this.onOrientation(event));
                    this.joined = true;
                }
            })
                .catch(console.error);
        }
        else {
            window.addEventListener('deviceorientation', (event) => this.onOrientation(event));
            this.joined = true;
        }
    }
    onOrientation(event) {
        this.alpha = event.alpha;
        this.beta = event.beta;
        this.gamma = event.gamma;
    }
    onMotion(event) {
        this.accelerationFilter.filter(event.acceleration.x, event.acceleration.y, event.acceleration.z, performance.now());
        this.rotationRateFilter.filter(event.rotationRate.x, event.rotationRate.y, event.rotationRate.z, performance.now());
        this.acceleration = event.acceleration;
        this.rotationRate = event.rotationRate;
    }
    triggerCallbacks(callbacks) {
        var count = callbacks.length;
        for (var i = 0; i < count; i++) {
            callbacks[i]();
        }
    }
    registerOnMotionChanged(callback) {
        this.onMotionChangedCallbacks.push(callback);
    }
    update() {
        this.lastMoving = this.currentMoving;
        this.lastTilted = this.currentTilted;
        this.currentMoving = false;
        this.currentTilted = false;
        this.currentTilted = this.currentTilted || Math.max(Math.abs(this.beta), Math.abs(this.gamma)) > 5;
        if (this.acceleration != null && this.acceleration !== undefined) {
            var ax = Math.abs(this.acceleration.x);
            var ay = Math.abs(this.acceleration.y);
            var az = Math.abs(this.acceleration.z);
            this.currentMoving = this.currentMoving || Math.max(ax, Math.max(ay, az)) > 1;
        }
        if (this.rotationRate != null && this.rotationRate !== undefined) {
            var rAlpha = Math.abs(this.rotationRate.alpha);
            var rBeta = Math.abs(this.rotationRate.beta);
            var rGamma = Math.abs(this.rotationRate.gamma);
            this.currentMoving = this.currentMoving || Math.max(rAlpha, Math.max(rBeta, rGamma)) > 2;
        }
        if ((!this.currentTilted && this.currentMoving !== this.lastMoving) || (!this.currentMoving && this.currentTilted !== this.lastTilted)) {
            this.triggerCallbacks(this.onMotionChangedCallbacks);
        }
    }
    isMoving() {
        return this.currentMoving;
    }
    isTilted() {
        return this.currentTilted;
    }
}
class LowPassFilter {
    constructor(alpha) {
        this.setAlpha(alpha);
        this.y = null;
        this.s = null;
    }
    setAlpha(alpha) {
        if (alpha <= 0 || alpha > 1.0) {
            throw new Error();
        }
        this.alpha = alpha;
    }
    filter(value, timestamp, alpha) {
        if (alpha) {
            this.setAlpha(alpha);
        }
        let s;
        if (!this.y) {
            s = value;
        }
        else {
            s = this.alpha * value + (1.0 - this.alpha) * this.s;
        }
        this.y = value;
        this.s = s;
        return s;
    }
    lastValue() {
        return this.y;
    }
}
class Vector3Filter {
    constructor(freq, minCutOff = 1.0, beta = 0.0, dCutOff = 1.) {
        this.xFilter = new OneEuroFilter(freq, minCutOff, beta, dCutOff);
        this.yFilter = new OneEuroFilter(freq, minCutOff, beta, dCutOff);
        this.zFilter = new OneEuroFilter(freq, minCutOff, beta, dCutOff);
    }
    filter(x, y, z, timestamp = null) {
        this.xFilter.filter(x, timestamp);
        this.yFilter.filter(y, timestamp);
        this.zFilter.filter(z, timestamp);
    }
}
class OneEuroFilter {
    constructor(freq, minCutOff = 1.0, beta = 0.0, dCutOff = 1.0) {
        if (freq <= 0 || minCutOff <= 0 || dCutOff <= 0) {
            throw new Error();
        }
        this.freq = freq;
        this.minCutOff = minCutOff;
        this.beta = beta;
        this.dCutOff = dCutOff;
        this.x = new LowPassFilter(this.alpha(this.minCutOff));
        this.dx = new LowPassFilter(this.alpha(this.dCutOff));
        this.lasttime = null;
    }
    alpha(cutOff) {
        const te = 1.0 / this.freq;
        const tau = 1.0 / (2 * Math.PI * cutOff);
        return 1.0 / (1.0 + tau / te);
    }
    filter(x, timestamp = null) {
        if (this.lasttime && timestamp) {
            this.freq = 1.0 / (timestamp - this.lasttime);
        }
        this.lasttime = timestamp;
        const prevX = this.x.lastValue();
        const dx = (!prevX) ? 0.0 : (x - prevX) * this.freq;
        const edx = this.dx.filter(dx, timestamp, this.alpha(this.dCutOff));
        const cutOff = this.minCutOff + this.beta * Math.abs(edx);
        return this.x.filter(x, timestamp, this.alpha(cutOff));
    }
}
export { Device };
