const METADATA = {
    version: "0.6",
    plugin_version: "7"
};

var DEBUG_MODE = false;

const FRACTALS = {

    MANDELBROT: {
        name: "mandelbrot",
        radius: 10000000,
        description: "mandelbrot_desc",
        formula: "z<sub>n+1</sub> = z<sub>n</sub><sup>POWER</sup> + c",
        shader: "mandelbrot"
    },
    BURNING_SHIP: {
        name: "burning_ship",
        radius: 10000000,
        description: "burning_ship_desc",
        formula: "z<sub>n+1</sub> = (|Re(z<sub>n</sub><sup>POWER</sup>)| + Im(z<sub>n</sub><sup>POWER</sup>)i) + c",
        shader: "burning_ship"
    },
    CELTIC: {
        name: "celtic",
        radius: 10000000,
        description: "celtic_desc",
        formula: "z<sub>n+1</sub> = (Re(z<sub>n</sub><sup>POWER</sup>) + |Im(z<sub>n</sub><sup>POWER</sup>)|i) + c",
        shader: "celtic"
    },
    BUFFALO: {
        name: "buffalo",
        radius: 10000000,
        description: "buffalo_desc",
        formula: "z<sub>n+1</sub> = (|Re(z<sub>n</sub><sup>POWER</sup>)| + |Im(z<sub>n</sub><sup>POWER</sup>)|i) + c",
        shader: "buffalo"
    },
    TRICORN: {
        name: "tricorn",
        radius: 10000000,
        description: "tricorn_desc",
        formula: "z<sub>n+1</sub> = (-Re(z<sub>n</sub><sup>POWER</sup>) + Im(z<sub>n</sub><sup>POWER</sup>)i) + c",
        shader: "tricorn"
    },
    DUCK: {
        name: "duck",
        radius: 10000000,
        description: "duck_desc",
        formula: "polar = toPolar(z<sub>n</sub>)<br>r = Re(polar)<sup>POWER</sup><br>t = POWER * |Im(polar)|;<br>z<sub>n+1</sub> = (r * cos(t) + i * r * sin(t)) + c",
        shader: "duck"
    },
    ASS: {
        name: "b_fractal",
        radius: 10000000,
        description: "b_fractal_desc",
        formula: "x<sub>n+1</sub> = x<sub>n</sub><sup>3</sup> - y<sub>n</sub><sup>2</sup> * abs(y<sub>n</sub>) + c<sub>x</sub><br>y<sub>n+1</sub> = 2 * x<sub>n</sub> * y<sub>n</sub> + c<sub>y</sub>",
        shader: "ass"
    },
    SINE: {
        name: "sine",
        radius: 50,
        description: "sine_desc",
        formula: "z<sub>n+1</sub> = sin(z)<sup>POWER</sup> + c",
        shader: "sine"
    },
    POPCORN: {
        name: "popcorn",
        radius: 2,
        description: "popcorn_desc",
        formula: "x<sub>n+1</sub> = x<sub>n</sub> - c<sub>x</sub> * (y<sub>n</sub> + tan(3 * y<sub>n</sub>))<br>y<sub>n+1</sub> = y<sub>n</sub> - c<sub>y</sub> * (x<sub>n</sub> + tan(3 * x<sub>n</sub>))",
        shader: "popcorn"
    },
    THORN: {
        name: "thorn",
        radius: 10000000,
        description: "thorn_desc",
        formula: "x<sub>n+1</sub> = x<sub>n</sub> / cos(y<sub>n</sub>) + c<sub>x</sub><br>y<sub>n+1</sub> = y<sub>n</sub> / sin(x<sub>n</sub>) + c<sub>y</sub>",
        shader: "thorn"
    },
    HENON: {
        name: "henon",
        radius: 20000,
        description: "henon_desc",
        formula: "x<sub>n+1</sub> = 1 - c<sub>x</sub> * x<sub>n</sub><sup>2</sup> + y<sub>n</sub><br>x<sub>n+1</sub> = c<sub>y</sub> * x<sub>n</sub>",
        shader: "henon"
    },
    DUFFING: {
        name: "duffing",
        radius: 200,
        description: "duffing_desc",
        formula: "x<sub>n+1</sub> = y<sub>n</sub><br>y<sub>n+1</sub> = -1 * c<sub>y</sub> * x<sub>n</sub> + c<sub>x</sub> * y<sub>n</sub> - y<sub>n</sub><sup>3</sup>",
        shader: "duffing"
    },
    CHIRIKOV: {
        name: "chirikov",
        radius: 100, 
        description: "chirikov_desc",
        formula: "x<sub>n+1</sub> = x<sub>n</sub> + c<sub>x</sub> * y<sub>n</sub><br>y<sub>n+1</sub> = y<sub>n</sub> + c<sub>y</sub> * sin(x<sub>n</sub>)",
        shader: "chirikov"
    },
    IKEDA: {
        name: "ikeda",
        radius: 20000,
        description: "ikeda_desc",
        formula: "t = 0.4 - 6 / (1 + x<sub>n</sub><sup>2</sup> + y<sub>n</sub><sup>2</sup>)<br>x<sub>n+1</sub> = 1 + c<sub>x</sub> * (x<sub>n</sub> * cos(t) - y<sub>n</sub> * sin(t))<br>x<sub>n+1</sub> = c<sub>y</sub> * (x<sub>n</sub> * sin(t) + y<sub>n</sub> * cos(t))",
        shader: "ikeda"
    },
    FEATHER: {
        name: "feather",
        radius: 50, 
        description: "feather_desc",
        formula: "z<sub>n</sub><sup>3</sup> / (1 + (Re(z)<sup>2</sup> + i * Im(z)<sup>2</sup>)) + c",
        shader: "feather"
    },
    HEART: {
        name: "heart",
        radius: 10000000,
        description: "heart_desc",
        formula: "x<sub>n+1</sub> = 2 * x<sub>n</sub> * y<sub>n</sub> + c<sub>x</sub><br>y<sub>n+1</sub> = |y<sub>n</sub>| - |x<sub>n</sub>| + c<sub>y</sub>",
        shader: "heart"
    },
    ASS_2: {
        name: "sunglasses",
        radius: 10000,
        description: "sunglasses_desc",
        formula: "x<sub>n+1</sub> = sinh(x<sub>n</sub>) * sin(y<sub>n</sub>) + c<sub>x</sub><br>y<sub>n+1</sub> = cosh(y<sub>n</sub>) * cos(x<sub>n</sub>) + c<sub>y</sub>",
        shader: "ass_2"
    },
    TRIANGLE: {
        name: "triangle",
        radius: 10000,
        description: "triangle_desc",
        formula: "x<sub>n+1</sub> = sin(x<sub>n</sub>) * sinh(y<sub>n</sub>) + c<sub>x</sub><br>y<sub>n+1</sub> = cos(y<sub>n</sub>) * cosh(x<sub>n</sub>) + c<sub>y</sub>",
        shader: "triangle"
    },
    SHARK_FIN: {
        name: "shark_fin",
        radius: 10000000,
        description: "shark_fin_desc",
        formula: "x<sub>n+1</sub> = x<sub>n</sub><sup>2</sup> - |y<sub>n</sub>| * y<sub>n</sub><br>y<sub>n+1</sub> = 2 * x<sub>n</sub> * y<sub>n</sub>",
        shader: "shark_fin"
    },
    TIPPETS: {
        name: "tippets",
        radius: 10000000,
        description: "tippets_desc",
        formula: "x<sub>n+1</sub> = x<sub>n</sub><sup>2</sup> - y<sub>n</sub><sup>2</sup> + c<sub>x</sub><br>y<sub>n+1</sub> = 2 * x<sub>n+1</sub> * y<sub>n</sub> + c<sub>y</sub>",
        shader: "tippets"
    },
    ZUBIETA: {
        name: "zubieta",
        radius: 10000000,
        description: "zubieta_desc",
        formula: "z<sub>n+1</sub> = z<sup>POWER</sup> + c / z",
        shader: "zubieta"
    },
    SINH: {
        name: "hyperbolic_sine",
        radius: 70,
        description: "hyperbolic_sine_desc",
        formula: "z<sub>n+1</sub> = sinh(z)<sup>POWER</sup> + c",
        shader: "sinh"
    },
    UNNAMED_1: {
        name: "unnamed_1",
        radius: 10000000,
        description: "unnamed_1_desc",
        formula: "z<sub>n+1</sub> = z<sub>n</sub><sup>POWER</sup> - (-z)<sup>c<sub>x</sub></sup> + c<sub>y</sub>",
        shader: "unnamed_1"
    },
    UNNAMED_2: {
        name: "unnamed_2",
        radius: 10000000,
        description: "unnamed_2_desc",
        formula: "z<sub>n+1</sub> = (z<sub>n</sub> - (z<sub>n</sub><sup>3</sup> - 1) / (3 * z<sub>n</sub><sup>2</sup>))<sup>POWER</sup> + c",
        shader: "unnamed_2"
    },
    UNNAMED_3: {
        name: "unnamed_3",
        radius: 10000000,
        description: "unnamed_3_desc",
        formula: "((z<sub>n</sub><sup>2</sup> + c - 1) / (z * (2 + 2i) + c - 2))<sup>POWER</sup>",
        shader: "unnamed_3"
    },
    FISH: {
        name: "fish",
        radius: 10000000,
        description: "fish_desc",
        formula: "x<sub>n+1</sub> = |x<sub>n</sub> - y<sub>n</sub>|<br>y<sub>n+1</sub> = 2 * x<sub>n</sub> * y<sub>n</sub>",
        shader: "fish"
    },
    WAVY: {
        name: "wavy",
        radius: 10000000,
        description: "wavy_desc",
        formula: "a = y<sub>n</sub> + 1 - (1.4 + sin(y<sub>n</sub>  * pi) * 0.4 + c<sub>x</sub>) * x<sub>n</sub><sup>2</sup><br>b = (0.3 + cos((x<sub>n</sub> + y<sub>n</sub>) * pi) * 0.2 + c<sub>y</sub>) * a<br>x<sub>n+1</sub> = (4 + cos(x<sub>n</sub> * pi) * 3 + (c<sub>x</sub> + c<sub>y</sub>)) * a * (1 - a)<br>y<sub>n+1</sub> = b",
        shader: "wavy"
    },
    COLLATZ: {
        name: "collatz",
        radius: 20,
        description: "collatz_desc",
        formula: "z<sub>n+1</sub> = 0.25 * (1 + 4 * z<sub>n</sub> - (1 + 2 * z<sub>n</sub>) * cos(pi * z<sub>n</sub>)) + c",
        shader: "collatz"
    },
    UNNAMED_4: {
        name: "unnamed_4",
        radius: 10000000,
        description: "unnamed_4_desc",
        formula: "z<sub>n+1</sub> = ((Im(z<sub>n</sub>) - sign(Re(z<sub>n</sub>)) * sqrt(|Im(c) * Re(z<sub>n</sub>) - (Re(c) + Im(c))|)) + i(Re(c) - Re(z<sub>n</sub>)))<sup>POWER</sup>",
        shader: "unnamed_4"
    },
    SEPTAGON: {
        name: "septagon",
        radius: 10,
        description: "septagon_desc",
        formula: "z<sub>n+1</sub> = (z<sub>n</sub><sup>7</sup> + (c<sub>x</sub>/c<sub>y</sub> + i(c<sub>x</sub>/c<sub>y</sub>))) / z<sub>n</sub>",
        shader: "septagon"
    },
    UNNAMED_5: {
        name: "unnamed_5",
        radius: 10000000,
        description: "unnamed_5_desc",
        formula: "z<sub>n+1</sub> = z<sub>n</sub><sup>POWER</sup> + ((|Re(z)| + i|Im(z)|) + i) / ((|Re(z)| + i|Im(z)|) + 1) + c",
        shader: "unnamed_5"
    },
    UNNAMED_6: {
        name: "unnamed_6",
        radius: 1000000,
        description: "unnamed_6_desc",
        formula: "z<sub>n+1</sub> = (z<sub>n</sub><sup>4</sup> + (1 + i * Re(c))) / (z<sub>n</sub><sup>2</sup> + (1 + i * Im(c)))",
        shader: "unnamed_6"
    },
    CACTUS: {
        name: "cactus",
        radius: 10000000,
        description: "cactus_desc",
        formula: "z<sub>n+1</sub> = z<sub>n</sub><sup>3</sup> + (c - 1) * z<sub>n</sub> - c",
        shader: "cactus"
    },
    UNNAMED_7: {
        name: "unnamed_7",
        radius: 10,
        description: "unnamed_7_desc",
        formula: "t = c * z<sub>n</sub><sup>2</sup> * (z<sub>n</sub><sup>2</sup> + 1) / (z<sub>n</sub><sup>2</sup> - 1)<sup>2</sup><br>z<sub>n+1</sub> = (Re(t) - Im(t)) / |t|<sup>2</sup>",
        shader: "unnamed_7"
    },
    POWER_CIRCLE: {
        name: "power_circle",
        radius: 16,
        description: "power_circle_desc",
        formula: "z<sub>n+1</sub> = z<sub>n</sub><sup>c</sup>",
        shader: "power_circle"
    },
    BITTEN_MANDELBROT: {
        name: "bitten_mandelbrot",
        radius: 10000000,
        description: "bitten_mandelbrot_desc",
        formula: "z<sub>n+1</sub> = (z + c)<sup>POWER</sup> - c / (z + i)",
        shader: "bitten_mandelbrot"
    },
    UNNAMED_8: {
        name: "unnamed_8",
        radius: 10000000,
        description: "unnamed_8_desc",
        formula: "z<sub>n+1</sub> = (sqrt(z<sub>n</sub><sup>2</sup> / c) - c / z<sub>n</sub><sup>2</sup>)<sup>POWER</sup> * 0.5",
        shader: "unnamed_8"
    },
    UNNAMED_9: {
        name: "unnamed_9",
        radius: 30,
        description: "unnamed_9_desc",
        formula: "z<sub>n+1</sub> = (log((Im(z<sub>n</sub>) + i * Re(z<sub>n</sub>)) * c + c))<sup>3</sup>",
        shader: "unnamed_9"
    },
    SMALL_BROT: {
        name: "smallbrot",
        radius: 30,
        description: "smallbrot_desc",
        formula: "z<sub>n+1</sub> = z<sub>n</sub><sup>POWER</sup> + c * 2",
        shader: "small_brot"
    },
    MAGNET: {
        name: "magnet",
        radius: 10000000,
        description: "magnet_desc",
        formula: "((z<sub>n</sub><sup>POWER</sup> + c - 1) / (2 * z<sub>n</sub> + c - 2))<sup>POWER</sup>",
        shader: "magnet"
    },
    TREE: {
        name: "tree",
        radius: 10,
        description: "tree_desc",
        formula: "z<sub>n+1</sub> = sqrt(z<sub>n</sub><sup>POWER+1</sup>) + c",
        shader: "tree"
    },
    UNNAMED_10: {
        name: "unnamed_10",
        radius: 10000000,
        description: "unnamed_10_desc",
        formula: "z<sub>n+1</sub> = z<sub>n</sub><sup>3</sup> + z<sub>n</sub> + c",
        shader: "unnamed_10"
    },
    NOT_MANDELBROT: {
        name: "not_mandelbrot",
        radius: 10000000,
        description: "not_mandelbrot_desc",
        formula: "z<sub>n+1</sub> = (((1 - i) * z<sub>n</sub>) / 2) * (((1 + i) * (z<sub>n</sub> - 1)) / 2) + c",
        shader: "not_mandelbrot"
    },
    SIERPINSKY: {
        name: "sierpinsky",
        radius: 1000000000000000,
        description: "sierpinsky_desc",
        formula: "if (Im(z<sub>n</sub>) > 0.5) then: z<sub>n+1</sub> = (2 * Re(z<sub>n</sub>) + i * 2 * Im(z<sub>n</sub>) - 1) <br>else if (Re(z<sub>n</sub>) > 0.5) then: z<sub>n+1</sub> = (2 * Re(z<sub>n</sub>) - 1, i* 2 * Im(z<sub>n</sub>)) <br>else: z<sub>n+1</sub> = (2 * Re(z<sub>n</sub>) + i * 2 * Im(z<sub>n</sub>))",
        shader: "sierpinsky"
    },
    BARNSLEY: {
        name: "barnsley",
        radius: 10,
        description: "barnsley_desc",
        formula: "z<sub>n+1</sub> = (z<sub>n</sub> - sign(Re(z<sub>n</sub>))) * c",
        shader: "barnsley"
    },
    STRUCTURE_IN_EMPTINESS: {
        name: "structure_in_emptiness",
        radius: 10000000,
        description: "structure_in_emptiness_desc",
        formula: "z<sub>n+1</sub> = z<sub>n</sub><sup>POWER</sup> + z<sub>n</sub><sup>-2*POWER</sup> + c",
        shader: "structure_in_emptiness"
    },
    UNNAMED_11: {
        name: "unnamed_11",
        radius: 10000000,
        description: "unnamed_11_desc",
        formula: "z<sub>n+1</sub> = (Re(c) * Im(z<sub>n</sub>) + Im(c) + i * (Im(c) * Re(x) + Re(c)))<sup>POWER</sup> + z<sub>n</sub><sup>POWER</sup> + c",
        shader: "unnamed_11"
    },
    UNNAMED_12: {
        name: "unnamed_12",
        radius: 10000000,
        description: "unnamed_12_desc",
        formula: "z<sub>n+1</sub> = Re(c) * Re(z<sub>n</sub>)<sup>2</sup> - sin(Im(z<sub>n</sub>)<sup>2</sup>) + |Im(z<sub>n</sub>) - Re(z<sub>n</sub>)| + i * (Im(c) * (Im(z<sub>n</sub>)<sup>3</sup>) - cos(Re(z<sub>n</sub>)<sup>2</sup>) + 2 * Re(z<sub>n</sub>))",
        shader: "unnamed_12"
    },
    WTF: {
        name: "what",
        radius: 10000000,
        description: "what_desc",
        formula: "z<sub>n+1</sub> = c * z<sub>n</sub><sup>POWER</sup> + c",
        shader: "wtf"
    },
    UNNAMED_13: {
        name: "unnamed_13",
        radius: 10000000,
        description: "unnamed_13_desc",
        formula: "z<sub>n+1</sub> = z<sub>n</sub><sup>POWER</sup> + c<sup>z<sub>n</sub></sup>",
        shader: "unnamed_13"
    }

};


