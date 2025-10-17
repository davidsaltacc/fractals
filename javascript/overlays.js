
var overlay_functions = {

    "none": _ => {},
    "x": ctx => {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(ctx.canvas.clientWidth, ctx.canvas.clientHeight);
        ctx.moveTo(0, ctx.canvas.clientHeight);
        ctx.lineTo(ctx.canvas.clientWidth, 0);
        ctx.stroke();
    },
    "plus": ctx => {
        ctx.beginPath();
        ctx.moveTo(0, ctx.canvas.clientHeight / 2);
        ctx.lineTo(ctx.canvas.clientWidth, ctx.canvas.clientHeight / 2);
        ctx.moveTo(ctx.canvas.clientWidth / 2, 0);
        ctx.lineTo(ctx.canvas.clientWidth / 2, ctx.canvas.clientHeight);
        ctx.stroke();
    },
    "_3x3_grid": ctx => {
        ctx.beginPath();
        ctx.moveTo(0, ctx.canvas.clientHeight / 3);
        ctx.lineTo(ctx.canvas.clientWidth, ctx.canvas.clientHeight / 3);
        ctx.moveTo(0, ctx.canvas.clientHeight / 3 * 2);
        ctx.lineTo(ctx.canvas.clientWidth, ctx.canvas.clientHeight / 3 * 2);
        ctx.moveTo(ctx.canvas.clientWidth / 3, 0);
        ctx.lineTo(ctx.canvas.clientWidth / 3, ctx.canvas.clientHeight);
        ctx.moveTo(ctx.canvas.clientWidth / 3 * 2, 0);
        ctx.lineTo(ctx.canvas.clientWidth / 3 * 2, ctx.canvas.clientHeight);
        ctx.stroke();
    }

};

exportF({
    overlay_functions
});