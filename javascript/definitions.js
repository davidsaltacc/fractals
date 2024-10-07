
const METADATA = {
    version: "0.5.1a",
    plugin_version: "5"
};

const FRACTALS = {

    MANDELBROT: {
        radius: 10000000,
        description: "The standard Mandelbrot set.",
        formula: "<p>z<sub>n+1</sub> = z<sub>n</sub><sup>POWER</sup> + c</p>",
        shader: "mandelbrot"
    },
    BURNING_SHIP: {
        radius: 10000000,
        description: "A variation of the Mandelbrot set. Got its name because of the tiny burning ship on the left.",
        formula: "<p>z<sub>n+1</sub> = (|Re(z<sub>n</sub><sup>POWER</sup>)| + Im(z<sub>n</sub><sup>POWER</sup>)i) + c</p>",
        shader: "burning_ship"
    },
    CELTIC: {
        radius: 10000000,
        description: "Another variation of the Mandelbrot set. Kind of looks like a fish.",
        formula: "<p>z<sub>n+1</sub> = (Re(z<sub>n</sub><sup>POWER</sup>) + |Im(z<sub>n</sub><sup>POWER</sup>)|i) + c</p>",
        shader: "celtic"
    },
    BUFFALO: {
        radius: 10000000,
        description: "Yet another Mandelbrot variation. The reason for its name should be obvious.",
        formula: "<p>z<sub>n+1</sub> = (|Re(z<sub>n</sub><sup>POWER</sup>)| + |Im(z<sub>n</sub><sup>POWER</sup>)|i) + c</p>",
        shader: "buffalo"
    },
    TRICORN: {
        radius: 10000000,
        description: "Another Mandelbrot variation. Also called the Mandelbar sometimes.",
        formula: "<p>z<sub>n+1</sub> = (-Re(z<sub>n</sub><sup>POWER</sup>) + Im(z<sub>n</sub><sup>POWER</sup>)i) + c</p>",
        shader: "tricorn"
    },
    DUCK: {
        radius: 10000000,
        description: "Another Mandlebrot variation. Looks like a duck. Apparently also called the perpendicular burning ship. The formula only looks as complicated so the power can easily be changed in code.",
        formula: "<p>polar = toPolar(z<sub>n</sub>)<br>r = Re(polar)<sup>POWER</sup><br>t = POWER * |Im(polar)|;<br>z<sub>n+1</sub> = (r * cos(t) + i * r * sin(t)) + c</p>",
        shader: "duck"
    },
    ASS: {
        radius: 10000000,
        description: "Kind of looks like- well, ..., whatever.",
        formula: "<p>x<sub>n+1</sub> = x<sub>n</sub><sup>3</sup> - y<sub>n</sub><sup>2</sup> * abs(y<sub>n</sub>) + c<sub>x</sub><br>y<sub>n+1</sub> = 2 * x<sub>n</sub> * y<sub>n</sub> + c<sub>y</sub></p>",
        shader: "ass"
    },
    SINE: {
        radius: 50,
        description: "Infinitely repeating to the left and right. Interesting, isn't it?",
        formula: "<p>z<sub>n+1</sub> = sin(z)<sup>POWER</sup> + c</p>",
        shader: "sine"
    },
    POPCORN: {
        radius: 2,
        description: "I have no idea who named this one the \"Popcorn\" fractal. Maybe the creators name was Popcorn? I should probably do more research... Anyway, It generates really cool patterns.",
        formula: "<p>x<sub>n+1</sub> = x<sub>n</sub> - c<sub>x</sub> * (y<sub>n</sub> + tan(3 * y<sub>n</sub>))<br>y<sub>n+1</sub> = y<sub>n</sub> - c<sub>y</sub> * (x<sub>n</sub> + tan(3 * x<sub>n</sub>))</p>",
        shader: "popcorn"
    },
    THORN: {
        radius: 10000000,
        description: "Not the usual kind of escape-time fractal, yet still very interesting.",
        formula: "<p>x<sub>n+1</sub> = x<sub>n</sub> / cos(y<sub>n</sub>) + c<sub>x</sub><br>y<sub>n+1</sub> = y<sub>n</sub> / sin(x<sub>n</sub>) + c<sub>y</sub></p>",
        shader: "thorn"
    },
    HENON: {
        radius: 20000,
        description: "Henon map.",
        formula: "<p>x<sub>n+1</sub> = 1 - c<sub>x</sub> * x<sub>n</sub><sup>2</sup> + y<sub>n</sub><br>x<sub>n+1</sub> = c<sub>y</sub> * x<sub>n</sub></p>",
        shader: "henon"
    },
    DUFFING: {
        radius: 200,
        description: "Duffing map.",
        formula: "<p>x<sub>n+1</sub> = y<sub>n</sub><br>y<sub>n+1</sub> = -1 * c<sub>y</sub> * x<sub>n</sub> + c<sub>x</sub> * y<sub>n</sub> - y<sub>n</sub><sup>3</sup></p>",
        shader: "duffing"
    },
    CHIRIKOV: {
        radius: 100, 
        description: "Chirikov map.",
        formula: "<p>x<sub>n+1</sub> = x<sub>n</sub> + c<sub>x</sub> * y<sub>n</sub><br>y<sub>n+1</sub> = y<sub>n</sub> + c<sub>y</sub> * sin(x<sub>n</sub>)</p>",
        shader: "chirikov"
    },
    IKEDA: {
        radius: 20000,
        description: "Ikeda map. ",
        formula: "<p>t = 0.4 - 6 / (1 + x<sub>n</sub><sup>2</sup> + y<sub>n</sub><sup>2</sup>)<br>x<sub>n+1</sub> = 1 + c<sub>x</sub> * (x<sub>n</sub> * cos(t) - y<sub>n</sub> * sin(t))<br>x<sub>n+1</sub> = c<sub>y</sub> * (x<sub>n</sub> * sin(t) + y<sub>n</sub> * cos(t))</p>",
        shader: "ikeda"
    },
    FEATHER: {
        radius: 50, 
        description: "Really cool looking fractal. Looks like a feather.",
        formula: "<p>z<sub>n</sub><sup>3</sup> / (1 + (Re(z)<sup>2</sup> + i * Im(z)<sup>2</sup>)) + c</p>",
        shader: "feather"
    },
    HEART: {
        radius: 10000000,
        description: "<3",
        formula: "<p>x<sub>n+1</sub> = 2 * x<sub>n</sub> * y<sub>n</sub> + c<sub>x</sub><br>y<sub>n+1</sub> = |y<sub>n</sub>| - |x<sub>n</sub>| + c<sub>y</sub></p>",
        shader: "heart"
    },
    ASS_2: {
        radius: 10000,
        description: "Looks a little bit like another.. Anyway. \"Description\"? More like \"Probably a sarcastic comment by david\"...",
        formula: "<p>x<sub>n+1</sub> = sinh(x<sub>n</sub>) * sin(y<sub>n</sub>) + c<sub>x</sub><br>y<sub>n+1</sub> = cosh(y<sub>n</sub>) * cos(x<sub>n</sub>) + c<sub>y</sub></p>",
        shader: "ass_2"
    },
    TRIANGLE: {
        radius: 10000,
        description: "Literally just a triangle. Did you know that a² + b² = c² for every right triangle? ",
        formula: "<p>x<sub>n+1</sub> = sin(x<sub>n</sub>) * sinh(y<sub>n</sub>) + c<sub>x</sub><br>y<sub>n+1</sub> = cos(y<sub>n</sub>) * cosh(x<sub>n</sub>) + c<sub>y</sub></p>",
        shader: "triangle"
    },
    SHARK_FIN: {
        radius: 10000000,
        description: "Could also be a dolphin. Actually, not really.",
        formula: "<p>x<sub>n+1</sub> = x<sub>n</sub><sup>2</sup> - |y<sub>n</sub>| * y<sub>n</sub><br>y<sub>n+1</sub> = 2 * x<sub>n</sub> * y<sub>n</sub></p>",
        shader: "shark_fin"
    },
    TIPPETS: {
        radius: 10000000,
        description: "With all respect, I think, John Tippets messed up the code for a mandelbrot set, and got this.",
        formula: "<p>x<sub>n+1</sub> = x<sub>n</sub><sup>2</sup> - y<sub>n</sub><sup>2</sup> + c<sub>x</sub><br>y<sub>n+1</sub> = 2 * x<sub>n+1</sub> * y<sub>n</sub> + c<sub>y</sub></p>",
        shader: "tippets"
    },
    ZUBIETA: {
        radius: 10000000,
        description: "Looks really interesting. No idea what else to say about this.",
        formula: "<p>z<sub>n+1</sub> = z<sup>POWER</sup> + c / z</p>",
        shader: "zubieta"
    },
    SINH: {
        radius: 70,
        description: "Kind of like the sine, this one is repeating infinitely vertically. Just looks a little better.",
        formula: "<p>z<sub>n+1</sub> = sinh(z)<sup>POWER</sup> + c</p>",
        shader: "sinh"
    },
    UNNAMED_1: {
        radius: 10000000,
        description: "I found no good name for this. If you can think of anything, tell me.",
        formula: "<p>z<sub>n+1</sub> = z<sub>n</sub><sup>POWER</sup> - (-z)<sup>c<sub>x</sub></sup> + c<sub>y</sub></p>",
        shader: "unnamed_1"
    },
    UNNAMED_2: {
        radius: 10000000,
        description: "I found no name again. Creates really cool patterns. With a power of one and interior coloring, seems to create a Newton-like fractal.",
        formula: "<p>z<sub>n+1</sub> = (z<sub>n</sub> - (z<sub>n</sub><sup>3</sup> - 1) / (3 * z<sub>n</sub><sup>2</sup>))<sup>POWER</sup> + c</p>",
        shader: "unnamed_2"
    },
    UNNAMED_3: {
        radius: 10000000,
        description: "No name again, but it looks really cool. Also, it is very big.",
        formula: "<p>((z<sub>n</sub><sup>2</sup> + c - 1) / (z * (2 + 2i) + c - 2))<sup>POWER</sup></p>",
        shader: "unnamed_3"
    },
    FISH: {
        radius: 10000000,
        description: "Doesn't even look like anything close to a fish.",
        formula: "<p>x<sub>n+1</sub> = |x<sub>n</sub> - y<sub>n</sub>|<br>y<sub>n+1</sub> = 2 * x<sub>n</sub> * y<sub>n</sub></p>",
        shader: "fish"
    },
    WAVY: {
        radius: 10000000,
        description: "A lot of waves are involved in this.",
        formula: "<p>a = y<sub>n</sub> + 1 - (1.4 + sin(y<sub>n</sub>  * pi) * 0.4 + c<sub>x</sub>) * x<sub>n</sub><sup>2</sup><br>b = (0.3 + cos((x<sub>n</sub> + y<sub>n</sub>) * pi) * 0.2 + c<sub>y</sub>) * a<br>x<sub>n+1</sub> = (4 + cos(x<sub>n</sub> * pi) * 3 + (c<sub>x</sub> + c<sub>y</sub>)) * a * (1 - a)<br>y<sub>n+1</sub> = b</p>",
        shader: "wavy"
    },
    COLLATZ: {
        radius: 20,
        description: "Complex collatz conjecture, apparently.",
        formula: "<p>z<sub>n+1</sub> = 0.25 * (1 + 4 * z<sub>n</sub> - (1 + 2 * z<sub>n</sub>) * cos(pi * z<sub>n</sub>)) + c</p>",
        shader: "collatz"
    },
    UNNAMED_4: {
        radius: 10000000,
        description: "Another unnamed fractal. Has a lot of edges.",
        formula: "<p>z<sub>n+1</sub> = ((Im(z<sub>n</sub>) - sign(Re(z<sub>n</sub>)) * sqrt(|Im(c) * Re(z<sub>n</sub>) - (Re(c) + Im(c))|)) + i(Re(c) - Re(z<sub>n</sub>)))<sup>POWER</sup></p>",
        shader: "unnamed_4"
    },
    SEPTAGON: {
        radius: 10,
        description: "It looks a little like an hourglass, and its juliasets are septagons.",
        formula: "<p>z<sub>n+1</sub> = (z<sub>n</sub><sup>7</sup> + (c<sub>x</sub>/c<sub>y</sub> + i(c<sub>x</sub>/c<sub>y</sub>))) / z<sub>n</sub></p>",
        shader: "septagon"
    },
    UNNAMED_5: {
        radius: 10000000,
        description: "No idea, this one seems like a warped and distorted version of the mandelbrot set.",
        formula: "<p>z<sub>n+1</sub> = z<sub>n</sub><sup>POWER</sup> + ((|Re(z)| + i|Im(z)|) + i) / ((|Re(z)| + i|Im(z)|) + 1) + c</p>",
        shader: "unnamed_5"
    },
    UNNAMED_6: {
        radius: 1000000,
        description: "The juliasets have interesting symmetries. Okay, I'm just running out of ideas what to put here. (I say running out of - I never had any to begin with.)",
        formula: "<p>z<sub>n+1</sub> = (z<sub>n</sub><sup>4</sup> + (1 + i * Re(c))) / (z<sub>n</sub><sup>2</sup> + (1 + i * Im(c)))</p>",
        shader: "unnamed_6"
    },
    CACTUS: {
        radius: 10000000,
        description: "Cactus fractal. (I still don't know what to put here.)",
        formula: "<p>z<sub>n+1</sub> = z<sub>n</sub><sup>3</sup> + (c - 1) * z<sub>n</sub> - c</p>",
        shader: "cactus"
    },
    UNNAMED_7: {
        radius: 10,
        description: "Very big (?).",
        formula: "<p>t = c * z<sub>n</sub><sup>2</sup> * (z<sub>n</sub><sup>2</sup> + 1) / (z<sub>n</sub><sup>2</sup> - 1)<sup>2</sup><br>z<sub>n+1</sub> = (Re(t) - Im(t)) / |t|<sup>2</sup></p>",
        shader: "unnamed_7"
    },
    POWER_CIRCLE: {
        radius: 16,
        description: "I called it that because it looks like a circle (obviously) and appears from raising z to the power of c.",
        formula: "<p>z<sub>n+1</sub> = z<sub>n</sub><sup>c</sup></p>",
        shader: "power_circle"
    },
    BITTEN_MANDELBROT: {
        radius: 10000000,
        description: "I took a byte. Sorry.",
        formula: "<p>z<sub>n+1</sub> = (z + c)<sup>POWER</sup> - c / (z + i)</p>",
        shader: "bitten_mandelbrot"
    },
    UNNAMED_8: {
        radius: 10000000,
        description: "Reeeeaaaally big. (I'm running out of creativity. I really don't know what to name this one. Just like all the others.)",
        formula: "<p>z<sub>n+1</sub> = (sqrt(z<sub>n</sub><sup>2</sup> / c) - c / z<sub>n</sub><sup>2</sup>)<sup>POWER</sup> * 0.5</p>",
        shader: "unnamed_8"
    },
    UNNAMED_9: {
        radius: 30,
        description: "Again, I do not know what to name this one.",
        formula: "<p>z<sub>n+1</sub> = (log((Im(z<sub>n</sub>) + i * Re(z<sub>n</sub>)) * c + c))<sup>3</sup></p>",
        shader: "unnamed_9"
    },
    SMALL_BROT: {
        radius: 30,
        description: "Smaller mandelbrot-like looking fractal.",
        formula: "<p>z<sub>n+1</sub> = z<sub>n</sub><sup>POWER</sup> + c * 2</p>",
        shader: "small_brot"
    },
    MAGNET: {
        radius: 10000000,
        description: "Magnet fractal. Maybe turn on interior coloring?",
        formula: "<p>((z<sub>n</sub><sup>POWER</sup> + c - 1) / (2 * z<sub>n</sub> + c - 2))<sup>POWER</sup></p>",
        shader: "magnet"
    },
    TREE: {
        radius: 10,
        description: "Square root makes tree, apparently. Changes its appearance a lot with different powers.",
        formula: "<p>z<sub>n+1</sub> = sqrt(z<sub>n</sub><sup>POWER+1</sup>) + c</p>",
        shader: "tree"
    },
    UNNAMED_10: {
        radius: 10000000,
        description: "I reeeaally need to find some names for all of these.",
        formula: "<p>z<sub>n+1</sub> = z<sub>n</sub><sup>3</sup> + z<sub>n</sub> + c</p>",
        shader: "unnamed_10"
    },
    NOT_MANDELBROT: {
        radius: 10000000,
        description: "Looks like the mandelbrot set at first, but really isn't.",
        formula: "<p>z<sub>n+1</sub> = (((1 - i) * z<sub>n</sub>) / 2) * (((1 + i) * (z<sub>n</sub> - 1)) / 2) + c</p>",
        shader: "not_mandelbrot"
    },
    SIERPINSKY: {
        radius: 1000000000000000,
        description: "IFS Fractal except its not IFS its escape-time. Has no juliaset, so both canvases are filled with the same.",
        formula: "if (Im(z<sub>n</sub>) > 0.5) then: z<sub>n+1</sub> = (2 * Re(z<sub>n</sub>) + i * 2 * Im(z<sub>n</sub>) - 1) <br>else if (Re(z<sub>n</sub>) > 0.5) then: z<sub>n+1</sub> = (2 * Re(z<sub>n</sub>) - 1, i* 2 * Im(z<sub>n</sub>)) <br>else: z<sub>n+1</sub> = (2 * Re(z<sub>n</sub>) + i * 2 * Im(z<sub>n</sub>))",
        shader: "sierpinsky"
    },
    BARNSLEY: {
        radius: 10,
        description: "Fern.",
        formula: "z<sub>n+1</sub> = (z<sub>n</sub> - sign(Re(z<sub>n</sub>))) * c",
        shader: "barnsley"
    }

};


