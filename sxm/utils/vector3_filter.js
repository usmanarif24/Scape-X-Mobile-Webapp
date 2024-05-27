import { OneEuroFilter } from "./one_euro_filter.js";

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

export { Vector3Filter };