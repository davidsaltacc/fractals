#version 300 es

#ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
#else
    precision mediump float;
#endif

in vec2 vertex_position;
out vec4 fragmentColor;

uniform vec2 center;
uniform vec2 juliasetConstant;
uniform vec2 canvasDimensions;
uniform float zoom;
uniform float radius;
uniform float power;
uniform float colorOffset;
uniform float juliasetInterpolation;
uniform float colorfulness;
uniform float noiseSeed;
uniform float noiseAmplitude;
uniform float noiseMultiplier;
uniform uint maxIterations;
uniform uint sampleCount;
uniform uint chunkerFinalSize;
uniform uint chunkerChunkSize;
uniform uint chunkerX;
uniform uint chunkerY;
uniform uint flags;

#define pi 3.1415926535897932384626433832795
#define e 2.7182818284590452353602874713527
#define ln2 0.6931471805599453094172321214581
#define phi 1.6180339887498948482045868343656

vec2 complex(float r, float i) {
    return vec2(r, i);
}

float magnitude(vec2 z) {
    return sqrt(z.x * z.x + z.y * z.y);
}

float square(float x) {
    return x * x;
}

vec2 c_division(vec2 a, vec2 b) {
	return vec2((a.x * b.x + a.y * b.y) / (b.x * b.x + b.y * b.y), (a.y * b.x - a.x * b.y) / (b.x * b.x + b.y * b.y));
} 
vec2 c_multiplication(vec2 a, vec2 b) {
	return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

vec2 avoidNan(vec2 z) {
    if (isnan(z.x) || (!(z.x < 0.) && !(z.x >= 0.))) {
        z.x = 1000000000000.;
    }
    if (isnan(z.y) || (!(z.y < 0.) && !(z.y >= 0.))) {
        z.y = 1000000000000.;
    }
    return z;
}

float avoidNan1d(float z) {
    float s = z;
    if (isnan(s) || (!(s < 0.) && !(s >= 0.))) {
        s = 1000000000000.;
    }
    return s;
}

vec2 c_sin(vec2 z) {
    return avoidNan(vec2(sin(z.x) * cosh(z.y), cos(z.x) * sinh(z.y)));
}
vec2 c_sinh(vec2 z) {
    return avoidNan(vec2(sinh(z.x) * cos(z.y), cosh(z.x) * sin(z.y)));
}
vec2 c_cos(vec2 z) {
    return avoidNan(vec2(cos(z.x) * cosh(z.y), -sin(z.x) * sinh(z.y)));
}
vec2 c_cosh(vec2 z) {
    return avoidNan(vec2(cosh(z.x) * cos(z.y), sinh(z.x) * sin(z.y)));
}

vec2 c_tan(vec2 z) {
    return avoidNan(c_division(c_sin(z), c_cos(z)));
}
vec2 c_tanh(vec2 z) {
    return avoidNan(c_division(c_sinh(z), c_cosh(z)));
}

vec2 c_log(vec2 z) {
    float re = sqrt(z.x * z.x + z.y * z.y);
    float im = atan(z.y, z.x);
    if (im > pi) {
        im = im - 2. * pi;
    }
    return vec2(log(re), im);
}

vec2 c_sqrt(vec2 z) {
    float r = length(z);
    float re = sqrt((r + z.x) * 0.5);
    float im = sqrt((r - z.x) * 0.5);
    if (z.y < 0.) {
        im = -im;
    }
    return vec2(re, im);
}

vec2 c_abs(vec2 z) {
    return vec2(abs(z.x), abs(z.y));
}

vec2 c_inv(vec2 z) {
    float n = length(z);
    return vec2(z.x, -z.y) / (n * n);
}

vec2 c_exp(vec2 z) {
    return vec2(cos(z.y), sin(z.y)) * exp(z.x);
}

vec2 c_atan(vec2 z) {

    vec2 i = vec2(0., 1.);
    vec2 o = vec2(1., 0.);

    if (z.x == 0. && z.y == 1.) {
        return vec2(0., 1000000000000.);
    } else if (z.x == -0. && z.y == -1.) {
        return vec2(0., -1000000000000.);
    }
    
    return c_division(c_log(o + c_multiplication(i, z)) - c_log(o - c_multiplication(i, z)), c_multiplication(vec2(2., 0.), i));
}

vec2 c_asin(vec2 z) {
    vec2 i = vec2(0., 1.);
    return c_multiplication(-i, c_log(c_sqrt(vec2(1., 0.) - c_multiplication(z, z)) + c_multiplication(i, z)));
}
vec2 c_acos(vec2 z) {
    vec2 i = vec2(0., 1.);
    return c_multiplication(-i, c_log(c_multiplication(i, c_sqrt(vec2(1., 0.) - c_multiplication(z, z))) + z));
}
vec2 c_asinh(vec2 z) {
    return c_log(z + c_sqrt(vec2(1., 0.) + c_multiplication(z, z)));
}
vec2 c_acosh(vec2 z) {
    vec2 o = vec2(1., 0.);
    vec2 t = vec2(2., 0.);
    return c_multiplication(t, c_log(c_sqrt(c_division(z + o, t)) + c_sqrt(c_division(z - o, t))));
}

vec2 c_atanh(vec2 z) {

    vec2 o = vec2(1., 0.);

    if (z.x == 1. && z.y == 0.) {
        return vec2(1000000000000., 0.);
    } else if (z.x == -1. && z.y == -0.) {
        return vec2(1000000000000., 0.);
    }
    
    return c_division(c_log(o + z) - c_log(o - z), vec2(2., 0.));
}

float atan2(float a, float b) {
    return atan(a, b);
}

float weierstrass(float x) {
    x *= 2.;
    return cos(x) + cos(3. * x) / 2. + cos(9. * x) / 4. + cos(27. * x) / 8. + cos(81. * x) / 16. + cos(243. * x) / 32.;
}

vec2 to_polar(vec2 z) {
    return vec2(length(z), atan(z.y, z.x));
}

vec2 c_pow(vec2 z, float n) {
    vec2 p = to_polar(z);
    float t = n * p.y;
    return pow(p.x, n) * vec2(cos(t), sin(t));
}

vec2 c_cpow(vec2 a, vec2 b) {
    float at2 = atan(a.y, a.x);
    vec2 a2 = vec2(a.x / 2., a.y / 2.);
    float loh = 0.5 * log(a2.x * a2.x + a2.y * a2.y) + ln2;
    float x = exp(b.x * loh - b.y * at2);
    float y = b.y * loh + b.x * at2;
    return vec2(x * cos(y), x * sin(y));
}

vec2 c_collatz(vec2 z) {
    return 0.25 * (vec2(1., 0.) + 4. * z - c_multiplication(1. + 2. * z, c_cos(pi * z)));
}

float ms_rand(vec2 p) {
	return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.547);
}

