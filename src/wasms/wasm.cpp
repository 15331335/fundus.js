#include <emscripten.h>
#include <stdio.h>
#include <math.h>

int main(int argc, char const *argv[]) {
  emscripten_run_script("typeof window!='undefined' && window.dispatchEvent(new CustomEvent('wasmLoaded'))");
  return 0;
}

extern "C" {
  EMSCRIPTEN_KEEPALIVE
  int* CDF (int *buf, int bufSize) {  // cumulative distribution function
    int result[4*256];
    int size = bufSize / 4;  // rgba
    int i;

    for (i = 0; i < 4*256; i++) {
      result[i] = 0;
    }

    for (i = 0; i < size; i++) {
      result[buf[i*4]]++;
      result[buf[i*4+1]+256]++;
      result[buf[i*4+2]+256*2]++;
      result[buf[i*4+3]+256*3]++;
    }
    for (i = 1; i < 256; i++) {
      result[i] += result[i-1];
      result[i+256] += result[i+256-1];
      result[i+256*2] += result[i+256*2-1];
      result[i+256*3] += result[i+256*3-1];
    }

    return &result[0];
  }
}