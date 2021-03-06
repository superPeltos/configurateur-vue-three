import * as THREE from 'three';

var data = require('../asset/data.json');

const OrbitControls = require('three-orbitcontrols');

const CAMERA = 1, DRAG = 2, ADD = 3;
document.addEventListener('build', function (e) {

  let roomWidth = e.detail.width / 10;
  let roomHeight = 300;
  let roomDepth = e.detail.depth / 10;
  let realRoomWidth = e.detail.width;
  let realRoomHeight = 3000;
  let realRoomDepth = e.detail.depth;


  let mouse = new THREE.Vector2();
  let normalMatrix = new THREE.Matrix3();
  let worldNormal = new THREE.Vector3();
  let objectDragg;
  let currentIndex = -1;

  let camera, controls, scene, renderer;
  let mouseAction;
  let dragging = false;
  let raycaster;
  let intersects;
  let targetForDragging;
  let cubes = [];
  let colisions = [];

  init();
//render(); // remove when using next line for animation loop (requestAnimationFrame)
  animate();
  function init() {
    mouseAction = CAMERA;
    document.getElementById("mouseCamera").onchange = doChangeMouseAction;
    document.getElementById("mouseDrag").onchange = doChangeMouseAction;
    document.getElementById("mouseAdd").onchange = doChangeMouseAction;

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
    camera.position.set(0, roomWidth*6/7, roomWidth);

    // controls
    controls = new OrbitControls(camera, renderer.domElement);
    //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    /*controls.minDistance = 0;
    controls.maxDistance = roomWidth*2/3;
    controls.maxPolarAngle = 8 * Math.PI / 21;
    controls.minAzimuthAngle = Math.PI/4;
    controls.maxAzimuthAngle = Math.PI-Math.PI/4;*/

    // World
    let geometry = new THREE.PlaneGeometry(roomWidth, roomDepth, 1);
    let texture = new THREE.TextureLoader().load('src/asset/ground.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 3);

    var material = new THREE.MeshBasicMaterial({ map: texture });
    let floor = new THREE.Mesh(geometry, material);
    floor.position.x = 0;
    floor.position.y = 0;
    floor.position.z = 0;
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    let walls = [
      {
        name: 'wallL',
        position: {
          x: -roomWidth / 2,
          y: roomHeight / 2,
          z: 0,
        },
        rotation: {
          y: Math.PI / 2,
        }
      },
      {
        name: 'wallF',
        position: {
          x: 0,
          y: roomHeight / 2,
          z: roomDepth / 2,
        },
        rotation: {
          y: -Math.PI
        }
      },
      {
        name: 'wallR',
        position: {
          x: roomWidth / 2,
          y: roomHeight / 2,
          z: 0,
        },
        rotation: {
          y: -Math.PI / 2,
        }
      },
      {
        name: 'wallB',
        position: {
          x: 0,
          y: roomHeight / 2,
          z: -roomDepth / 2,
        },
        rotation: {
          y: 0
        }
      },
    ];

    walls.forEach((wall) => {
      let texture = new THREE.TextureLoader().load('src/asset/wall.jpeg');
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(16, 16);

      material = new THREE.MeshBasicMaterial({map: texture});
      if(wall.name ==="wallL" || wall.name ==="wallR" ) {
        geometry = new THREE.PlaneGeometry(roomDepth, roomHeight, 1);
      }
      else {
        geometry = new THREE.PlaneGeometry(roomWidth, roomHeight, 1);
      }
      let w = new THREE.Mesh(geometry, material);
      w.position.x = wall.position.x;
      w.position.y = wall.position.y;
      w.position.z = wall.position.z;
      if (wall.hasOwnProperty('rotation')) {
        w.rotation.y = wall.rotation.y
      }
      scene.add(w);
    });

    // Logo
    const logoTexture = new THREE.TextureLoader().load('src/asset/logo.png');
    const logoMaterial = new THREE.MeshBasicMaterial({ map: logoTexture, transparent: true });
    const logoGeometry = new THREE.PlaneGeometry(978 / 5, 250 / 5, 1);
    const logo = new THREE.Mesh(logoGeometry, logoMaterial);
    const backWall = walls.filter(wall => wall.name === 'wallF')[0];
    logo.rotation.y = Math.PI;
    logo.position.x = backWall.position.x;
    logo.position.y = backWall.position.y;
    logo.position.z = backWall.position.z - 1;
    scene.add(logo);

    // Object
    document.addEventListener('selectProduct', function (e) {
      generateMesh(0, 0,e.detail.product);
      cubes.forEach((cube) => {
        scene.add(cube);
      });
    });

    // Lights
    var light = new THREE.DirectionalLight(0xffffff);
    light.position.set(1, 1, 1);
    scene.add(light);
    var light = new THREE.DirectionalLight(0x002288);
    light.position.set(-1, -1, -1);
    scene.add(light);
    var light = new THREE.AmbientLight(0x222222);
    scene.add(light);

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
    requestAnimationFrame(animate);
    if (mouseAction !== CAMERA) {
      controls.enabled = false;
    } else {
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
    } else if (document.getElementById("mouseAdd").checked) {
      mouseAction = ADD;
    }
  }


  function doMouseDown(event) {
    if (mouseAction === DRAG) {
      dragging = true;
      mouse.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
      raycaster.setFromCamera(mouse, camera);
      intersects = raycaster.intersectObjects(cubes);
      if (intersects.length === 0 ) return;
      objectDragg = intersects[0];
      saveObjectDraggIndex();
    } else if (mouseAction === ADD) {
      /*console.log('coucou');
      mouse.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
      raycaster.setFromCamera(mouse, camera);
      intersects = raycaster.intersectObjects(scene.children);
      if (intersects.length === 0 ) return;

      normalMatrix.getNormalMatrix(intersects[0].object.matrixWorld);
      worldNormal.copy(intersects[0].face.normal).applyMatrix3(normalMatrix).normalize();
      //let newPos = intersects[0].point;
      console.log(cubes);
      generateMesh();
      cubes.forEach((cube) => {
        scene.add(cube);
      });
  */
    }
  }

  function doMouseMove(event) {
    if (mouseAction === CAMERA || mouseAction === ADD) {
      return true;
    }
    else {
      if(dragging){
        if(objectDragg!==null) {
          mouse.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
          raycaster.setFromCamera(mouse, camera);
          intersects = raycaster.intersectObjects(scene.children);
          if (intersects.length === 0 || !dragging) return;
          normalMatrix.getNormalMatrix(objectDragg.object.matrixWorld);
          worldNormal.copy(objectDragg.face.normal).applyMatrix3(normalMatrix).normalize();
          let newPos = intersects[0].point;

          let a = Math.min(roomWidth / 2 - objectDragg.object.geometry.parameters.width / 2, Math.max(-roomWidth / 2 + objectDragg.object.geometry.parameters.width / 2, newPos.x));
          let b = Math.min(roomDepth / 2 - objectDragg.object.geometry.parameters.depth / 2, Math.max(-roomDepth / 2 + objectDragg.object.geometry.parameters.depth / 2, newPos.z));

          objectDragg.object.position.set(a, objectDragg.object.position.y, b);

          if(colision()) {
            objectDragg.object.material.opacity = 0.25;
          }else {
            objectDragg.object.material.opacity = 1;
          }
        }

      }
    }
  }
  function doMouseUp() {
    dragging = false;
    objectDragg = null;
  }

  function colision(){
    console.log(colisions);
    let isColision = false;

    let posX = objectDragg.object.position.x;
    let posZ = objectDragg.object.position.z;

    let width = objectDragg.object.geometry.parameters.width;
    let depth = objectDragg.object.geometry.parameters.depth;
    colisions[currentIndex] = [];

    cubes.forEach(function (element,index) {
      if(index !== currentIndex) {
        let diffX = posX - element.position.x;
        let diffZ = posZ - element.position.z;

        diffX = Math.abs(diffX) - (width/2 + element.geometry.parameters.width/2);
        diffZ = Math.abs(diffZ) - (depth/2 + element.geometry.parameters.depth/2);

        if( diffX < 0 && diffZ < 0) {
          colisions[currentIndex].push(index);
          if(colisions[index].indexOf(currentIndex) !== -1) {
            colisions[index].push(currentIndex);
          }
          isColision = true;
          element.material.opacity = 0.25;
        }else {
          element.material.opacity = 1;
        }
      }
    });

    return isColision;
  }

  function saveObjectDraggIndex() {
    let posX = objectDragg.object.position.x;
    let posY = objectDragg.object.position.y;
    let posZ = objectDragg.object.position.z;
    cubes.forEach(function (element,index) {
      if(element.position.x === posX &&element.position.y === posY &&element.position.z === posZ) {
        currentIndex = index;
      }
    });


  }

  function generateMesh(x,z,product){
    console.log(product);
    let lastWidth = 0;
    let anotherLine = 0;

//      if(index === 3) {
//        anotherLine =1;
//        lastWidth = 0;
//      }
//      if(index === 6) {
//        anotherLine =2;
//        lastWidth = 0;
//      }
      let realHeight = product.dimension.height*roomHeight/realRoomHeight;
      let realWidth = product.dimension.width*roomWidth/realRoomWidth;
      let realDepth = product.dimension.depth*roomDepth/realRoomDepth;

      let imageName = product.ref;
      imageName = imageName.replace('.','')+'.png';

      let geometry = new THREE.BoxGeometry(realWidth, realHeight, realDepth);
      let loader = new THREE.TextureLoader();
      loader.setPath("src/asset/");
      var material = new THREE.MeshBasicMaterial( { transparent:true, map: loader.load( imageName ) } );
      let mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = - roomWidth/2 + realWidth/2 + lastWidth ;
      mesh.position.y = mesh.geometry.parameters.height / 2;
      mesh.position.z = -roomDepth/2+ + realDepth/2 + anotherLine*2*roomDepth/5;
      colisions.push([]);
      cubes.push(mesh);
      lastWidth += realWidth+50;

  }

});
