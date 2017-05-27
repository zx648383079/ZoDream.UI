const vendors: Array<string> = ['webkit', 'moz'];
for(let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame =
        window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
}

if (!window.requestAnimationFrame || !window.cancelAnimationFrame ) {
    let lastTime = 0;
    window.requestAnimationFrame = function(callback): number {
      let currTime: number = new Date().getTime();
      //为了使setTimteout的尽可能的接近每秒60帧的效果
      let timeToCall: number = Math.max( 0, 16 - ( currTime - lastTime ) ); 
      let id: number = window.setTimeout( function() {
        callback( currTime + timeToCall );
      }, timeToCall );
      lastTime = currTime + timeToCall;
      return id;
    };
    
    window.cancelAnimationFrame = function(id) {
      window.clearTimeout(id);
    };
}