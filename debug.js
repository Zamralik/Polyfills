"use strict";
function publish(root, name, module)
{
	Object.defineProperty(root, name, { value : module });
};
/* ******************************************************** */
/*		DEBUG												*/
/* ******************************************************** */
{
	function make_key(event, capture)
	{
		return event + (capture ? "::1" : "::0");
	}
	function get_listeners(emitter, event, capture)
	{
		const key = make_key(event, capture);
		if (!emitter._listeners_)
		{
			Object.defineProperty(emitter, "_listeners_", { value : {} });
		}
		if (!emitter._listeners_[key])
		{
			emitter._listeners_[key] = [];
		}
		return emitter._listeners_[key];
	}

	const attach = EventTarget.prototype.   addEventListener;
	const detach = EventTarget.prototype.removeEventListener;

	publish(
		EventTarget.prototype,
		"addEventListener",
		function (event, listener, capture)
		{
			attach.call(this, event, listener, capture);
			const listeners = get_listeners(this, event, capture);
			if (!listeners.includes(listener))
			{
				listeners.push(listener);
			}
		}
	);
	publish(
		EventTarget.prototype,
		"removeEventListener",
		function (event, listener, capture)
		{
			detach.call(this, event, listener, capture);
			const listeners = get_listeners(this, event, capture);
			const index = listeners.indexOf(listener);
			if (index !== -1)
			{
				listeners.splice(index, 1);
			}
		}
	);
	publish(
		EventTarget.prototype,
		"getEventListeners",
		function (event, capture)
		{
			if (this._listeners_)
			{
				if (event)
				{
					return this._listeners_[make_key(event, capture)] || [];
				}
				else
				{
					return this._listeners_;
				}
			}
			else
			{
				return event ? [] : {};
			}
		}
	);
}
