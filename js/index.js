let container, stats, controls;
let camera, camera2, scene, renderer, light, model;
let eyes = { x: 0, y: 0, z: 0 }
let scale = 1

init();
animate();

const webcam = document.getElementById("webcam");
      
handleTrackingResults = function(brfv4, faces) {
  
  const face = faces[0];
  const faceFound = face.state === brfv4.BRFState.FACE_TRACKING_START || face.state === brfv4.BRFState.FACE_TRACKING;

  if(faceFound) {
    if (!face.vertices[54] && !face.vertices[55]) return

    const min = face.vertices.reduce((a, b) => Math.min(a, b), Infinity)
    const max = face.vertices.reduce((a, b) => Math.max(a, b), -Infinity)
    const newScale = 1 / (window.innerWidth / (max - min) / 10)
    
    eyes = { 
      x: eyes.x * .8 + .2 * (face.vertices[54] / webcam.videoWidth - .5) * 2, 
      y: eyes.y * .8 + .2 * (face.vertices[55] / webcam.videoHeight - .5) * -2,
      z: eyes.z * .9 + .1 * Math.max(-.25, (.75 - newScale))
    }

  }
};

function init() {
  container = document.createElement( 'div' );
  document.body.appendChild( container );
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.25, 100 );
  camera.position.set( -3, 2, 8 );

  camera2 = camera.clone()
    
  controls = new THREE.OrbitControls(camera);
  controls.target.set( 0, -0.2, -0.2 );
  controls.update();

  // envmap
  scene = new THREE.Scene();
  light = new THREE.AmbientLight(0xffffff, 5);
  light.position.set( 0, 10, 0 );

  scene.add( light );

  var directionalLight = new THREE.DirectionalLight(0xffffff, 5);
  scene.add( directionalLight );

  // model
  var loader = new THREE.GLTFLoader();
  loader.load('models/car/scene.gltf', function ( gltf ) {
    model = gltf.scene
    const bBox = new THREE.Box3().setFromObject(model);
    const min = Object.values(bBox.min)
    const max = Object.values(bBox.max)
    const size = Math.max(...min.map((v, i) => max[i] - v))
    model.scale.set(5 / size, 5 / size, 5 / size)
    model.position.x -= .75
    scene.add( model )
    camera.lookAt(model.position)

  }, undefined, function ( e ) {
    console.error( e );
  } );

  // const loader = new THREE.PLYLoader();
  // loader.load('/models/dennis/deniax.ply', function(buffGeometry) {
  //   let geometry = new THREE.Geometry().fromBufferGeometry( buffGeometry );
  //   var material = new THREE.MeshPhongMaterial( { specular: 0x111111, shininess: 0, vertexColors: THREE.VertexColors } );
  //   model = new THREE.Mesh( geometry, material );
    
  //   const bBox = new THREE.Box3().setFromObject(model);
  //   const min = Object.values(bBox.min)
  //   const max = Object.values(bBox.max)
  //   const size = Math.max(...min.map((v, i) => max[i] - v))
  //   model.scale.set(5 / size, 5 / size, 5 / size)
  //   model.rotateX(Math.PI / 180 * -90)
  //   // model.position.x -= .75
  //   scene.add( model )
  //   camera.lookAt(model.position)
  // })

  renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.gammaOutput = true;
  container.appendChild( renderer.domElement );
  window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  camera2.aspect = window.innerWidth / window.innerHeight;
  camera2.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
  model && camera.lookAt(model.position)
  camera2.position.set( camera.position.x + eyes.x * 10, camera.position.y + eyes.y * 10, camera.position.z + eyes.z * 10);
  model && camera2.lookAt(model.position)
  requestAnimationFrame( animate );
  renderer.render( scene, camera2 );
}