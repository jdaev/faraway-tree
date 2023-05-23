import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  StandardMaterial,
  NoiseProceduralTexture,
  Texture,
  DynamicTexture,
  Color3,
} from "@babylonjs/core";
import { generateNoiseMap } from "../utils/noise";

class TerrainType {
  name: string;
  height: number;
  color: Color3;

  constructor(name: string, height: number, color: Color3) {
    this.name = name;
    this.height = height;
    this.color = color;
  }
}

export class Terrain {
  constructor() {
    // create the canvas html element and attach it to the webpage
    var canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.id = "gameCanvas";
    document.body.appendChild(canvas);

    // initialize babylon scene and engine
    var engine = new Engine(canvas, true);
    var scene = new Scene(engine);

    var terrainTypes = [
      new TerrainType("water", 120, Color3.Blue()),
      new TerrainType("sand", 150, Color3.Yellow()),
      new TerrainType("grass", 190, Color3.Green()),
      new TerrainType("rock", 240, Color3.Gray()),
      new TerrainType("snow", 250, Color3.White()),
    ];

    var camera: ArcRotateCamera = new ArcRotateCamera(
      "Camera",
      Math.PI / 2,
      Math.PI / 2,
      2,
      Vector3.Zero(),
      scene
    );
    camera.attachControl(canvas, true);
    var light1: HemisphericLight = new HemisphericLight(
      "light1",
      new Vector3(1, 1, 0),
      scene
    );

    var plane: Mesh = MeshBuilder.CreatePlane(
      "plane",
      {
        size: 100,
      },
      scene
    );

    var mat = new StandardMaterial("mat", scene);
    plane.material = mat;

    // mat.disableLighting = true;
    mat.backFaceCulling = false;

    var noise = generateNoiseMap(100, 100, 25, 4, 0.5, 2, { x: 0, y: 0 });
    var colorMap = [];

    var width = noise.length;
    var height = noise[0].length;
    var dynamicTexture = new DynamicTexture(
      "DynamicTexture",
      { width: width, height: height },
      scene
    );

    var ctx = dynamicTexture.getContext();
    for (var x = 0; x < width; x++) {
      for (var y = 0; y < height; y++) {
        var currentHeight = noise[x][y];

        for (var i = 0; i < terrainTypes.length; i++) {
          if (currentHeight <= terrainTypes[i].height) {
            ctx.fillStyle = terrainTypes[i].color.toHexString();
            ctx.fillRect(x, y, 1, 1);

            break;
          }
        }
      }
    }
    dynamicTexture.updateSamplingMode(Texture.NEAREST_NEAREST);

    dynamicTexture.update(false);

    mat.diffuseTexture = dynamicTexture;

    // hide/show the Inspector
    window.addEventListener("keydown", (ev) => {
      // Shift+Ctrl+Alt+I
      if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
        if (scene.debugLayer.isVisible()) {
          scene.debugLayer.hide();
        } else {
          scene.debugLayer.show();
        }
      }
    });

    // run the main render loop
    engine.runRenderLoop(() => {
      scene.render();
    });
  }
}
