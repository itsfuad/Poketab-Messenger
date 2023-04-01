/**
 * This class is used to detect the long press on messages and fire the callback function
 */
export class ClickAndHold{
	constructor(target, timeOut, callback){
		this.target = target; //the target element
		this.callback = callback; //the callback function
		this.isHeld = false; //is the hold active
		this.activeHoldTimeoutId = null;  //the timeout id
		this.timeOut = timeOut; //the time out for the hold [in ms] eg: if timeOut = 1000 then the hold will be active for 1 second
		//start event listeners
		['touchstart', 'mousedown'].forEach(eventName => {
			try{
				this.target.addEventListener(eventName, this._onHoldStart.bind(this));
			}
			catch(e){
				console.log(e);
			}
		});
		//event added to detect if the user is moving the finger or mouse
		['touchmove', 'mousemove'].forEach(eventName => {
			try{
				this.target.addEventListener(eventName, this._onHoldMove.bind(this));
			}
			catch(e){
				console.log(e);
			}
		});
		// event added to detect if the user is releasing the finger or mouse
		['mouseup', 'touchend', 'mouseleave', 'mouseout', 'touchcancel'].forEach(eventName => {
			try{
				this.target.addEventListener(eventName, this._onHoldEnd.bind(this));
			}
			catch(e){
				console.log(e);
			}
		});
	}
	//this function is called when the user starts to hold the finger or mouse
	_onHoldStart(evt){
		this.isHeld = true;
		this.activeHoldTimeoutId = setTimeout(() => {
			if (this.isHeld) {
				this.callback(evt);
			}
		}, this.timeOut);
	}
	//this function is called when the user is moving the finger or mouse
	_onHoldMove(){
		this.isHeld = false;
	}
	//this function is called when the user releases the finger or mouse
	_onHoldEnd(){
		this.isHeld = false;
		clearTimeout(this.activeHoldTimeoutId);
	}
	//a static function to use the class utility without creating an instance
	static applyTo(target, timeOut, callback){
		try{
			new ClickAndHold(target, timeOut, callback);
		}
		catch(e){
			console.log(e);
		}
	}
}