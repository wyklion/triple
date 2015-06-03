/**
 * Created by kk on 2015/6/3.
 */

/**
 * Light weight timer
 * @class
 * @extends kk.Class
 */
kk.Timer = kk.Class.extend({
    _scheduler: null,
    _elapsed:0.0,
    _runForever:false,
    _useDelay:false,
    _timesExecuted:0,
    _repeat:0, //0 = once, 1 is 2 x executed
    _delay:0,
    _interval:0.0,

    /**
     * cc.Timer's Constructor
     * Constructor of cc.Timer
     */
    ctor:function () {
        this._scheduler = null;
        this._elapsed = -1;
        this._runForever = false;
        this._useDelay = false;
        this._timesExecuted = 0;
        this._repeat = 0;
        this._delay = 0;
        this._interval = 0;
    },
    /**
     * @return {Number} returns interval of timer
     */
    getInterval : function(){return this._interval;},
    /**
     * @param {Number} interval set interval in seconds
     */
    setInterval : function(interval){this._interval = interval;},

    setupTimerWithInterval: function(seconds, repeat, delay){
        this._elapsed = -1;
        this._interval = seconds;
        this._delay = delay;
        this._useDelay = (this._delay > 0);
        this._repeat = repeat;
        this._runForever = (this._repeat === cc.REPEAT_FOREVER);
    },

    trigger: function(){
        return 0;
    },

    cancel: function(){
        return 0;
    },

    /**
     * triggers the timer
     * @param {Number} dt delta time
     */
    update:function (dt) {
        if (this._elapsed === -1) {
            this._elapsed = 0;
            this._timesExecuted = 0;
        } else {
            this._elapsed += dt;
            if (this._runForever && !this._useDelay) {//standard timer usage
                if (this._elapsed >= this._interval) {
                    this.trigger();
                    this._elapsed = 0;
                }
            } else {//advanced usage
                if (this._useDelay) {
                    if (this._elapsed >= this._delay) {
                        this.trigger();

                        this._elapsed -= this._delay;
                        this._timesExecuted += 1;
                        this._useDelay = false;
                    }
                } else {
                    if (this._elapsed >= this._interval) {
                        this.trigger();

                        this._elapsed = 0;
                        this._timesExecuted += 1;
                    }
                }

                if (!this._runForever && this._timesExecuted > this._repeat)
                    this.cancel();
            }
        }
    }
});



kk.Scheduler = kk.Class.extend({
    _timeScale:1.0,

    _arrayForTimers:null, //Speed up indexing
    _currentTarget:null,

    ctor:function () {
        this._timeScale = 1.0;
        this._currentTarget = null;

        this._arrayForTimers = [];

    },
    update:function(dt){

    }
});