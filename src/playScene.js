/**
 * Created by kk on 2015/5/11.
 */

var ROW_NUM = 8;
var COL_NUM = 28;
var CUBE_LENGTH = 2;

var PlayScene = kk.Class.extend({
    step:0,
    step2:0,
    stats:null,
    controls:null,
    ctor:function(){
        var scope = this;
        this.step = 0;
        this.step2 = 0;
        this.init();

        this.sceneControl = new kk.OrbitControls(camera);
        this.sceneControl.center.y = 10;
        this.sceneControl.userPan = false;
        //this.sceneControl.fixedUpDown = true;
        //this.sceneControl.autoRotate = true;
        this.sceneControl.setEnabled(false);
        kk.director.getScheduler().scheduleUpdate(this.sceneControl, 0, false);

        var listener1 = kk.EventListener.create({
            event: kk.EventListener.TOUCH,
            swallowTouches: true,
            onTap: function (e) {
                scope.onTap({x:e.center.x, y:e.center.y});
            }
        });
        kk.eventManager.addListener(listener1);
        kk.director.getScheduler().scheduleUpdate(this, 0, false);

    },
    init:function() {
        this.initStats();

        this.createGUI();

        // create a scene, that will hold all our elements such as objects, cameras and lights.
        scene = new THREE.Scene();
        //scene.fog=new THREE.FogExp2( 0xffffff, 0.015 );
        //scene.fog = new THREE.Fog(0xddbbaa, 0.005, 300);
        //scene.overrideMaterial = new THREE.MeshLambertMaterial({color: 0xffffff});

        // create a camera, which defines where we're looking at.
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

        // create a render and set the size
        renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(new THREE.Color(0xaaaaaa));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMapEnabled = true;
        //renderer.shadowMapType = THREE.PCFShadowMap;

        // add the output of the renderer to the html element
        document.getElementById("WebGL-output").appendChild(renderer.domElement);

        // position and point the camera to the center of the scene
        camera.position.x = 0;
        camera.position.y = 55;
        camera.position.z = 50;
        //camera.lookAt(new THREE.Vector3(0, 25, 0));

        // show axes in the screen
        var axes = new THREE.AxisHelper(20);
        scene.add(axes);

        /*
        var scope = this;

        var listener2 = kk.EventListener.create({
            event: kk.EventListener.PAN,
            swallowTouches: true,
            onPan: function (e) {
                this.orbitControls.onPan(e);
            }
        });
        kk.eventManager.addListener(listener2);

        kk.hammer.on("panstart", function (e) {
            //console.log("panstart");
            scope.orbitControls.dispatchEvent({type:"panstart",
                x: e.center.x,y: e.center.y});
        });
        kk.hammer.on("pan", function (e) {
            //console.log(e);
            scope.orbitControls.dispatchEvent({type:"pan",
                x: e.center.x,y: e.center.y,deltaX: e.deltaX, deltaY: e.deltaY});
        });*/

        /*
        this.trackballControls = new THREE.TrackballControls(camera);
        this.trackballControls.rotateSpeed = 1.0;
        this.trackballControls.zoomSpeed = 1.0;
        this.trackballControls.panSpeed = 1.0;
        //this.trackballControls.noZoom=false;
        this.trackballControls.noPan=true;
        //this.trackballControls.staticMoving = true;
        //this.trackballControls.dynamicDampingFactor=0.3;*/

        this.initLight();

        this.initObjs();

    },
    initLight:function() {
        var ambientLight = new THREE.AmbientLight(0x555555);
        scene.add(ambientLight);

        //小球光
        var pointColor = "#ccffcc";
        this.pointLight = new THREE.PointLight(pointColor);
        this.pointLight.distance = 30;
        this.pointLight.position.set(20, 15, 20);
        scene.add(this.pointLight);
        //this.pointLight.visible = false;
        // add a small sphere simulating the pointlight
        var sphereLight = new THREE.SphereGeometry(0.2);
        var sphereLightMaterial = new THREE.MeshBasicMaterial({color: 0xac6c25});
        this.sphereLightMesh = new THREE.Mesh(sphereLight, sphereLightMaterial);
        this.sphereLightMesh.castShadow = true;
        this.sphereLightMesh.position.set(20, 15, 20);
        scene.add(this.sphereLightMesh);
        /*
         // 锥光，有阴影
         this.spotLight = new THREE.SpotLight(0xeecccc);
         this.spotLight.position.set(25, 50, 25);
         this.spotLight.intensity = 1;
         this.spotLight.castShadow = true;
         this.spotLight.target = plane;
         scene.add(this.spotLight);*/
        /*
         this.spotLight2 = new THREE.SpotLight(0xeecccc);
         this.spotLight2.position.set(20, 30, 20);
         this.spotLight2.intensity = 1;
         this.spotLight2.castShadow = true;
         this.spotLight2.target = plane;
         scene.add(this.spotLight2);*/

        var target = new THREE.Object3D();
        target.position = new THREE.Vector3(0, 0, 0);
        //远光
        var pointColor = "#ff5808";
        var directionalLight = new THREE.DirectionalLight(pointColor);
        directionalLight.position.set(25, 50, 25);
        directionalLight.castShadow = true;
        directionalLight.shadowCameraNear = 2;
        directionalLight.shadowCameraFar = 100;
        directionalLight.shadowCameraLeft = -50;
        directionalLight.shadowCameraRight = 50;
        directionalLight.shadowCameraTop = 50;
        directionalLight.shadowCameraBottom = -50;

        directionalLight.distance = 0;
        directionalLight.intensity = 0.5;
        directionalLight.shadowMapHeight = 1024;
        directionalLight.shadowMapWidth = 1024;
        directionalLight.target = target;
        directionalLight.shadowCameraVisible = true;
        scene.add(directionalLight);

        // create the ground plane
        /*
         var planeGeometry = new THREE.PlaneBufferGeometry(1000, 1000, 1, 1);
         var planeMaterial = new THREE.MeshLambertMaterial({color: 0xeb73eb});
         var plane = new THREE.Mesh(planeGeometry, planeMaterial);
         plane.receiveShadow = true;
         // rotate and position the plane
         plane.rotation.x = -0.5 * Math.PI;
         plane.position.x = 0;
         plane.position.y = 0;
         plane.position.z = 0;
         // add the plane to the scene
         scene.add(plane);
         */
    },
    initObjs:function(){
        //平地
        var floorTex = THREE.ImageUtils.loadTexture("res/brick-wall.jpg");
        floorTex.wrapT = THREE.RepeatWrapping;
        floorTex.wrapS = THREE.RepeatWrapping;
        var mat = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            map: floorTex
        });
        var geom = new THREE.BoxGeometry(500, 500, 1, 30);
        geom.computeVertexNormals();
        var plane = new THREE.Mesh(geom, mat);
        plane.rotation.x = -0.5 * Math.PI;
        plane.receiveShadow = true;
        plane.material.map.repeat.set(10,10);
        plane.material.map.needUpdate = true;
        scene.add(plane);

        this.createCubes();

        //一个球
        /*
        var sphereGeometry = new THREE.SphereGeometry(4, 20, 20);
        var sphereMaterial = new THREE.MeshLambertMaterial({color: 0x7777ff});
        var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.castShadow = true;
        // position the sphere
        sphere.position.x = 0;
        sphere.position.y = 20;
        sphere.position.z = 0;
        // add the sphere to the scene
        scene.add(sphere);
        */

        this.loadObj2();

        this.createControlObj();
    },
    createControlObj:function(){
        var cubeGeometry = new THREE.BoxGeometry(5, 5, 5);
        var cubeMaterial = new THREE.MeshLambertMaterial({color: 0xaaaadd});
        var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.castShadow = true;
        // position the cube
        cube.position.x = -5;
        cube.position.z = 15;
        cube.position.y = 15;
        cube.lookAt(cube);
        scene.add(cube);

        var ctr = new kk.OrbitControls(cube);
        ctr.center.y = 10;
        ctr.userPan = false;
        kk.director.getScheduler().scheduleUpdate(ctr, 0, false);
    },
    loadObj2:function() {
        var loader = new THREE.ColladaLoader();
        var mesh;
        loader.load("res/Truck_dae.dae", function (result) {
            mesh = result.scene.children[0].children[0].clone();
            mesh.scale.set(0.5, 0.5, 0.5);
            mesh.position.set(20, 0, 20);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            //kk.log(mesh)
            mesh.traverse(function(child)
            {
                if (child instanceof THREE.Mesh)
                {
                    //设置模型生成阴影并接收阴影
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            scene.add(mesh);
        });
    },
    loadObj:function(){
        var loader = new THREE.OBJMTLLoader();

        loader.load('res/butterfly.obj', 'res/butterfly.mtl', function (object) {

            //traverse：回调，该模型以及所有子模型均执行该函数
            //相当于遍历obj的children数组
            object.traverse(function(child)
            {
                if (child instanceof THREE.Mesh)
                {
                    //设置模型生成阴影并接收阴影
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            /*
            // configure the wings
            var wing2 = object.children[5].children[0];
            var wing1 = object.children[4].children[0];
            wing1.castShadow = true;
            wing2.castShadow = true;

            wing1.material.opacity = 0.6;
            //wing1.material.transparent = true;
            //wing1.material.depthTest = false;
            wing1.material.side = THREE.DoubleSide;

            wing2.material.opacity = 0.6;
            //wing2.material.depthTest = false;
            //wing2.material.transparent = true;
            wing2.material.side = THREE.DoubleSide;
            */

            object.scale.set(30, 30, 30);
            object.position.set(10,6,15)
            object.castShadow = true;
            object.receiveShadow = true;

            scene.add(object);
        });
    },
    createCubes:function() {
        if (this.cubeGroup != null)
            this.cubeGroup.parent.remove(this.cubeGroup);
        ROW_NUM = this.controls.rows;
        COL_NUM = this.controls.cols;
        CUBE_LENGTH = this.controls.length;
        this.cm = new CubeManager(this, ROW_NUM, COL_NUM, CUBE_LENGTH);
        this.cubeGroup = new THREE.Group();
        scene.add(this.cubeGroup);
        for (var r = 0; r < ROW_NUM; r++) {
            for (var c = 0; c < COL_NUM; c++) {
                var cube = this.createOneCube(r, c);
                this.cubeGroup.add(cube);
            }
        }
    },
    createOneCube2:function(row,col){
        var angle = (Math.PI*2/this.controls.cols)*col;
        // create a cube
        var name;
        var idx = Math.ceil((Math.random() * 3));
        if(idx == 1)
            name = "res/brick-wall.jpg";
        else if(idx==2)
            name = "res/weave-bump.jpg";
        else if(idx==3)
            name = "res/wood-2.jpg";

        var geom = new THREE.BoxGeometry(CUBE_LENGTH, CUBE_LENGTH, CUBE_LENGTH);
        var texture = THREE.ImageUtils.loadTexture(name);
        var mat = new THREE.MeshPhongMaterial();
        mat.map = texture;
        var cube = new THREE.Mesh(geom, mat);
        cube.castShadow = true;
        cube.receiveShadow = true;
        // position the cube
        cube.position.x = ( 10 * (Math.cos(angle)));
        cube.position.z = ( 10 * Math.sin(angle));
        cube.position.y = (CUBE_LENGTH*1.1) * (row+1);
        cube.rotation.y = -angle;
        cube.idx = row*COL_NUM+col;
        this.cm.setCube(cube.idx, cube, idx);
        return cube

    },
    createOneCube:function(row,col){
        var angle = (Math.PI*2/this.controls.cols)*col;
        // create a cube
        var color;
        var idx = Math.ceil((Math.random() * 3));
        if(idx == 1)
            color =  {color: 0xff0000};
        else if(idx==2)
            color =  {color: 0x00ff00};
        else if(idx==3)
            color =  {color: 0x0000ff};
        var cubeGeometry = new THREE.BoxGeometry(CUBE_LENGTH, CUBE_LENGTH, CUBE_LENGTH);
        var cubeMaterial = new THREE.MeshLambertMaterial(color);
        var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.castShadow = true;
        // position the cube
        cube.position.x = ( 10 * (Math.cos(angle)));
        cube.position.z = ( 10 * Math.sin(angle));
        cube.position.y = (CUBE_LENGTH*1.1) * (row+1);
        cube.rotation.y = -angle;
        cube.idx = row*COL_NUM+col;
        this.cm.setCube(cube.idx, cube, idx);
        return cube;
    },
    update:function(dt){
        this.stats.update();
        //this.trackballControls.update(dt);

        this.step+=0.02;
        if(this.step > Math.PI*2) this.step -= Math.PI*2;
        /*
        this.step2+=0.03;
        if(this.step2 > Math.PI*2) this.step2 -= Math.PI*2;
        this.spotLight.position.x = 100 * (Math.cos(this.step));
        this.spotLight.position.z = 100 * (Math.sin(this.step));
        this.spotLight2.position.x = 100 * (Math.cos(Math.PI+this.step));
        this.spotLight2.position.z = 100 * (Math.sin(Math.PI+this.step));*/

        this.sphereLightMesh.position.x = 20 * (Math.cos(this.step));
        this.sphereLightMesh.position.z = 20 * (Math.sin(this.step));
        this.pointLight.position.x = 20 * (Math.cos(this.step));
        this.pointLight.position.z = 20 * (Math.sin(this.step));
        //this.pointLight.position.copy(this.sphereLightMesh.position);

        // rotate the cubes around its axes
        /*
         scene.traverse(function (e) {
         if (e instanceof THREE.Mesh && e != plane) {
         e.rotation.x += this.controls.rotationSpeed;
         e.rotation.y += this.controls.rotationSpeed;
         e.rotation.z += this.controls.rotationSpeed;
         }
         });*/
        /*
         // bounce the sphere up and down
         step += this.controls.bouncingSpeed;
         sphere.position.x = 20 + ( 10 * (Math.cos(step)));
         sphere.position.y = 2 + ( 10 * Math.abs(Math.sin(step)));
         */

        renderer.render(scene, camera);
    },
    onTap:function(event){
        var vector = new THREE.Vector3(( event.x / window.innerWidth ) * 2 - 1, -( event.y / window.innerHeight ) * 2 + 1, 0.5);
        vector = vector.unproject(camera);

        var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

        var intersects = raycaster.intersectObjects(this.cubeGroup.children);

        if (intersects.length > 0) {
            this.cm.breakCube(intersects[0].object.idx);
        }
    },
    initStats:function() {
        this.stats = new Stats();
        this.stats.setMode(0); // 0: fps, 1: ms
        // Align top-left
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.left = '0px';
        this.stats.domElement.style.top = '0px';

        document.getElementById("Stats-output").appendChild(this.stats.domElement);
    },
    createGUI:function(){
        var scope = this;
        this.controls = new function () {
            this.length = CUBE_LENGTH;
            this.rows = ROW_NUM;
            this.cols = COL_NUM;
            this.rebuildCubes = function(){
                scope.createCubes();
            };
            this.outputObjects = function () {
                console.log(scene.children);
            }
        };

        var gui = new dat.GUI();
        gui.add(this.controls, 'length', 0.5, 5);
        gui.add(this.controls, 'rows', 1, 10);
        gui.add(this.controls, 'cols', 10, 20);
        gui.add(this.controls, 'rebuildCubes');
        gui.add(this.controls, 'outputObjects');
    }
});