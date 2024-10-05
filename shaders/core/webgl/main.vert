#version 300 es

#ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
#else
    precision mediump float;
#endif

in vec2 position;
out vec2 vertex_position;

void main() {
    gl_Position = vec4(position, 0., 1.);
    vertex_position = position;
}