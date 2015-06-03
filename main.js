/**
 * Created by kk on 2015/5/8.
 */

var camera;
var scene;
var renderer;
var controls;

kk.game.onStart = function(){
    var stats = initStats();

    createGUI();
    var playScene = new PlayScene();
    render();

    function createGUI(){
        controls = new function () {
            this.length = CUBE_LENGTH;
            this.rows = ROW_NUM;
            this.cols = COL_NUM;
            this.rebuildCubes = function(){
                playScene.createCubes();
            };
            this.outputObjects = function () {
                console.log(scene.children);
            }
        };

        var gui = new dat.GUI();
        gui.add(controls, 'length', 0.5, 5);
        gui.add(controls, 'rows', 1, 10);
        gui.add(controls, 'cols', 10, 20);
        gui.add(controls, 'rebuildCubes');
        gui.add(controls, 'outputObjects');
    }
    function render(){
        stats.update();
        playScene.render();
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    };
    function initStats() {
        var stats = new Stats();
        stats.setMode(0); // 0: fps, 1: ms
        // Align top-left
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';

        document.getElementById("Stats-output").appendChild(stats.domElement);

        return stats;
    };
}
kk.game.run();

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
// listen to the resize events
window.addEventListener('resize', onResize, false);
