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
    return vec2(0.);
}

float magnitude(vec2 z) {
    return 0.;
}

float square(float x) {
    return 0.;
}

vec2 c_division(vec2 a, vec2 b) {
	return vec2(0.);
} 
vec2 c_multiplication(vec2 a, vec2 b) {
	return vec2(0.);
}

vec2 avoidNan(vec2 z) {
    return vec2(0.);
}

float avoidNan1d(float z) {
    return 0.;
}

vec2 c_sin(vec2 z) {
    return vec2(0.);
}
vec2 c_sinh(vec2 z) {
    return vec2(0.);
}
vec2 c_cos(vec2 z) {
    return vec2(0.);
}
vec2 c_cosh(vec2 z) {
    return vec2(0.);
}

vec2 c_tan(vec2 z) {
    return vec2(0.);
}
vec2 c_tanh(vec2 z) {
    return vec2(0.);
}

vec2 c_log(vec2 z) {
    return vec2(0.);
}

vec2 c_sqrt(vec2 z) {
    return vec2(0.);
}

vec2 c_abs(vec2 z) {
    return vec2(0.);
}

vec2 c_inv(vec2 z) {
    return vec2(0.);
}

vec2 c_exp(vec2 z) {
    return vec2(0.);
}

vec2 c_atan(vec2 z) {
    return vec2(0.);
}

vec2 c_asin(vec2 z) {
    return vec2(0.);
}
vec2 c_acos(vec2 z) {
    return vec2(0.);
}
vec2 c_asinh(vec2 z) {
    return vec2(0.);
}
vec2 c_acosh(vec2 z) {
    return vec2(0.);
}

vec2 c_atanh(vec2 z) {
    return vec2(0.);
}

float atan2(float a, float b) {
    return 0.;
}

float weierstrass(float x) {
    return 0.;
}

vec2 to_polar(vec2 z) {
    return vec2(0.);
}

vec2 c_pow(vec2 z, float n) {
    return vec2(0.);
}

vec2 c_cpow(vec2 a, vec2 b) {
    return vec2(0.);
}

vec2 c_collatz(vec2 z) {
    return vec2(0.);
}

float ms_rand(vec2 p) {
	return 0.;
}

vec2 apply_modifier(vec2 z, vec2 c) {
    ///POST_FUNC
}

vec2 iterate(vec2 z, vec2 c, float power) {
    ///ITER_FUNC
}

float lerp(float a, float b, float t) {
    return 0.;
}

float smooth_iters(uint i, vec2 z, vec2 lz) {
    return 0.;
}

float cubic_interpolation(float a, float b, float c, float d, float x) {
    return 0.;
}

vec4 color_interpolate(vec3 c0, vec3 c1, vec3 c2, vec3 c3, float x) {
    return vec4(0.);
}

vec4 color_lerp(vec3 c0, vec3 c1, float x) {
    return vec4(0.);
}

vec4 colorscheme(float x) {
    ///COLORSCHEME
}

float rand2d(vec2 p) {
    return 0.;
}

float sm_noise(vec2 pos) {
    return 0.;
}

float noise(vec2 pos) {
    return 0.;
}

vec4 color(float x, vec2 pos) {
    return vec4(0.);
}


void main() {

    float newZoom = zoom;
    vec2 newCenter = center;
    
    vec2 pos = vertex_position / newZoom + newCenter;
    vec4 rcolor = vec4(0.);

    for (uint nSample = 0u; nSample < sampleCount; nSample++) {
        vec2 c = vec2(
            ms_rand(pos + float(nSample)),
            ms_rand(100. + pos + float(nSample))
        ) / newZoom / canvasDimensions;

        vec2 z = c;
        vec2 last_z = z;
        uint iteration = 0u;
        float color_v = 0.;
        bool color_black = false;
        float distance_to_orbit_trap = 1000000000.;
        float stripe = 0.;

        for (; iteration <= maxIterations; iteration++) {

            z = iterate(z, c, power);

            ///COLORING_METHOD

        }
    }

    fragmentColor = vec4(0.);

}