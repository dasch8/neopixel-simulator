'use strict';

import Arduino from './arduino';
import Neopixel from './neopixel';

const NUM_LEDS = 60;
const LED_SHAPE = "strip" // { strip, circle }

const INIT_BRIGHT_ANGLE = 180; // [°]
const INIT_HUE_ANGLE = 180; // [°], 0 = red, 120 = blue, 240 = green

const HUE_SPEED = 0; // [°/s]
const BRIGHT_SPEED = 180; // [°/s]

const HUE_PHASE = 6; // [°/LED]
const BRIGHT_PHASE = 6; // [°/LED]
const BRIGHT_GAP = 300 // [°]

const UPDATE_PERIOD = 66; // [ms]

/* Get green component */
function green(degrees) {
    const c_degrees = degrees % 360;
    if (0 <= c_degrees && c_degrees < 60) {
        return Math.floor(255 * c_degrees / 60); // C++: return (255 * c_degrees) / 60
    }
    else if (60 <= c_degrees && c_degrees < 180) {
        return 255;
    }
    else if (180 <= c_degrees && c_degrees < 240) {
        return Math.floor(255 * (240 - c_degrees) / 60); // C++ return (255 * (240 - c_degrees)) / 60
    }
    else { // (240 <= c_degrees && c_degrees < 360)
        return 0;
    }
}

/* Get red component */
function red(degrees) {
    /* Phase shift of -1/3 period vs. blue */
    return green(degrees + 120);
}

function blue(degrees) {
    /* Phase shift of 1/3 period vs. blue */
    return green(degrees - 120);
}

function brightness(degrees) {
    const c_degrees = degrees % 360;

    const gap_min = 180 - Math.floor(BRIGHT_GAP / 2);
    const gap_max = 180 + Math.floor(BRIGHT_GAP / 2);
    if (0 <= c_degrees && c_degrees < gap_min) {
        return 1000 * (gap_min - c_degrees) / gap_min;
    }
    else if (gap_max <= c_degrees && c_degrees < 360) {
        return 1000 * (c_degrees - gap_max) / (360 - gap_max);
    }
    else {
        return 0;
    }
}

const strip = new Neopixel(NUM_LEDS);

let bright_angle = 0; // [m°], C++: uint32_t
let hue_angle = 0; // [m°], C++: uint32_t

const arduino = new Arduino(

    // This function is run once when the arduino starts
    function begin() {
        bright_angle = INIT_BRIGHT_ANGLE * 1000;
        hue_angle = INIT_HUE_ANGLE * 1000;

        strip.begin();

        const stripElement = document.getElementsByClassName("pixel-strip")[0];
        stripElement.classList.add(LED_SHAPE);

        strip.show();
    },

    // This function is run continuously
    // Use the delay function to prevent it from burning cycles
    // like crazy
    async function loop() {
        await rainbow(
            Math.floor(hue_angle / 1000), // C++: hue_angle / 1000
            Math.floor(bright_angle / 1000), // C++: bright_angle / 1000
            HUE_PHASE, BRIGHT_PHASE
        );

        hue_angle = (hue_angle + HUE_SPEED * UPDATE_PERIOD) % 360000;
        if (hue_angle < 0) {
            hue_angle = hue_angle + 360000;
        }
        bright_angle = (bright_angle + BRIGHT_SPEED * UPDATE_PERIOD) % 360000;
        if (bright_angle < 0) {
            bright_angle = bright_angle + 360000;
        }

        await arduino.delay(UPDATE_PERIOD)
    }
);

async function rainbow(hue_angle, bright_angle, hue_phase, bright_phase) {  
    for (let pixel = 0; pixel < strip.numPixels(); pixel++) {
        const pixel_hue_phase = pixel * hue_phase;
        const pixel_hue_angle = hue_angle + pixel_hue_phase;

        const pixel_bright_phase = pixel * bright_phase;
        const pixel_bright_angle = bright_angle + pixel_bright_phase;

        const bright = brightness(pixel_bright_angle);

        const r = Math.floor((red(pixel_hue_angle) * bright) / 1000);
        const g = Math.floor((green(pixel_hue_angle) * bright) / 1000);
        const b = Math.floor((blue(pixel_hue_angle) * bright) / 1000);

        strip.setPixelColor(pixel, strip.Color(r, g, b));
    }
    strip.show();
}

arduino.start();
