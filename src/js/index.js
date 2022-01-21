'use strict';

import Arduino from './arduino';
import Neopixel from './neopixel';

const strip = new Neopixel.fromElement(document.getElementById("leds"));

const arduino = new Arduino(

    // This function is run once when the arduino starts
    function begin() {
      strip.begin();
      strip.show();
    },

    // This function is run continuously
    // Use the delay function to prevent it from burning cycles
    // like crazy
    async function loop() {
      /* Equally space the LEDs around the rainbow */
      // const hue_phase = Math.floor(360 / strip.numPixels()); // C++: 360 / strip.numPixels()
      /* LEDs follow each other by 25° in the rainbow */
      await rainbow(15);
    }
);

// Neopixel test pattern
async function chase(c) {
  for (var i = 0; i < strip.numPixels() + 4; i++) {
    strip.setPixelColor(i, c); // Draw new pixel
    strip.setPixelColor(i - 4, strip.Color(0, 0, 0)); // Erase pixel a few steps back
    strip.show();
    await arduino.delay(100);
  }
}

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

async function rainbow(hue_phase) {
  for (let i = 360; i > 0; i -= 5) {
    for (let led = 0; led < strip.numPixels(); led++) {
      const led_hue_phase = led * hue_phase;
      const d = i + led_hue_phase;
      const r = red(d);
      const g = green(d);
      const b = blue(d);
      strip.setPixelColor(led, strip.Color(r, g, b));
    }
    strip.show();
    await arduino.delay(100);
  }
}

arduino.start();