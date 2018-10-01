var container, stats, controls;
var camera, scene, renderer, light, model;

init();
animate();

function init() {
  container = document.createElement( 'div' );
  document.body.appendChild( container );
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.25, 100 );
  camera.position.set( -3, 4, 8 );
  camera.lookAt(0, 0, 0)
    
  controls = new THREE.OrbitControls( camera );
  controls.target.set( 0, -0.2, -0.2 );
  controls.update();

  // envmap
  scene = new THREE.Scene();
  light = new THREE.HemisphereLight( 0xbbbbff, 0x444422 );
  light.position.set( 0, 10, 0 );

  scene.add( light );

  // model
  var loader = new THREE.GLTFLoader();
  loader.load( '/models/car/scene.gltf', function ( gltf ) {
    model = gltf.scene
    const bBox = new THREE.Box3().setFromObject(model);
    const min = Object.values(bBox.min)
    const max = Object.values(bBox.max)
    const size = Math.max(...min.map((v, i) => max[i] - v))
    model.scale.set(5 / size, 5 / size, 5 / size)
    scene.add( model )

  }, undefined, function ( e ) {
    console.error( e );
  } );
  renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  // renderer.gammaOutput = true;
  container.appendChild( renderer.domElement );
  window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
  requestAnimationFrame( animate );
  renderer.render( scene, camera );
}