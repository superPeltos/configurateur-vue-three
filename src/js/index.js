import * as THREE from 'three';
const OrbitControls = require('three-orbitcontrols');

var camera, controls, scene, renderer;
init();
//render(); // remove when using next line for animation loop (requestAnimationFrame)
animate();
function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xcccccc );

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );
  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 2000);
  camera.position.set( 1000, 200, 0 );
var right = new THREE.Vector3();
var up = new THREE.Vector3();
var at = new THREE.Vector3();

  // controls
  controls = new OrbitControls( camera, renderer.domElement );
  //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)
  controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 100;
  controls.maxDistance = 500;
  controls.maxPolarAngle = 10 * Math.PI / 21;
  controls.minAzimuthAngle =  0 * Math.PI / 21 ;
  controls.maxAzimuthAngle = Math.PI;




  // world
  var geometry = new THREE.PlaneGeometry( window.innerWidth, window.innerHeight, 1 );
  var material = new THREE.MeshBasicMaterial( {color: 0x000, side: THREE.DoubleSide} );
  var plainScene = new THREE.Mesh(geometry,material);
  plainScene.position.x = 0;
  plainScene.position.y = 0;
  plainScene.position.z = 0;

  var plane = plainScene;
  plane.rotation.x = Math.PI / 2;
  scene.add( plane );
   geometry = new THREE.BoxGeometry( 25,25,25 );
   material = new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } );



    var mesh = new THREE.Mesh( geometry, material );
    console.log();
    mesh.position.x = 0;
    mesh.position.y = mesh.geometry.parameters.height/2;
    mesh.position.z =0;
    mesh.updateMatrix();
    mesh.matrixAutoUpdate = false;
    scene.add( mesh );

  // lights
  var light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( 1, 1, 1 );
  scene.add( light );
  var light = new THREE.DirectionalLight( 0x002288 );
  light.position.set( - 1, - 1, - 1 );
  scene.add( light );
  var light = new THREE.AmbientLight( 0x222222 );
  scene.add( light );
  //
  scene.add( camera );
  window.addEventListener( 'resize', onWindowResize, false );



}
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}
function animate() {
  requestAnimationFrame( animate );
  controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
  render();
}
function render() {
  renderer.render( scene, camera );
}
