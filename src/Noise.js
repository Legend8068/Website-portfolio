// Simplex/Perlin noise implementation for wave animations
export default class Noise {
    constructor(seed) {
        this.grad3 = [[1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0], [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1], [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]];
        this.p = [];
        this.perm = new Array(512);
        this.gradP = new Array(512);
        this.seed(seed || 0);
    }
    seed(seed) {
        if (seed > 0 && seed < 1) seed *= 65536;
        seed = Math.floor(seed);
        if (seed < 256) seed |= seed << 8;
        const p = this.p;
        for (let i = 0; i < 256; i++) {
            let v;
            if (i & 1) v = p[i] ^ (seed & 255);
            else v = p[i] ^ ((seed >> 8) & 255);
            this.perm[i] = this.perm[i + 256] = v;
            this.gradP[i] = this.gradP[i + 256] = this.grad3[v % 12];
        }
        // Initialize permutation
        for (let i = 0; i < 256; i++) this.p[i] = i;
        for (let i = 255; i > 0; i--) {
            seed = (seed * 16807) % 2147483647;
            const n = seed % (i + 1);
            const x = this.p[i];
            this.p[i] = this.p[n];
            this.p[n] = x;
        }
        for (let i = 0; i < 256; i++) {
            this.perm[i] = this.perm[i + 256] = this.p[i];
            this.gradP[i] = this.gradP[i + 256] = this.grad3[this.p[i] % 12];
        }
    }
    fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
    lerp(a, b, t) { return (1 - t) * a + t * b; }
    perlin2(x, y) {
        let X = Math.floor(x), Y = Math.floor(y);
        x -= X; y -= Y;
        X &= 255; Y &= 255;
        const n00 = this.dot2(this.gradP[X + this.perm[Y]], x, y);
        const n01 = this.dot2(this.gradP[X + this.perm[Y + 1]], x, y - 1);
        const n10 = this.dot2(this.gradP[X + 1 + this.perm[Y]], x - 1, y);
        const n11 = this.dot2(this.gradP[X + 1 + this.perm[Y + 1]], x - 1, y - 1);
        const u = this.fade(x);
        return this.lerp(this.lerp(n00, n10, u), this.lerp(n01, n11, u), this.fade(y));
    }
    dot2(g, x, y) { return g[0] * x + g[1] * y; }
}
