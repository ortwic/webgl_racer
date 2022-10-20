
    if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

    var SCREEN_WIDTH = window.innerWidth;
    var SCREEN_HEIGHT = window.innerHeight;
    var FLOOR = 0;//-250;
    
    var bgpath = (window.location.hash) ? 
        window.location.hash.substr(window.location.hash.indexOf("=")+1,window.location.hash.length) : "hshof";

    var container, stats;

    var camera, scene, controls;
    var renderer;

    var mesh;

    var textureCube;
    var cameraCube, sceneCube;

    var loader;

    var mouseX = 0, mouseY = 0;

    var windowHalfX = window.innerWidth / 2;
    var windowHalfY = window.innerHeight / 2;

    init();
    animate();

    function init() {

        container = document.createElement( 'div' );
        document.body.appendChild( container );

        // SCENE

        scene = new THREE.Scene();

        // CAMERA

        camera = new THREE.PerspectiveCamera( 25, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000 );
        camera.position.set( 185, 40, 170 );
        scene.add( camera );

        controls = new THREE.TrackballControls( camera );
        controls.dynamicDampingFactor = 0.25;


        // SKYBOX

        sceneCube = new THREE.Scene();
        cameraCube = new THREE.PerspectiveCamera( 50, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000 );
        sceneCube.add( cameraCube );

        var r = "bg/" + bgpath + "/";
        var urls = [ r + "px.jpg", r + "nx.jpg",
                     r + "py.jpg", r + "ny.jpg",
                     r + "pz.jpg", r + "nz.jpg" ];


        textureCube = THREE.ImageUtils.loadTextureCube( urls );

        var shader = THREE.ShaderUtils.lib[ "cube" ];
        shader.uniforms[ "tCube" ].texture = textureCube;

        var material = new THREE.ShaderMaterial( {

            fragmentShader: shader.fragmentShader,
            vertexShader: shader.vertexShader,
            uniforms: shader.uniforms,
            depthWrite: false

        } ),

        mesh = new THREE.Mesh( new THREE.CubeGeometry( 100, 100, 100 ), material );
        mesh.flipSided = true;
        sceneCube.add( mesh );

        // LIGHTS

        var light = new THREE.PointLight( 0xffffff, 1 );
        light.position.set( 2, 5, 11 );
        light.position.multiplyScalar( 30 );
        scene.add( light );

        THREE.ColorUtils.adjustHSV( light.color, 0, -0.75, 0 );

        var light = new THREE.PointLight( 0xffffff, 0.75 );
        light.position.set( -12, 4.6, 2.4 );
        light.position.multiplyScalar( 30 );
        scene.add( light );

        THREE.ColorUtils.adjustHSV( light.color, 0, -0.5, 0 );

        scene.add( new THREE.AmbientLight( 0x050505 ) );

        // RENDERER

        renderer = new THREE.WebGLRenderer( { antialias: true, clearColor: 0xffffff, clearAlpha: 1 } );
        renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
        renderer.domElement.style.position = "relative";

        renderer.autoClear = false;

        container.appendChild( renderer.domElement );

        //

        renderer.gammaInput = true;
        renderer.gammaOutput = true;
        renderer.physicallyBasedShading = true;

        // STATS

        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '5px';
        stats.domElement.style.zIndex = 100;
        container.appendChild( stats.domElement );

        stats.domElement.children[ 0 ].children[ 0 ].style.color = "#aaa";
        stats.domElement.children[ 0 ].style.background = "transparent";
        stats.domElement.children[ 0 ].children[ 1 ].style.display = "none";

        // EVENTS

        window.addEventListener( 'resize', onWindowResize, false );
        window.addEventListener( 'mousemove', onDocumentMouseMove, false );

        // LOADER

        var start = Date.now();

        loader = new THREE.JSONLoader();

        var callbackScene   = function( geometry ) {

            createScene( geometry,  0, FLOOR, 0, 4.4 );

            var end = Date.now();

            console.log( "load time:", end - start, "ms" );

        };

        loader.load( "obj/racermodel.js", callbackScene );

    }

    //

    function hackMaterials( materials ) {

        for ( var i = 0; i < materials.length; i ++ ) {

            var m = materials[ i ];

            if ( m.name.indexOf( "Body" ) !== -1 ) {

                var mm = new THREE.MeshPhongMaterial( { map: m.map } );

                mm.envMap = textureCube;
                mm.combine = THREE.MixOperation;
                mm.reflectivity = 0.05;

                materials[ i ] = mm;

            } else if ( m.name.indexOf( "Chrom" ) !== -1 ) {

                var mm = new THREE.MeshPhongMaterial( { map: m.map } );

                mm.envMap = textureCube;
                mm.color.copy( m.color );
                mm.combine = THREE.MixOperation;
                mm.reflectivity = 0.55;

                materials[ i ] = mm;

            } else if ( m.name.indexOf( "Brakedisc" ) !== -1 ) {

                var mm = new THREE.MeshPhongMaterial( { map: m.map } );

                mm.shininess = 30;
                mm.color.setHex( 0x404040 );
                mm.metal = true;
                mm.perPixel = true;

                materials[ i ] = mm;

            } else if ( m.name.indexOf( "breaklight" ) !== -1 ) {

                var mm = new THREE.MeshPhongMaterial( { map: m.map } );

                mm.shininess = 30;
                mm.color.setHex( 0xff4040 );
                mm.combine = THREE.MixOperation;
                mm.emissive.setHex( 0xffffff );
                mm.opacity = m.opacity;
                mm.transparent = true;
                mm.metal = false;
                mm.perPixel = true;

                materials[ i ] = mm;

            }

        }

    }

    //

    function createScene( geometry, x, y, z, s ) {

        //loader.statusDomElement.style.display = "none";

        THREE.GeometryUtils.center( geometry );
        hackMaterials( geometry.materials );

        var material = new THREE.MeshFaceMaterial();

        mesh = new THREE.Mesh( geometry, material );
        mesh.position.set( x, y, z );
        mesh.scale.set( s, s, s );
        mesh.doubleSided = true;
        scene.add( mesh );

    }

    //

    function onWindowResize( event ) {

        SCREEN_WIDTH = window.innerWidth;
        SCREEN_HEIGHT = window.innerHeight;

        renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );

        camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
        camera.updateProjectionMatrix();

        cameraCube.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
        cameraCube.updateProjectionMatrix();

    }


    function onDocumentMouseMove(event) {

        mouseX = ( event.clientX - windowHalfX );
        mouseY = ( event.clientY - windowHalfY );

    }

    //

    function animate() {

        requestAnimationFrame( animate );

        render();
        stats.update();

    }

    function render() {

        controls.update();

        cameraCube.rotation.copy( camera.rotation );

        renderer.clear();
        renderer.render( sceneCube, cameraCube );
        renderer.render( scene, camera );

    }
