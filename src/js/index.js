import * as THREE from 'three';
const OrbitControls = require('three-orbitcontrols');

const CAMERA = 1, DRAG = 2;

let roomWidth = 500;
let roomHeight = 500;

let mouse = new THREE.Vector2();
let mesh;
let normalMatrix = new THREE.Matrix3();
let worldNormal = new THREE.Vector3();

let camera, controls, scene, renderer;
let mouseAction;
let dragging = false;
let raycaster;
let intersects;
let targetForDragging;

init();
//render(); // remove when using next line for animation loop (requestAnimationFrame)
animate();
function init() {
  mouseAction = CAMERA;
  document.getElementById("mouseCamera").onchange = doChangeMouseAction;
  document.getElementById("mouseDrag").onchange = doChangeMouseAction;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  renderer.domElement.addEventListener("mousedown", doMouseDown);
  renderer.domElement.addEventListener("mousemove", doMouseMove);
  renderer.domElement.addEventListener("mouseup", doMouseUp);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
  camera.position.set(500, roomWidth*6/7, 0);

  // controls
  controls = new OrbitControls(camera, renderer.domElement);
  //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)
  controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 0;
  controls.maxDistance = roomWidth*2/3;
  controls.maxPolarAngle = 8 * Math.PI / 21;
  controls.minAzimuthAngle = Math.PI/4;
  controls.maxAzimuthAngle = Math.PI-Math.PI/4;

  // World
  let geometry = new THREE.PlaneGeometry(roomWidth, roomHeight, 1);
  let material = new THREE.MeshBasicMaterial({color: 0x000, side: THREE.DoubleSide});
  let floor = new THREE.Mesh(geometry, material);
  floor.position.x = 0;
  floor.position.y = 0;
  floor.position.z = 0;
  floor.rotation.x = Math.PI / 2;
  scene.add(floor);

  let walls = [
    {
      name: 'wallB',
      color: 0xcfdce8,
      position: {
        x: -floor.geometry.parameters.width / 2,
        y: 0,
        z: 0,
      },
      rotation: {
        y: Math.PI / 2,
      }
    }, {
      name: 'wallR',
      color: 0xf0f8ff,
      position: {
        x: 0,
        y: 0,
        z: floor.geometry.parameters.width / 2,
      }
    }, {
      name: 'wallL',
      color: 0xf0f8ff,
      position: {
        x: 0,
        y: 0,
        z: -floor.geometry.parameters.width / 2,
      },
    }
  ];

  walls.map((wall) => {
    material = new THREE.MeshBasicMaterial({color: wall.color, side: THREE.DoubleSide});
    let w = new THREE.Mesh(geometry, material);
    w.position.x = wall.position.x;
    w.position.y = wall.position.y;
    w.position.z = wall.position.z;
    if(wall.hasOwnProperty('rotation')){
      w.rotation.y = wall.rotation.y
    }
    scene.add(w);
  });

  // Object
  geometry = new THREE.BoxGeometry(25, 25, 25);
  material = new THREE.MeshPhongMaterial({color: 0xffffff, flatShading: true});
  mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = 0;
  mesh.position.y = mesh.geometry.parameters.height / 2;
  mesh.position.z = 0;

  scene.add(mesh);

  // Lights
  var light = new THREE.DirectionalLight(0xffffff);
  light.position.set(1, 1, 1);
  scene.add(light);
  var light = new THREE.DirectionalLight(0x002288);
  light.position.set(-1, -1, -1);
  scene.add(light);
  var light = new THREE.AmbientLight(0x222222);
  scene.add(light);
  //
  window.addEventListener('resize', onWindowResize, false);

  targetForDragging = new THREE.Mesh(
    new THREE.BoxGeometry(100,0.01,100),
    new THREE.MeshBasicMaterial()
  );
  targetForDragging.material.visible = false;

  raycaster = new THREE.Raycaster();
}
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}
function animate() {
  requestAnimationFrame( animate );
  if(mouseAction!==CAMERA) {
    controls.enabled = false;
  }
  else {
    controls.enabled = true;
  }
  controls.update();
  render();
}
function render() {
  renderer.render( scene, camera );
}

function doChangeMouseAction() {
  if (document.getElementById("mouseCamera").checked) {
    mouseAction = CAMERA;
  }
  else if (document.getElementById("mouseDrag").checked) {
    mouseAction = DRAG;
  }
}


function doMouseDown(){
  dragging = true;
}

function doMouseMove(event) {
  if(mouseAction===CAMERA) {
    return true;
  }
  else {
    if(dragging){
      mouse.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
      raycaster.setFromCamera(mouse, camera);
      intersects = raycaster.intersectObjects(scene.children);
      if (intersects.length === 0 || !dragging) return;

      console.log(intersects);

      normalMatrix.getNormalMatrix(intersects[0].object.matrixWorld);
      worldNormal.copy(intersects[0].face.normal).applyMatrix3(normalMatrix).normalize();
      let newPos = intersects[0].point;

      let a = Math.min(roomWidth/2-mesh.geometry.parameters.width/2,Math.max(-roomWidth/2+mesh.geometry.parameters.width/2,newPos.x));  // clamp coords to the range -19 to 19, so object stays on ground
      let b = Math.min(roomWidth/2-mesh.geometry.parameters.width/2,Math.max(-roomWidth/2+mesh.geometry.parameters.width/2,newPos.z));
      mesh.position.set(a,mesh.position.y,b);

      render();
    }
  }
}
function doMouseUp() {
  dragging = false;
}
