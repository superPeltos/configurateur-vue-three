import * as THREE from 'three';

const OrbitControls = require('three-orbitcontrols');

let camera, controls, scene, renderer;
init();
//render(); // remove when using next line for animation loop (requestAnimationFrame)
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
  camera.position.set(1000, 200, 0);

  // controls
  controls = new OrbitControls(camera, renderer.domElement);
  //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)
  controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 100;
  controls.maxDistance = 250;
  controls.maxPolarAngle = 10 * Math.PI / 21;
  controls.minAzimuthAngle = 0 * Math.PI / 21;
  controls.maxAzimuthAngle = Math.PI;

  // World
  let geometry = new THREE.PlaneGeometry(500, 500, 1);
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
  let mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = 0;
  mesh.position.y = mesh.geometry.parameters.height / 2;
  mesh.position.z = 0;
  mesh.updateMatrix();
  mesh.matrixAutoUpdate = false;

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


}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
  render();
}

function render() {
  renderer.render(scene, camera);
}