const COLOR_METHODS = {

    TERRACED: {
        description: "\"Mathematically accurate\" coloring method. Not smoothed, colored based on how long it takes for z to escape to infinity.",
        shader: "terraced"
    },
    SMOOTH: {
        description: "Smooth coloring.",
        shader: "smooth"
    },
    INTERIOR: {
        description: "Interior coloring.",
        shader: "interior"
    },
    RINGS: {
        description: "Rings around the fractal.",
        shader: "rings"
    },
    STRIPES: {
        description: "Really cool stripes pattern.",
        shader: "stripes"
    },
    ACCURATE: {
        description: "Pixels are either black (part of the set) or not (not a part of the set).",
        shader: "accurate"
    },
    SMOOTH_STRIPES: {
        description: "Like stripes, just a lot smoother.",
        shader: "smooth_stripes"
    },
    EDGY: {
        description: "Another stripes variant, has a lot of edges.",
        shader: "edgy"
    },
    SQUARED: {
        description: "Another stripes variant.",
        shader: "squared"
    },
    SPIKY: {
        description: "Something spiky. Only looks good on some fractals.",
        shader: "spiky"
    },
    STRIPY_RINGS: {
        description: "Rings, but with stripes too. ",
        shader: "stripy_rings"
    },
    INTERIOR_2: {
        description: "Another interior coloring method, a little different that the first one.",
        shader: "interior_2"
    },
    INTERIOR_STRIPES: {
        description: "Stripes, but on the interior. A little messy, most of the time it only looks really good on the juliasets.",
        shader: "interior_stripes"
    },
    PICKOVER_STALK: {
        description: "Another attempt at orbit traps. Looks quite nice, actually. Even though I don't understand half of it. Has a lot of thin lines, so maybe put in a higher sample count.",
        shader: "pickover_stalk"
    }

};