const COLOR_METHODS = {

    TERRACED: {
        name: "terraced",
        description: "terraced_desc",
        shader: "terraced"
    },
    SMOOTH: {
        name: "smooth",
        description: "smooth_desc",
        shader: "smooth"
    },
    INTERIOR: {
        name: "interior",
        description: "interior_desc",
        shader: "interior"
    },
    RINGS: {
        name: "rings",
        description: "rings_desc",
        shader: "rings"
    },
    STRIPES: {
        name: "stripes",
        description: "stripes_desc",
        shader: "stripes"
    },
    ACCURATE: {
        name: "accurate",
        description: "accurate_desc",
        shader: "accurate"
    },
    SMOOTH_STRIPES: {
        name: "smooth_stripes",
        description: "smooth_stripes_desc",
        shader: "smooth_stripes"
    },
    EDGY: {
        name: "edgy",
        description: "edgy_desc",
        shader: "edgy"
    },
    SQUARED: {
        name: "squared",
        description: "squared_desc",
        shader: "squared"
    },
    SPIKY: {
        name: "spiky",
        description: "spiky_desc",
        shader: "spiky"
    },
    STRIPY_RINGS: {
        name: "stripy_rings",
        description: "stripy_rings_desc",
        shader: "stripy_rings"
    },
    INTERIOR_2: {
        name: "interior_2",
        description: "interior_2_desc",
        shader: "interior_2"
    },
    INTERIOR_STRIPES: {
        name: "interior_stripes",
        description: "interior_stripes_desc",
        shader: "interior_stripes"
    },
    PICKOVER_STALK: {
        name: "pickover_stalk",
        description: "pickover_stalk_desc",
        shader: "pickover_stalk"
    }

};


