/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 */

kk.OrbitControls = kk.Class.extend({
    ctor: function ( object, domElement ) {
        this.object = object;
        this.domElement = ( domElement !== undefined ) ? domElement : document;
        this.init();
        this.registerListener();
    },
    init:function(){
        // API

        this.enabled = true;

        this.center = new THREE.Vector3();

        this.fixedUpDown = false;

        this.userZoom = true;
        this.userZoomSpeed = 1.0;

        this.userRotate = true;
        this.userRotateSpeed = 1.0;

        this.userPan = true;
        this.userPanSpeed = 2.0;

        this.autoRotate = false;
        this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

        this.minPolarAngle = 0; // radians
        this.maxPolarAngle = Math.PI; // radians

        this.minDistance = 0;
        this.maxDistance = Infinity;

        this.keys = {LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40};

        // internals
        this.EPS = 0.000001;
        this.PIXELS_PER_ROUND = 1800;

        this.rotateStart = new THREE.Vector2();
        this.rotateEnd = new THREE.Vector2();
        this.rotateDelta = new THREE.Vector2();

        this.zoomStart = new THREE.Vector2();
        this.zoomEnd = new THREE.Vector2();
        this.zoomDelta = new THREE.Vector2();

        this.phiDelta = 0;
        this.thetaDelta = 0;
        this.scale = 1;

        this.lastPosition = new THREE.Vector3();

        this.STATE = { NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2 };
        this.state = this.STATE.NONE;

        // events

        this.changeEvent = { type: 'change' };

    },
    setEnabled:function(b){
        this.enabled = b;
        if(this.listener)
            this.listener.setEnabled(b);
    },
    rotateLeft:function ( angle ) {

        if ( angle === undefined ) {

            angle = this.getAutoRotationAngle();

        }

        this.thetaDelta -= angle;

    },
    rotateRight : function ( angle ) {

        if ( angle === undefined ) {

            angle = this.getAutoRotationAngle();

        }

        this.thetaDelta += angle;

    },

    rotateUp : function ( angle ) {

        if ( angle === undefined ) {

            angle = this.getAutoRotationAngle();

        }

        this.phiDelta -= angle;

    },

    rotateDown : function ( angle ) {

        if ( angle === undefined ) {

            angle = this.getAutoRotationAngle();

        }

        this.phiDelta += angle;

    },

    zoomIn : function ( zoomScale ) {

        if ( zoomScale === undefined ) {

            zoomScale = this.getZoomScale();

        }

        this.scale /= zoomScale;

    },

    zoomOut : function ( zoomScale ) {

        if ( zoomScale === undefined ) {

            zoomScale = this.getZoomScale();

        }

        this.scale *= zoomScale;

    },

    pan : function ( distance ) {

        distance.transformDirection( this.object.matrix );
        distance.multiplyScalar( this.userPanSpeed );

        this.object.position.add( distance );
        this.center.add( distance );

    },

    update : function () {

        var position = this.object.position;
        var offset = position.clone().sub( this.center );

        // angle from z-axis around y-axis

        var theta = Math.atan2( offset.x, offset.z );

        // angle from y-axis

        var phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );

        if ( this.autoRotate ) {

            this.rotateLeft( this.getAutoRotationAngle() );

        }

        theta += this.thetaDelta;
        phi += this.phiDelta;

        // restrict phi to be between desired limits
        phi = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, phi ) );

        // restrict phi to be betwee EPS and PI-EPS
        phi = Math.max( this.EPS, Math.min( Math.PI - this.EPS, phi ) );

        var radius = offset.length() * this.scale;

        // restrict radius to be between desired limits
        radius = Math.max( this.minDistance, Math.min( this.maxDistance, radius ) );

        offset.x = radius * Math.sin( phi ) * Math.sin( theta );
        offset.y = radius * Math.cos( phi );
        offset.z = radius * Math.sin( phi ) * Math.cos( theta );

        position.copy( this.center ).add( offset );

        this.object.lookAt( this.center );

        this.thetaDelta = 0;
        this.phiDelta = 0;
        this.scale = 1;

        if ( this.lastPosition.distanceTo( this.object.position ) > 0 ) {

            //this.dispatchEvent( this.changeEvent );

            this.lastPosition.copy( this.object.position );

        }

    },


    getAutoRotationAngle:function() {

        return 2 * Math.PI / 60 / 60 * this.autoRotateSpeed;

    },

    getZoomScale:function() {

        return Math.pow( 0.95, this.userZoomSpeed );

    },
    onPanStart : function(event) {
        if ( this.enabled === false ) return;
        if ( this.userRotate === false ) return;
        this.rotateStart.set( event.x, event.y );
    },
    onPan : function(event){
        if ( this.enabled === false ) return;
        if ( this.userRotate === false ) return;

        this.rotateEnd.set(event.x, event.y);
        this.rotateDelta.subVectors( this.rotateEnd, this.rotateStart );

        this.rotateLeft( 2 * Math.PI * this.rotateDelta.x / this.PIXELS_PER_ROUND * this.userRotateSpeed );
        if(!this.fixedUpDown)
            this.rotateUp( 2 * Math.PI * this.rotateDelta.y / this.PIXELS_PER_ROUND * this.userRotateSpeed );

        this.rotateStart.copy( this.rotateEnd );
    },
    registerListener : function() {
        var scope = this;
        this.listener = kk.EventListener.create({
            event: kk.EventListener.TOUCH,
            swallowTouches: false,
            onPan: function (e) {
                if(e.type=="panstart")
                    scope.onPanStart({x: e.center.x,y: e.center.y});
                else if(e.type == "pan")
                    scope.onPan({x: e.center.x,y: e.center.y,deltaX: e.deltaX, deltaY: e.deltaY});
            }
        });
        kk.eventManager.addListener(this.listener);
    },
    cancelListener:function(){
        if(this.listener != undefined)
            kk.eventManager.addListener(this.listener);
    }