const COLORSCHEMES = {

    CLASSIC: {
        description: "The \"Classic\" colormap. Easily calculated with a bit of math magic.",
        shader: "classic"
    },
    ULTRA_FRACTAL: {
        description: "The default colormap in ultra fractal.",
        shader: "ultra_fractal"
    },
    RED_BLUE: {
        description: "Red and blue. As the name says.",
        shader: "red_blue"
    },
    SAND: {
        description: "Sand colormap. The colors remind of sand and water related things.",
        shader: "sand"
    },
    RAINBOW: {
        description: "Basically a full HSV colormap. Just rainbows.",
        shader: "rainbow"
    },
    DAVIDS: {
        description: "My own colorscheme. I like it, although it only looks good on some fractals.",
        shader: "davids"
    },
    LAVA_WAVES: {
        description: "Some colorscheme I found on the internet. Decided to put it in because I was running out of good colormaps. Now I have quite a few, but I didn't want to delete old stuff.",
        shader: "lava_waves"
    },
    MORNING_GLORY: {
        description: "Another colorscheme I found on the internet.",
        shader: "morning_glory"
    },
    CHOCOLATE: {
        description: "A colorscheme I just came up with. Has this chocolate-y color to it. Changes into a rainbow and back when zooming in. Unintended.",
        shader: "chocolate"
    },
    CONTRASTED_CLASSIC: {
        description: "The classic colorscheme, but more.. ugly. ",
        shader: "contrasted_classic"
    },
    BLACK_WHITE: {
        description: "Black and white colorscheme. Looks cool.",
        shader: "black_white"
    },
    TWILIGHT: {
        description: "Twilight colormap from matplotlib.",
        shader: "twilight"
    },
    RED: {
        description: "Red.",
        shader: "red"
    },
    GREEN: {
        description: "Green.",
        shader: "green"
    },
    BLUE: {
        description: "Blue.",
        shader: "blue"
    },
    COLD: {
        description: "Only cold colors.",
        shader: "cold"
    },
    WINTER: {
        description: "Snowy and icy. I like it",
        shader: "winter"
    },
    GLOW: {
        description: "Doesn't sound like the best of names for this. I'm just reeeeaaaally uncreative.",
        shader: "glow"
    }

};


