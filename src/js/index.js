'use strict';

import Arduino from './arduino';
import Neopixel from './neopixel';

const INIT_LED_ANGLE =   0; // [°]
const INIT_HUE_ANGLE =   0; // [°], 0 = red, 120 = green, 240 = blue

const LED_SPEED      = 720; // [°/s]
const HUE_SPEED      =  20; // [°/s]

const HUE_PHASE      =  10; // [°/LED]
const V_ATTEN        =  27; // [%/LED]

const UPDATE_PERIOD  =  66; // [ms]

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
  /* Phase shift of 1/3 period vs. green */
  return green(degrees + 120);
}

function blue(degrees) {
  /* Phase shift of -1/3 period vs. green */
  return green(degrees - 120);
}

const strip = new Neopixel.fromElement(document.getElementById("leds"));
let led_angle = 0;
let hue_angle = 0;

const arduino = new Arduino(

    // This function is run once when the arduino starts
    function begin() {
      led_angle = INIT_LED_ANGLE;
      hue_angle = INIT_HUE_ANGLE;

      strip.begin();
      strip.show();
    },

    // This function is run continuously
    // Use the delay function to prevent it from burning cycles
    // like crazy
    async function loop() {
      await rainbow(led_angle, hue_angle, HUE_PHASE, V_ATTEN);
      led_angle = (led_angle + Math.floor(LED_SPEED * UPDATE_PERIOD / 1000)) % 360;
      if (led_angle < 0) {
        led_angle = led_angle + 360;
      }
      hue_angle = (hue_angle + Math.floor(HUE_SPEED * UPDATE_PERIOD / 1000)) % 360;
      if (hue_angle < 0) {
        hue_angle = hue_angle + 360;
      }
      await arduino.delay(UPDATE_PERIOD)
    }
);

async function rainbow(led_angle, hue_angle, hue_phase, value_atten) {
  const led_offset = Math.floor(led_angle * strip.numPixels() / 360);

  // console.log(led_angle, led_offset);

  for (let pixel = 0; pixel < strip.numPixels(); pixel++) {
    const led = (pixel + led_offset) % strip.numPixels();

    const led_hue_phase = led * hue_phase;
    const d = hue_angle + led_hue_phase;

    let value_factor = 100 - led * value_atten;
    if (value_factor < 0) {
      value_factor = 0;
    }

    const r = Math.floor((red(d)  * value_factor) / 100); 
    const g = Math.floor((green(d) * value_factor) / 100);
    const b = Math.floor((blue(d)  * value_factor) / 100);

    strip.setPixelColor(pixel, strip.Color(r, g, b));
  }
  strip.show();
}

arduino.start();
