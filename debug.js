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

	const attach = EventTarget.prototype.addEventListener;
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
/* ******************************************************** */
publish(
	HTMLFormElement.prototype,
	"debugFill",
	function (data)
	{
		this.getFieldNames().forEach(
			function (name)
			{
				const element = this.elements.namedItem(name);

				if (element.hidden || element.readOnly)
				{
					return;
				}

				if (element instanceof HTMLInputElement)
				{
					if (element.type === "checkbox" || element.type === "radio")
					{
						element.checked = true;
					}
					else
					{
						element.value = (data && data[name]) || element.value || element.defaultValue || name;
					}
				}
				else if (element instanceof HTMLTextAreaElement)
				{
					element.value = data && data[name] || (name + " - Lorem ipsum dolor sit amet");
				}
				else if (element instanceof HTMLSelectElement && element.selectedIndex > 0)
				{
					if (data && typeof data[name] === "number" && data[name] < element.options.length)
					{
						element.selectedIndex = data[name];
					}
					else
					{
						if (data && typeof data[name] === "string")
						{
							element.value = data[name];
						}

						if (element.selectedIndex < 1)
						{
							element.selectedIndex = (element.options.length - 1);
						}
					}
				}
				else if (element instanceof RadioNodeList)
				{
					element[0].checked = true;
				}
			},
			this
		);
	}
);
