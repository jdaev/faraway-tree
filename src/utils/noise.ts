import { makeNoise2D } from "fast-simplex-noise";

// babylon js function to make perlin noise
// return 2d float array
// params:
//  - width: width of the array
//  - height: height of the array
//  - scale: scale of the noise

export function generateNoiseMap(
  width: number,
  height: number,
  scale: number,
  octaves: number,
  persistance: number,
  lacunarity: number,
  offset = { x: 0, y: 0 }
): number[][] {
  const noiseFunction = makeNoise2D();

  var noise = [];

  var octaveOffsets = [];

  for (var i = 0; i < octaves; i++) {
    var offsetX = Math.floor(Math.random() * 100000) - 50000 + offset.x;
    var offsetY = Math.floor(Math.random() * 100000) - 50000 + offset.y;
    octaveOffsets.push([offsetX, offsetY]);
  }

  if (scale <= 0) {
    scale = 0.0001;
  }

  var maxNoiseHeight = Number.MIN_VALUE;
  var minNoiseHeight = Number.MAX_VALUE;

  var halfWidth = width / 2;
  var halfHeight = height / 2;

  for (var i = 0; i < width; i++) {
    noise[i] = [];
    for (var j = 0; j < height; j++) {
      var amplitude = 1;
      var frequency = 1;
      var noiseHeight = 0;

      for (var o = 0; o < octaves; o++) {
        var sampleX = ((i - halfWidth) / scale) * frequency + octaveOffsets[o][0];
        var sampleY = ((j - halfHeight) / scale) * frequency + octaveOffsets[o][1];

        var perlinValue = noiseFunction(sampleX, sampleY) * 2 - 1;

        noiseHeight += perlinValue * amplitude;
        amplitude *= persistance;
        frequency *= lacunarity;
      }

      if (noiseHeight > maxNoiseHeight) {
        maxNoiseHeight = noiseHeight;
      } else if (noiseHeight < minNoiseHeight) {
        minNoiseHeight = noiseHeight;
      }

      noise[i][j] = noiseHeight;
    }

    for (var j = 0; j < height; j++) {
      noise[i][j] = Math.floor(
        ((noise[i][j] - minNoiseHeight) / (maxNoiseHeight - minNoiseHeight)) *
          255
      );
    }
  }
  return noise;
}