vec2 apply_modifier(vec2 z, vec2 c) {
    ///POST_FUNC
}

vec2 iterate(vec2 z, vec2 c, float power) {
    ///ITER_FUNC
}

float lerp(float a, float b, float t) {
    return (1. - t) * a + t * b;
}

float smooth_iters(uint i, vec2 z, vec2 lz) {
    return float(i) + log(radius / magnitude(lz)) / log(magnitude(z) / magnitude(lz));
}

float cubic_interpolation(float a, float b, float c, float d, float x) {
    return b + x * (0.5 * c - 0.5 * a) + x * x * (a - 2.5 * b + 2. * c - 0.5 * d) + x * x * x * (-0.5 * a + 1.5 * b - 1.5 * c + 0.5 * d);
}

vec4 color_interpolate(vec3 c0, vec3 c1, vec3 c2, vec3 c3, float x) {
    return vec4(
		cubic_interpolation(c0.r, c1.r, c2.r, c3.r, x), 
		cubic_interpolation(c0.g, c1.g, c2.g, c3.g, x), 
		cubic_interpolation(c0.b, c1.b, c2.b, c3.b, x), 
		1.
	);
}

vec4 color_lerp(vec3 c0, vec3 c1, float x) {
    return vec4(
        lerp(c0.r, c1.r, x), 
		lerp(c0.g, c1.g, x), 
		lerp(c0.b, c1.b, x), 
		1.
    );
}

vec4 colorscheme(float x) {
    ///COLORSCHEME
}

