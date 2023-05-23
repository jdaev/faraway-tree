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
  double,
  float,
  Vector2,
  VertexData,
  FlyCamera,
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

class MeshData {
  vertices: Vector3[];
  triangles: number[];
  uv: Vector2[];

  constructor() {
    this.vertices = [];
    this.triangles = [];
    this.uv = [];
  }

  addTriangle(a: number, b: number, c: number) {
    this.triangles.push(a);
    this.triangles.push(b);
    this.triangles.push(c);
  }

  createMesh(scene: Scene, heightMap: number[][]) {
    var mesh = new Mesh("terrain", scene);

    var width = heightMap.length;
    var height = heightMap[0].length;

    var vertexIndex = 0;

    for (var x = 0; x < width; x++) {
      for (var y = 0; y < height; y++) {
        this.vertices.push(
          new Vector3(x - width / 2, heightMap[x][y], y - height / 2)
        );

        this.uv.push(new Vector2(x / width, y / height));

        if (x < width - 1 && y < height - 1) {
          this.addTriangle(
            vertexIndex,
            vertexIndex + width + 1,
            vertexIndex + width
          );
          this.addTriangle(
            vertexIndex + width + 1,
            vertexIndex,
            vertexIndex + 1
          );
        }

        vertexIndex++;
      }
    }
    var vertexData = new VertexData();
    vertexData.positions = this.vertices.reduce(
      (accumulator, v) => accumulator.concat([v.x, v.y, v.z]),
      []
    );

    vertexData.indices = this.triangles;

    vertexData.uvs = this.uv.reduce(
      (accumulator, uv) => accumulator.concat([uv.x, uv.y]),
      []
    );

    vertexData.applyToMesh(mesh);

    mesh.createNormals(true);

    return mesh;
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
      new TerrainType("water", 0.5, Color3.Blue()),
      new TerrainType("sand", 0.6, Color3.Yellow()),
      new TerrainType("grass", 0.7, Color3.Green()),
      new TerrainType("rock", 0.9, Color3.Gray()),
      new TerrainType("snow", 1, Color3.White()),
    ];

    var camera: ArcRotateCamera = new ArcRotateCamera(
      "Camera",
      0,
      Math.PI / 2,
      2,
      Vector3.Zero(),
      scene
    );
    camera.setTarget(Vector3.Zero());
    camera.attachControl(true);
    var light1: HemisphericLight = new HemisphericLight(
      "light1",
      new Vector3(0, 0, 0),
      scene
    );

    light1.intensity = 10;
    light1.diffuse = new Color3(1, 1, 1);

    var mat = new StandardMaterial("mat", scene);

    mat.backFaceCulling = false;

    var noise = generateNoiseMap(100, 100, 25, 4, 0.5, 2, { x: 0, y: 0 });

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

    var meshData = new MeshData();

    var mesh = meshData.createMesh(scene, noise);
    mesh.position = Vector3.Zero();
    mesh.material = mat;

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