const COLORSCHEMES = {

    CLASSIC: {
        name: "classic",
        description: "classic_desc",
        shader: "classic"
    },
    ULTRA_FRACTAL: {
        name: "ultra_fractal",
        description: "ultra_fractal_desc",
        shader: "ultra_fractal"
    },
    RED_BLUE: {
        name: "red_blue",
        description: "red_blue_desc",
        shader: "red_blue"
    },
    SAND: {
        name: "sand",
        description: "sand_desc",
        shader: "sand"
    },
    RAINBOW: {
        name: "rainbow",
        description: "rainbow_desc",
        shader: "rainbow"
    },
    DAVIDS: {
        name: "davids",
        description: "davids_desc",
        shader: "davids"
    },
    LAVA_WAVES: {
        name: "lava_waves",
        description: "lava_waves_desc",
        shader: "lava_waves"
    },
    MORNING_GLORY: {
        name: "morning_glory",
        description: "morning_glory_desc",
        shader: "morning_glory"
    },
    CHOCOLATE: {
        name: "chocolate",
        description: "chocolate_desc",
        shader: "chocolate"
    },
    CONTRASTED_CLASSIC: {
        name: "contrasted_classic",
        description: "contrasted_classic_desc",
        shader: "contrasted_classic"
    },
    BLACK_WHITE: {
        name: "black_white",
        description: "black_white_desc",
        shader: "black_white"
    },
    TWILIGHT: {
        name: "twilight",
        description: "twilight_desc",
        shader: "twilight"
    },
    RED: {
        name: "red",
        description: "red_desc",
        shader: "red"
    },
    GREEN: {
        name: "green",
        description: "green_desc",
        shader: "green"
    },
    BLUE: {
        name: "blue",
        description: "blue_desc",
        shader: "blue"
    },
    COLD: {
        name: "cold",
        description: "cold_desc",
        shader: "cold"
    },
    WINTER: {
        name: "winter",
        description: "winter_desc",
        shader: "winter"
    },
    GLOW: {
        name: "glow",
        description: "glow_desc",
        shader: "glow"
    },
    PURPLE: {
        name: "purple",
        description: "purple_desc",
        shader: "purple"
    },
    BROWN: {
        name: "brown",
        description: "brown_desc",
        shader: "brown"
    }

};