float rand2d(vec2 p) {
    return fract(sin(dot(vec2(mod(p.x, 1000.), mod(p.y, 1000.)), vec2(12.9898, 78.233)) + noiseSeed) * 43758.5453);
}

float sm_noise(vec2 pos) {
    vec2 i = floor(pos);
    vec2 f = fract(pos);
    float a = rand2d(i);
    float b = rand2d(i + vec2(1., 0.));
    float c = rand2d(i + vec2(0., 1.));
    float d = rand2d(i + vec2(1., 1.));
    vec2 u = f * f * (3. - 2. * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1. - u.x) + (d - b) * u.x * u.y - .5;
}

float noise(vec2 pos) {
    if (noiseAmplitude == 0.) {
        return 0.;
    }
    vec2 p = pos + 5.;
    float v = 0.;
    float a = noiseAmplitude * (1.3 - noiseMultiplier);
    for (int i = 0; i < 20; i++) {
        v += a * sm_noise(p);
        p *= mat2( 1.2, .9, -.9, 1.2 );
        a *= noiseMultiplier;
    }
    return v;
}

vec4 color(float x, vec2 pos) {
    return colorscheme(x * colorfulness * (float(maxIterations) / 100.) + noise(pos) + colorOffset);
}


void main() {

    float newZoom = zoom;
    vec2 newCenter = center;

    if (((flags & 2u) >> 1) == 1u) {
        newZoom = zoom * (float(chunkerFinalSize) / float(chunkerChunkSize));
        newCenter += vec2(
            ((float(chunkerX) + float(chunkerChunkSize) / 2.) / float(chunkerFinalSize) * 2. - 1.) / zoom,
            -((float(chunkerY) + float(chunkerChunkSize) / 2.) / float(chunkerFinalSize) * 2. - 1.) / zoom
        );
    }
    
    vec2 pos = vertex_position / newZoom + newCenter;
    vec4 rcolor = vec4(0.);

    for (uint nSample = 0u; nSample < sampleCount; nSample++) {
        vec2 c = vec2(
            ms_rand(pos + float(nSample)),
            ms_rand(100. + pos + float(nSample))
        ) / newZoom / canvasDimensions;
        c += pos;
        if (((flags & 2u) >> 1) != 1u) {
            c = vec2(c.x, -c.y);
        }

        vec2 z = c;
        vec2 last_z = z;
        uint iteration = 0u;
        float color_v = 0.;
        bool color_black = false;
        float distance_to_orbit_trap = 1000000000.;
        float stripe = 0.;

        if ((flags & 1u) == 1u) {
            if (juliasetInterpolation == 1.) {
                c = vec2(juliasetConstant.x, -juliasetConstant.y);
            } else if (juliasetInterpolation != 0.) {
                c = (1. - juliasetInterpolation) * z + juliasetInterpolation * vec2(juliasetConstant.x, juliasetConstant.y * -1.);
            }
        }

        for (; iteration <= maxIterations; iteration++) {

            z = iterate(z, c, power);

            ///COLORING_METHOD

            last_z = z;

        }

        if (color_black) {
            rcolor += vec4(0., 0., 0., 1.);
        } else {
            vec2 noiseO = vec2(0., 0.);
            vec2 noiseD = vec2(1., 1.);
            if (((flags & 2u) >> 1) == 1u) {
                noiseD = vec2(
                    (float(chunkerFinalSize) / float(chunkerChunkSize)),
                    (float(chunkerFinalSize) / float(chunkerChunkSize))
                );
                noiseO = vec2(
                    ((float(chunkerX) + float(chunkerChunkSize) / 2.) / float(chunkerFinalSize) * 2. - 1.) * (float(chunkerFinalSize) / float(chunkerChunkSize)),
                    -((float(chunkerY) + float(chunkerChunkSize) / 2.) / float(chunkerFinalSize) * 2. - 1.) * (float(chunkerFinalSize) / float(chunkerChunkSize))
                ) / noiseD;
            }
            rcolor += color(color_v, vertex_position / noiseD + noiseO);
        }
    }

    fragmentColor = vec4((rcolor / float(sampleCount)).rgb, 1.);

}