const MODIFIERS = {

    NONE: {
        radius: null,
        description: "You have no fractal modifier selected. What are you expecting to see here?",
        shader: "none"
    },
    SIN: {
        radius: 10,
        description: "Complex sine.",
        shader: "sin"
    },
    SINH: {
        radius: 10,
        description: "Complex hyperbolic sine.",
        shader: "sinh"
    },
    COS: {
        radius: 10,
        description: "Complex cosine.",
        shader: "cos"
    },
    COSH: {
        radius: 10,
        description: "Complex hyperbolic cosine.",
        shader: "cosh"
    },
    TAN: {
        radius: 10,
        description: "Complex tangent. ",
        shader: "tan"
    },
    TANH: {
        radius: 10,
        description: "Complex hyperbolic tangent. I would enable interior coloring.",
        shader: "tanh"
    },
    LOG: {
        radius: 10,
        description: "Complex logarithm. I would enable interior coloring.",
        shader: "log"
    },
    SQRT: {
        radius: 10,
        description: "Complex square root. Mandelbrot looks boring with this one.",
        shader: "sqrt"
    },
    ABS: {
        radius: 10,
        description: "Takes the absolute of both sides. The true absolute of a complex number would return a single non-complex value.",
        shader: "abs"
    },
    EXP: {
        radius: 100,
        description: "Complex exponential function.",
        shader: "exp"
    },
    ATAN: {
        radius: 10,
        description: "Complex arctangent. Enable interior coloring.",
        shader: "atan"
    },
    ASIN: {
        radius: 10,
        description: "Complex arcsine. Enable interior coloring. With higher powers, this can create interesting effects.",
        shader: "asin"
    },
    ACOS: {
        radius: 10,
        description: "Complex arccosine. Enable interior coloring. With higher powers, this can create interesting effects.",
        shader: "acos"
    },
    ASINH: {
        radius: 10,
        description: "Complex hyperbolic arcsine. Enable interior coloring. With higher powers, this can create interesting effects.",
        shader: "asinh"
    },
    ACOSH: {
        radius: 10,
        description: "Complex hyperbolic arccosine. Enable interior coloring. With higher powers, this can create interesting effects.",
        shader: "acosh"
    },
    ATANH: {
        radius: 10,
        description: "Complex hyperbolic arctangent. Enable interior coloring.",
        shader: "atanh"
    },
    INV: {
        radius: 10,
        description: "Inversed. Pretty much just 1/z.",
        shader: "inv"
    },
    SCATTER: {
        radius: null,
        description: "Make sure to use a high sample count, among with a high colorfulness value, then it creates an almost buddhabrot-like image.",
        shader: "scatter"
    }

};