const MODIFIERS = {

    NONE: {
        name: "none",
        radius: null,
        description: "none_desc",
        shader: "none"
    },
    SIN: {
        name: "sine_modifier",
        radius: 10,
        description: "sine_modifier_desc",
        shader: "sin"
    },
    SINH: {
        name: "hyperbolic_sine_modifier",
        radius: 10,
        description: "hyperbolic_sine_modifier_desc",
        shader: "sinh"
    },
    COS: {
        name: "cosine",
        radius: 10,
        description: "cosine_desc",
        shader: "cos"
    },
    COSH: {
        name: "hyperbolic_cosine",
        radius: 10,
        description: "hyperbolic_cosine_desc",
        shader: "cosh"
    },
    TAN: {
        name: "tangent",
        radius: 10,
        description: "tangent_desc",
        shader: "tan"
    },
    TANH: {
        name: "hyperbolic_tangent",
        radius: 10,
        description: "hyperbolic_tangent_desc",
        shader: "tanh"
    },
    LOG: {
        name: "logarithm",
        radius: 10,
        description: "logarithm_desc",
        shader: "log"
    },
    SQRT: {
        name: "square_root",
        radius: 10,
        description: "square_root_desc",
        shader: "sqrt"
    },
    ABS: {
        name: "absolute",
        radius: 10,
        description: "absolute_desc",
        shader: "abs"
    },
    EXP: {
        name: "exponential",
        radius: 100,
        description: "exponential_desc",
        shader: "exp"
    },
    ATAN: {
        name: "arctangent",
        radius: 10,
        description: "arctangent_desc",
        shader: "atan"
    },
    ASIN: {
        name: "arcsine",
        radius: 10,
        description: "arcsine_desc",
        shader: "asin"
    },
    ACOS: {
        name: "arccosine",
        radius: 10,
        description: "arccosine_desc",
        shader: "acos"
    },
    ASINH: {
        name: "hyperbolic_arcsine",
        radius: 10,
        description: "hyperbolic_arcsine_desc",
        shader: "asinh"
    },
    ACOSH: {
        name: "hyperbolic_arccosine",
        radius: 10,
        description: "hyperbolic_arccosine_desc",
        shader: "acosh"
    },
    ATANH: {
        name: "hyperbolic_arctangent",
        radius: 10,
        description: "hyperbolic_arctangent_desc",
        shader: "atanh"
    },
    INV: {
        name: "inversed",
        radius: 10,
        description: "inversed_desc",
        shader: "inv"
    },
    SCATTER: {
        name: "scatter",
        radius: null,
        description: "scatter_desc",
        shader: "scatter"
    }

};

const EASINGS = {
    LINEAR: {
        name: "linear",
        function: (x, _) => x
    },
    EASE_IN: {
        name: "ease_in",
        function: (x, s) => Math.pow(x, s)
    },
    EASE_OUT: {
        name: "ease_out",
        function: (x, s) => 1 - Math.pow(1 - x, s)
    },
    EASE_IN_OUT: {
        name: "ease_in_out",
        function: (x, s) => x < 0.5 ? Math.pow(2, s - 1) * Math.pow(x, s) : 1 - Math.pow(-2 * x + 2, s) / 2
    }
};