#include <emscripten.h>
#include <stdio.h>
#include <math.h>

int main(int argc, char const *argv[]) {
  emscripten_run_script("typeof window!='undefined' && window.dispatchEvent(new CustomEvent('wasmLoaded'))");
  // EM_ASM({
  //   typeof window != 'undefined' && window.dispatchEvent(new CustomEvent('wasmLoaded'))
  // });
  return 0;
}

extern "C" {
  EMSCRIPTEN_KEEPALIVE
  float* perspective (float *buf, int bufSize, float width, float height) {

    float fieldOfView = 45 * M_PI / 180;
    float aspect = width / height;
    float zNear = 0.1;
    float zFar = 100.0;

    float f = 1.0 / tan(fieldOfView / 2.0);
    float nf = 1.0 / (zNear - zFar);

    float result[bufSize];
    result[0] = f / aspect;
    result[5] = f;
    result[10] = (zFar + zNear) * nf;
    result[11] = -1;
    result[14] = 2 * zFar * zNear * nf;
    result[15] = 0;

    return &result[0];
  }

  EMSCRIPTEN_KEEPALIVE
  float* scaleAndTranslate (float *buf, int bufSize, float scale, float transX, float transY) {
    float result[bufSize];

    int i;
    for (i = 0; i < bufSize; i++) {
      if (i < 12) {
        result[i] = buf[i] * scale;  // scale
      } else {
        result[i] = buf[i-12] * transX + buf[i-8] * transY + 0 + buf[i];  // translate
      }
    }

    return &result[0];
  }

  EMSCRIPTEN_KEEPALIVE
  int* pdf (int *buf, int bufSize) {
    int result[4*256];
    int size = bufSize / 4;  // rgba
    int i;

    for (i = 0; i < 256; i++) {
      result[i] = 0;
    }

    for (i = 0; i < size; i++) {
      result[buf[i*4]]++;
      result[buf[i*4+1]+256]++;
      result[buf[i*4+2]+256*2]++;
      result[buf[i*4+3]+256*3]++;
    }

    return &result[0];
  }
}