/*
     function onMouseDown( event ) {

         if ( scope.enabled === false ) return;
         if ( scope.userRotate === false ) return;

         event.preventDefault();

         if ( event.button === 0 ) {

         state = STATE.ROTATE;

         rotateStart.set( event.clientX, event.clientY );

         } else if ( event.button === 1 ) {

         state = STATE.ZOOM;

         zoomStart.set( event.clientX, event.clientY );

         } else if ( event.button === 2 ) {

         state = STATE.PAN;

         }

         document.addEventListener( 'mousemove', onMouseMove, false );
         document.addEventListener( 'mouseup', onMouseUp, false );

     },

 function onMouseMove( event ) {

    if ( scope.enabled === false ) return;

    event.preventDefault();

    if ( state === STATE.ROTATE ) {

        rotateEnd.set( event.clientX, event.clientY );
        rotateDelta.subVectors( rotateEnd, rotateStart );

        scope.rotateLeft( 2 * Math.PI * rotateDelta.x / PIXELS_PER_ROUND * scope.userRotateSpeed );
        if(!scope.fixedUpDown)
            scope.rotateUp( 2 * Math.PI * rotateDelta.y / PIXELS_PER_ROUND * scope.userRotateSpeed );

        rotateStart.copy( rotateEnd );

    } else if ( state === STATE.ZOOM ) {

        zoomEnd.set( event.clientX, event.clientY );
        zoomDelta.subVectors( zoomEnd, zoomStart );

        if ( zoomDelta.y > 0 ) {

            scope.zoomIn();

        } else {

            scope.zoomOut();

        }

        zoomStart.copy( zoomEnd );

    } else if ( state === STATE.PAN ) {

        var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        scope.pan( new THREE.Vector3( - movementX, movementY, 0 ) );

    }

}

function onMouseUp( event ) {

    if ( scope.enabled === false ) return;
    if ( scope.userRotate === false ) return;

    document.removeEventListener( 'mousemove', onMouseMove, false );
    document.removeEventListener( 'mouseup', onMouseUp, false );

    state = STATE.NONE;

}

function onMouseWheel( event ) {

    if ( scope.enabled === false ) return;
    if ( scope.userZoom === false ) return;

    var delta = 0;

    if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9

        delta = event.wheelDelta;

    } else if ( event.detail ) { // Firefox

        delta = - event.detail;

    }

    if ( delta > 0 ) {

        scope.zoomOut();

    } else {

        scope.zoomIn();

    }

}

function onKeyDown( event ) {

    if (scope.enabled === false) return;
    if (scope.userPan === false) return;

    switch (event.keyCode) {

        case scope.keys.UP:
            scope.pan(new THREE.Vector3(0, 1, 0));
            break;
        case scope.keys.BOTTOM:
            scope.pan(new THREE.Vector3(0, -1, 0));
            break;
        case scope.keys.LEFT:
            scope.pan(new THREE.Vector3(-1, 0, 0));
            break;
        case scope.keys.RIGHT:
            scope.pan(new THREE.Vector3(1, 0, 0));
            break;
    }

}*/
    //this.addEventListener("panstart", onPanStart);
    //this.addEventListener("pan", onPan);
    //this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
    //this.domElement.addEventListener( 'mousedown', onMouseDown, false );
    //this.domElement.addEventListener( 'mousewheel', onMouseWheel, false );
    //this.domElement.addEventListener( 'DOMMouseScroll', onMouseWheel, false ); // firefox
    //this.domElement.addEventListener( 'keydown', onKeyDown, false );
});

//THREE.OrbitControls.prototype = Object.create( THREE.EventDispatcher.prototype );