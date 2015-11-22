/*jslint browser: true, node: true*/
'use strict';

var $ = require( 'jquery' );

var THREE = require('three');

var Hammer = require( 'hammerjs' );

require( './SmoothOrbitControls.js' );

var BackgroundMaterial = require( './BackgroundMaterial.js' );

var SurfacePointsMaterial = require( './SurfacePointsMaterial.js' );

var BgPointsMaterial = require( './BgPointsMaterial.js' );

var MilesMaterial = require( './MilesMaterial.js' );

var createContainer = require('./createContainer.js');

var parseOBJ = require('parse-wavefront-obj');

var MobileDetect = require('mobile-detect'),
    md = new MobileDetect( navigator.userAgent );


function APP( options ){

  var lc = $('#loadingContainer');

  var bMobile = md.mobile();

  options = options || {};

  var container = options.container || createContainer();

  var WIDTH = container.width();
  var HEIGHT = container.height();
  var ASPECT = WIDTH / HEIGHT;

  var loadingDiv = $('<div>', {text: "loading"}).css({
    position: 'absolute',
    left: '50%',
    top: '50%',
    color: "rgba(55,55,55,.75)",
    marginLeft: '-50px',
    fontSize: 24,
    zIndex: 1000,
    fontFamily: 'monospace'
  }).appendTo(container);

  //TOUCH & MOUSE INPUT
  var mc = new Hammer( container[0] );

  var pinch = new Hammer.Pinch();
  mc.add([pinch]);

  mc.get('pan').set({ 
    direction: Hammer.DIRECTION_ALL,
    threshold: 1
  });
  var dragVel = bMobile ? -0.01 : -0.01;
  
  //THREE
  var renderer, camera, controls, light, raycaster;
  var scene = new THREE.Scene();
  var clock = new THREE.Clock();
  var elapsedTime = 0;
  var mouse = new THREE.Vector2();
  var centerOfTheWorld = new THREE.Vector3( 0, 0, 0 );

  // LOADERS & LOADING MANAGER
  var textures = {};
  var manager = new THREE.LoadingManager();

  var textureLoader = new THREE.TextureLoader( manager );

  var milesMesh;
  var surfacePoints;
  var bgMat;

  var jsonLoader = new THREE.XHRLoader( manager );
  jsonLoader.setResponseType( "json" );

  var objLoader = new THREE.XHRLoader( manager );
  objLoader.setResponseType( "text" );

  // template <class T>
  function pointInTriangle( t0, t1, t2 , u,  v){
    if( ( u + v ) > 1 ){
      u = 1. - u;
      v = 1. - v;
    }
    
    return t0 * u + t1 * v + t2 * (1 - u - v);
  }
    
  function pointInTriangleV3( t0, t1, t2, u, v ){
    if( u + v > 1 ){
      u = 1.0 - u;
      v = 1.0 - v;
    }

    //return t0 * u + t1 * v + t2 * (1 - u - v);
    t0 = t0.clone().multiplyScalar( u );
    t1 = t1.clone().multiplyScalar( v );
    t2 = t2.clone().multiplyScalar( 1 - u - v );

    return t0.add( t1 ).add( t2 );
  }

  function createAmbientPoints(){

    var vertexCount = bMobile? 2500 : 5000;

    var positions = new THREE.BufferAttribute( new Float32Array( vertexCount * 3 ), 3 );
    var normals = new THREE.BufferAttribute( new Float32Array( vertexCount * 3 ), 3 );

    var p = new THREE.Vector3( 0, 0, 0 );
    var n = new THREE.Vector3( 0, 0, 0 );
    for(var i=0; i<vertexCount; i++){

      p.set( Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1 );
      n.copy( p ).normalize();
      p.normalize().multiplyScalar( Math.random() * 300 + 120 )
      positions.setXYZ( i, p.x, p.y, p.z );

      // n.set( Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1 );
      normals.setXYZ( i, n.x, n.y, n.z );
    }

    var g = new THREE.BufferGeometry();
    g.addAttribute( 'position', positions );
    g.addAttribute( 'normal', normals );

    var m = new BgPointsMaterial({
      size: 35 * window.devicePixelRatio
    });    
    
    var ambientPoints = new THREE.Points( g, m );

    bgMat = m;

    scene.add( ambientPoints );
  }

  /**
   * load our assets(textures, geometry, sounds, etc.)
   * @param  {callback} onLoad function()
   * @param {callback} onUpdate function(item, loaded, total)
   */
  function loadAssets(onLoad, onUpdate){

    manager.onProgress = onUpdate;

    manager.onLoad = onLoad;

    //TEXTURES
    textureLoader.load("./models/milesHatLow.png", function(t){
      textures.milesRough = t;
    } );

    objLoader.load( './models/milesHatLow.obj', function( data ) {
      
      var m = parseOBJ(data);
      // console.log( 'm', m );

      //faces
      var v = m.positions;
      var vUv = m.vertexUVs;
      var vNormals = m.vertexNormals;
      var cells = m.cells;
      var faceNormals = m.faceNormals;
      var faceUVs = m.faceUVs;


      var vertexCount = cells.length * 3;

      var positions = new THREE.BufferAttribute( new Float32Array( vertexCount * 3 ), 3 );
      var normals = new THREE.BufferAttribute( new Float32Array( vertexCount * 3 ), 3 );
      var uvs = new THREE.BufferAttribute( new Float32Array( vertexCount * 2 ), 2 );
      var indices = [];

      var vertexNormals = [];

      for(var i=0;i<v.length;i++){
        vertexNormals[i] = new THREE.Vector3( 0, 0, 0 );
      }

      for(var i=0, j=0; i<cells.length; i++, j+=3){

        var f0 = cells[i][0];
        var f1 = cells[i][1];
        var f2 = cells[i][2];

        var n0 = faceNormals[i][0];
        var n1 = faceNormals[i][1];
        var n2 = faceNormals[i][2];

        var n = new THREE.Vector3( vNormals[n0][0], vNormals[n0][1], vNormals[n0][2] );
        n.normalize();

        vertexNormals[f0].x += n.x;
        vertexNormals[f0].y += n.y;
        vertexNormals[f0].z += n.z;

        vertexNormals[f1].x += n.x;
        vertexNormals[f1].y += n.y;
        vertexNormals[f1].z += n.z;

        vertexNormals[f2].x += n.x;
        vertexNormals[f2].y += n.y;
        vertexNormals[f2].z += n.z;

      }


      for(var i=0;i<v.length;i++){
        vertexNormals[i].normalize();
      }

      for(var i=0, j=0; i<cells.length; i++, j+=3){

        var f0 = cells[i][0];
        var f1 = cells[i][1];
        var f2 = cells[i][2];

        positions.setXYZ( j, v[f0][0], v[f0][1], v[f0][2] );
        positions.setXYZ( j+1, v[f1][0], v[f1][1], v[f1][2] );
        positions.setXYZ( j+2, v[f2][0], v[f2][1], v[f2][2] );

        normals.setXYZ( j, vertexNormals[f0].x, vertexNormals[f0].y, vertexNormals[f0].z );
        normals.setXYZ( j+1, vertexNormals[f1].x, vertexNormals[f1].y, vertexNormals[f1].z );
        normals.setXYZ( j+2, vertexNormals[f2].x, vertexNormals[f2].y, vertexNormals[f2].z );

        var uv0 = faceUVs[i][0];
        var uv1 = faceUVs[i][1];
        var uv2 = faceUVs[i][2];

        uvs.setXY( j, vUv[uv0][0], vUv[uv0][1] );
        uvs.setXY( j+1, vUv[uv1][0], vUv[uv1][1] );
        uvs.setXY( j+2, vUv[uv2][0], vUv[uv2][1] );

      }

      var g = new THREE.BufferGeometry();
      g.addAttribute( 'position', positions );
      g.addAttribute( 'normal', normals );
      g.addAttribute( 'uv', uvs );

      var mesh = new THREE.Mesh( g, new MilesMaterial({
        side:2,
        // shading: THREE.SmoothShading
      }));

      mesh.scale.multiplyScalar( 100 );

      scene.add( mesh );

      milesMesh = mesh;

      //surface points
      
      var numParticlesPerFace = bMobile ? 1 : 3;
      var spCount = cells.length * numParticlesPerFace;

      var spPos = new THREE.BufferAttribute( new Float32Array( spCount * 3 ), 3 );
      var spNorm = new THREE.BufferAttribute( new Float32Array( spCount * 3 ), 3 );
      var spUV = new THREE.BufferAttribute( new Float32Array( spCount * 2 ), 2 );

      var p = new THREE.Vector3();
      var n = new THREE.Vector3();

      for(var i=0, j=0, k=0; i<cells.length; i++, j+=3){

        for(var l=0;l<numParticlesPerFace;l++){
          var f0 = cells[i][0];
          var f1 = cells[i][1];
          var f2 = cells[i][2];

          // console.log( v[f0][0], v[f0][1], v[f0][2] );


          var uSample = Math.random();
          var vSample = Math.random();

          p.x = pointInTriangle( v[f0][0], v[f1][0], v[f2][0], uSample, vSample );
          p.y = pointInTriangle( v[f0][1], v[f1][1], v[f2][1], uSample, vSample );
          p.z = pointInTriangle( v[f0][2], v[f1][2], v[f2][2], uSample, vSample );

          spPos.setXYZ( k, p.x, p.y, p.z );

          n.x = pointInTriangle( vertexNormals[f0].x, vertexNormals[f1].x, vertexNormals[f2].x, uSample, vSample );
          n.y = pointInTriangle( vertexNormals[f0].y, vertexNormals[f1].y, vertexNormals[f2].y, uSample, vSample );
          n.z = pointInTriangle( vertexNormals[f0].z, vertexNormals[f1].z, vertexNormals[f2].z, uSample, vSample );
          
          spNorm.setXYZ( k, n.x, n.y, n.z );

          k++;
        }
      }


      var spg = new THREE.BufferGeometry();
      spg.addAttribute( 'position', spPos );
      spg.addAttribute( 'normal', spNorm );
      spg.addAttribute( 'uv', spUV );
      surfacePoints = new THREE.Points( spg, new SurfacePointsMaterial({
        size: 1 * window.devicePixelRatio,
        opacity: .2
      }));
      mesh.add(surfacePoints);

      // if(textures.milesRough) milesMesh.material.uniforms.map.value = textures.milesRough;
      // if(textures.milesRough) surfacePoints.material.uniforms.map.value = textures.milesRough;


      loadingDiv.remove();

    });
  }



  /**
   * create materials, geometry, meshes and setup the scene
   */
  var rad = 2;
  var background;
  function setup(){

    //THREE renderer
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.autoClear = false;
    renderer.autoClearDepth = true;
    renderer.setClearColor( 0x000000 );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.sortObjects = false;
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.append( renderer.domElement );

    //camera
    camera = new THREE.PerspectiveCamera( 60, ASPECT, .1, 10000 );
    camera.position.set( -87.9975844641739, 95.04432753551475, -67.44069245555558 );
    camera.lookAt( centerOfTheWorld );

    //picking
    raycaster = new THREE.Raycaster();

    //lights
    light = new THREE.PointLight();
    scene.add( light );

    //controls
    controls = new THREE.SmoothOrbitControls( camera, renderer.domElement );
    controls.target.copy( centerOfTheWorld );
    controls.enabled = true;
    controls.zoomSpeed = 0.35;
    controls.minDistance = 60;
    controls.maxDistance = 300;
    controls.noPan = false;


    // background
    background = new THREE.Mesh( new THREE.SphereGeometry( 800 ), new BackgroundMaterial() );
    scene.add( background );

    //create some particles
    createAmbientPoints();
  }


  /**
   * non-rendering updates called once a frame
   */
  function update(){

    elapsedTime = clock.getElapsedTime();

    //camera
    controls.update();

    //light
    light.position.copy( camera.position ).multiplyScalar( 10 );

    if(background)  background.material.uniforms.uTime.value = elapsedTime * 0.25;
    if(milesMesh) milesMesh.material.uniforms.uTime.value = elapsedTime * 0.25;
    if(surfacePoints) surfacePoints.material.uniforms.time.value = elapsedTime * 0.25;
    if(bgMat) bgMat.uniforms.time.value = elapsedTime * 0.25;
  }


  /**
   * draw calls here
   */
  function draw(){
    renderer.render( scene, camera, null, true );
  }


  /**
   * tick tick tick
   */
  function animate(){

    update();

    draw();

    requestAnimationFrame(animate);
  }




  //TOUCH and MOUSE events using hammerjs
  var onPan = function( event ){
    
    event.preventDefault();
    
    //add rotation velocity to camera contorls
    controls.addVelocity( event.velocityX * dragVel, event.velocityY * dragVel );

  };

  var onTap = function( event ){

    event.preventDefault();

    console.log( event );
  };

  function setupEvents(){

    var resizeTimeout = undefined;
    var onWindowResize = function(){

      if(resizeTimeout){
        clearTimeout(resizeTimeout);
      }

      setTimeout(function(){

        WIDTH = container.width();
        HEIGHT = container.height();
        ASPECT = WIDTH / HEIGHT;

        renderer.setSize( WIDTH, HEIGHT );

        //camera
        camera.aspect = ASPECT
        camera.updateProjectionMatrix();
      }, 10);
    }

    //hammer events
    mc.on("panstart panmove panend panleft panright panup pandown", onPan );
    mc.on("tap", onTap );
    // mc.on("panend", function(e){} );
    
    var lastPinchDistance, pinchDistance;
    var p0 = new THREE.Vector2( 0, 0 );
    var p1 = new THREE.Vector2( 0, 0 );

    mc.on("pinch", function(ev) {
      
      ev.preventDefault();
      
      p0.x = ev.pointers[0].clientX;
      p0.y = ev.pointers[0].clientY;
      p1.x = ev.pointers[1].clientX;
      p1.y = ev.pointers[1].clientY;

      pinchDistance = p0.distanceTo( p1 );

      if(lastPinchDistance === undefined){
        lastPinchDistance = pinchDistance;
      }

      var delta = pinchDistance - lastPinchDistance;
      controls.zoomVel += delta * -0.1;

      if(ev.isFinal){
        lastPinchDistance = undefined;
      } else {
        lastPinchDistance = pinchDistance;
      }
    });

    mc.on("pinchend", function(ev) {
      ev.preventDefault();
      
      lastPinchDistance = undefined;
    });

    //window events
    window.addEventListener( 'resize', onWindowResize, false );

    window.addEventListener( 'keypress', function(e){

      switch( e.which ){
        case 32:

          console.log( camera );
          break;

        default:
          console.log( ' e.which: ' +  e.which );
          break
      }

    })
  }

  /**
   * load the assets and kick off the app
   */
  function begin(){

    //loading callbacks
    function onProgress ( item, loaded, total ) {
      console.log( 'assets loaded: ' + loaded + ' of ' + total );
    }

    //setup the scene
    setup();
    setupEvents();

    //TODO: after setup we should append the renderer to the container

    //kick off the animation
    animate();  

    function onLoad(){

      milesMesh.material.uniforms.map.value = textures.milesRough;
      surfacePoints.material.uniforms.map.value = textures.milesRough;

    }

    //load stuff with callbacks
    loadAssets(onLoad, onProgress);
    
  }

  // return our hooks 
  return {
    begin: begin
  };
}

//TODO: move the APP into it's own file and leave main.js for UI
var app = APP();
app.begin();

