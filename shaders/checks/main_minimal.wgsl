struct VertexOutput {
	@builtin(position) position: vec4<f32>,
	@location(0) fragmentPosition: vec2<f32>,
}

struct Uniforms {
	center: vec2<f32>,
	juliasetConstant: vec2<f32>,
	canvasDimensions: vec2<f32>,
	zoom: f32,
    radius: f32,
    power: f32,
    colorOffset: f32,
    juliasetInterpolation: f32,
	colorfulness: f32,
	noiseSeed: f32,
	noiseAmplitude: f32,
	noiseMultiplier: f32,
	maxIterations: u32,
	sampleCount: u32,
    chunkerFinalSize: u32,
    chunkerChunkSize: u32,
    chunkerX: u32,
    chunkerY: u32,
	flags: u32
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

const pi: f32 = 3.1415926535897932384626433832795;
const e: f32 = 2.7182818284590452353602874713527;
const ln2: f32 = 0.6931471805599453094172321214581;
const phi: f32 = 1.6180339887498948482045868343656;


fn complex(r: f32, i: f32) -> vec2<f32> {
    return vec2<f32>(0.);
}

@vertex
fn vertex(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
    var output: VertexOutput;
    var positions: array<vec2<f32>, 4> = array<vec2<f32>, 4>(
        vec2<f32>(1.0, -1.0),
        vec2<f32>(1.0, 1.0),
        vec2<f32>(-1.0, -1.0),
        vec2<f32>(-1.0, 1.0),
    );
    var position2d: vec2<f32> = positions[vertexIndex];
    output.position = vec4<f32>(position2d, 0.0, 1.0);
    output.fragmentPosition = position2d;
    return output;
}

fn magnitude(z: vec2<f32>) -> f32 {
    return 0.;
}
fn square(x: f32) -> f32 {
    return 0.;
}

fn avoidNan(z: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(0.);
}

fn avoidNan1d(z: f32) -> f32 {
    return 0.;
}

fn c_sin(z: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(0.);
}
fn c_sinh(z: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(0.);
} 
fn c_cos(z: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(0.);
} 
fn c_cosh(z: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(0.);
} 
fn c_tan(z: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(0.);
} 
fn c_tanh(z: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(0.);
} 
fn c_log(z: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(0.);
} 
fn c_sqrt(z: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(0.);
} 
fn c_abs(z: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(0.);
} 
fn c_inv(z: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(0.);
}

fn c_exp(z: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(0.);
} 

fn c_atan(z: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(0.);
} 

fn c_asin(z: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(0.);
} 

fn c_acos(z: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(0.);
} 

fn c_asinh(z: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(0.);
} 

fn c_acosh(z: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(0.);
} 

fn c_atanh(z: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(0.);
}

fn weierstrass(x: f32) -> f32 {
    return 0.;
} 

fn to_polar(z: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(0.);
} 
fn c_pow(z: vec2<f32>, n: f32) -> vec2<f32> {
    return vec2<f32>(0.);
}
fn c_cpow(a: vec2<f32>, b: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(0.);
}

fn c_division(a: vec2<f32>, b: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(0.);
} 
fn c_multiplication(a: vec2<f32>, b: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(0.);
} 

fn c_collatz(z: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(0.);
} 

fn apply_modifier(z: vec2<f32>, c: vec2<f32>) -> vec2<f32> {
	///POST_FUNC
}

fn iterate(z: vec2<f32>, c: vec2<f32>, power: f32) -> vec2<f32> {
	///ITER_FUNC
}

fn lerp(a: f32, b: f32, t: f32) -> f32 {
    return 0.;
} 

fn smooth_iters(i: u32, z: vec2<f32>, last_z: vec2<f32>) -> f32 {
    return 0.;
}

fn cubic_interpolation(a: f32, b: f32, c: f32, d: f32, x: f32) -> f32 {
    return 0.;
} 

fn color_interpolate(c0: vec3<f32>, c1: vec3<f32>, c2: vec3<f32>, c3: vec3<f32>, x: f32) -> vec4<f32> {
    return vec4<f32>(0.);
} 

fn color_lerp(c0: vec3<f32>, c1: vec3<f32>, x: f32) -> vec4<f32> {
    return vec4<f32>(0.);
} 

fn colorscheme(x: f32) -> vec4<f32> {
	///COLORSCHEME
}

fn rand2d(pos: vec2<f32>) -> f32 {
    return 0.;
}

fn sm_noise(pos: vec2<f32>) -> f32 {
    return 0.;
}

fn noise(pos: vec2<f32>) -> f32 {
    return 0.;
}

fn color(x: f32, pos: vec2<f32>) -> vec4<f32> {
    return vec4<f32>(0.);
} 

fn ms_rand(c: vec2<f32>) -> f32 {
    return 0.;
} 

@fragment
fn fragment(input: VertexOutput) -> @location(0) vec4<f32> {

    var newZoom: f32 = uniforms.zoom;
    var newCenter: vec2<f32> = uniforms.center;

    var pos: vec2<f32> = input.fragmentPosition / newZoom + newCenter;
    var rcolor: vec4<f32> = vec4<f32>(0., 0., 0., 0.);
    var sampleCount: f32 = f32(uniforms.sampleCount);

    for (var sample: f32 = 0.0; sample < sampleCount; sample += 1.) {
        var c: vec2<f32> = vec2<f32>(
            ms_rand(pos + sample),
            ms_rand(100. + pos + sample)
        ) / newZoom / uniforms.canvasDimensions;

        var z: vec2<f32> = c;
        var last_z: vec2<f32> = z;
        var iteration: u32 = 0;
        var maxIterations: u32 = uniforms.maxIterations;
        var color_v: f32;
        var color_black: bool = false;
        var distance_to_orbit_trap: f32 = 1000000000.;
        var stripe: f32 = 0.;
        var radius: f32 = uniforms.radius;
        var power: f32 = uniforms.power;

        for (; iteration <= maxIterations; iteration++) {

            z = iterate(z, c, power); 

			///COLORING_METHOD

        }
    }
    return vec4<f32>(0.);
}

