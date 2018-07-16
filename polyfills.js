"use strict";
function publish(root, name, module)
{
	Object.defineProperty(root, name, { value : module });
};
/* ******************************************************** */
/*		POLYFILLS											*/
/* ******************************************************** */
// The end of callback hell
// Promise Polyfill (A+ compliant)
if (window.Promise === undefined)
{
	// States constants
	const PENDING  = undefined;
	const REJECTED = false;
	const ACCEPTED = true;
	// Used internally as resolver
	function noop() { }
	// Default accepted resolver
	function defaultAccept(answer)
	{
		return answer;
	}
	// Default rejected resolver
	function defaultReject(reason)
	{
		throw reason;
	}
	// Resolve every children of a promise
	function aftermath(queue, state, value)
	{
		setImmediate(
			function ()
			{
				// Get property name handling the appropriate resolver
				const resolver = state ? "accepted" : "rejected";
				const length = queue.length;
				let index = 0;
				for (; index < length; ++index)
				{
					try
					{
						// Resolve child promise with the returned value from the resolver
						endeavor(queue[index], queue[index]._[resolver].call(undefined, value));
					}
					catch (reason)
					{
						transit(queue[index], REJECTED, reason);
					}
				}
			}
		);
	};
	// Transit a promise to a settled state
	function transit(promise, state, value)
	{
		// Only pending promises can transit
		if (promise._.state === PENDING)
		{
			// Save state & value
			promise._.state = state;
			promise._.value = value;
			// Resolve children promise
			aftermath(promise._.queue, state, value);
			// Delete the now unnecessary queue to free some memory
			delete promise._.queue;
		}
	};
	// Attempt to resolve a promise
	function endeavor(promise, value)
	{
		// Only a pending promise can be resolved
		if (promise._.state === PENDING)
		{
			// Increase level so it can't be resolved again from the same level
			++promise._.level;
			// Is promise resolved with itself ?
			if (promise === value)
			{
				transit(promise, REJECTED, new TypeError("A promise cannot be resolved with itself"));
			}
			else if (value instanceof Promise)
			{
				// We must copy its state & value when settled
				function copy()
				{
					transit(promise, value._.state, value._.value);
				}
				if (value._.state === PENDING)
				{
					value.then(copy, copy);
				}
				else
				{
					copy();
				}
			}
				// Is there a chance that the promise was resolved with an ersatz of promise ?
			else if (value && (typeof value === "object" || typeof value === "function"))
			{
				// We make a copy of the current level
				const level = promise._.level;
				// We don't know what could happen, so we stay safe with a try/catch
				try
				{
					// Attempt to retrieve a possible "then" method
					// It could be a one-time only getter, so we store the result
					const linker = value.then;
					if (typeof linker === "function")
					{
						// We call it with accept & reject handlers
						linker.call(
							value,
							function (answer)
							{
								if (promise._.level === level)
								{
									endeavor(promise, answer);
								}
							},
							function (reason)
							{
								if (promise._.level === level)
								{
									transit(promise, REJECTED, reason);
								}
							}
						);
					}
					else
					{
						// It's simply a value to accept, not an ersatz of Promise
						transit(promise, ACCEPTED, value);
					}
				}
				catch (reason)
				{
					if (promise._.level === level)
					{
						transit(promise, REJECTED, reason);
					}
				}
			}
			else
			{
				// It's simply a value to accept
				transit(promise, ACCEPTED, value);
			}
		}
	}
	// Promise::constructor(resolver)
	function Promise(resolver)
	{
		// Is there a resolver ?
		if (typeof resolver !== "function")
		{
			// If there's no resolver, the promise will never settled
			throw new TypeError("Promise resolver is not a function");
		}
		// Hide the properties
		Object.defineProperty(this, "_", { value: {} });
		// A promise start with the pending state
		this._.state = PENDING;
		// A resolution level of 0
		this._.level = 0;
		// And an empty queue of children
		this._.queue = [];
		// Is it an externally made Promise ?
		if (resolver !== noop)
		{
			// We need an anchor to keep the same reference in callbacks
			const anchor = this;
			// A promise can't be resolved more than once in the same resolution level
			// We copy the current level to check it when trying to settle the promise
			const level = 0;
			// We don't know if the resolver is safe to call, so we use a try/catch
			try
			{
				// We call the resolver with accept & reject handlers
				resolver.call(
					undefined,
					function (answer)
					{
						if (anchor._.level === level)
						{
							endeavor(anchor, answer);
						}
					},
					function (reason)
					{
						if (anchor._.level === level)
						{
							transit(anchor, REJECTED, reason);
						}
					}
				);
			}
			catch (reason)
			{
				if (this._.level === level)
				{
					transit(anchor, REJECTED, reason);
				}
			}
		}
	};
	// Promise::then([onAccept], [onReject])
	Promise.prototype.then = function then(onAccept, onReject)
	{
		// Create child promise
		const child = new Promise(noop);
		// Save child resolvers
		child._.accepted = (typeof onAccept === "function") ? onAccept : defaultAccept;
		child._.rejected = (typeof onReject === "function") ? onReject : defaultReject;
		// Is the promise pending ?
		if (this._.state === PENDING)
		{
			// Append child to the queue for later resolution
			this._.queue.push(child);
		}
		else
		{
			// Resolve the child immediately
			aftermath([child], this._.state, this._.value);
		}
		return child;
	};
	// Promise::catch([onReject])
	Promise.prototype.catch = function _catch_(onReject)
	{
		// Alias of Promise::then([onAccept], [onReject])
		return this.then(undefined, onReject);
	};
	// Promise::resolve([answer])
	// Ensure you have a settled promise
	Promise.resolve = function resolve(answer)
	{
		const promise = new Promise(noop);
		endeavor(promise, answer);
		return promise;
	};
	// Promise::reject([reason])
	// Ensure you have a rejected promise
	Promise.reject = function reject(reason)
	{
		const promise = new Promise(noop);
		transit(promise, REJECTED, reason);
		return promise;
	};
	// Promise::race(iterable)
	// Return a copy of the first promise to settle
	Promise.race = function race(iterable)
	{
		// Create the aggregating promise
		const aggregator = new Promise(noop);
		// Create the common onAccept handle
		function onAccept(answer)
		{
			endeavor(aggregator, answer);
		}
		// Create the common onReject handle
		function onReject(reason)
		{
			transit(aggregator, REJECTED, reason);
		}
		// Turns every value of the iterable into a promise
		iterable = Array.prototype.map.call(iterable, Promise.resolve);
		// Chain every promise to the aggregator
		const length = iterable.length;
		let index = 0;
		for (; index < length; ++index)
		{
			iterable[index].then(onAccept, onReject);
		}
		return aggregator;
	};
	// Promise::all(iterable)
	// Attempt to retrieve every answer before transiting to accepted
	// The first rejection will make it transit to rejected
	Promise.all = function all(iterable)
	{
		const aggregator = new Promise(noop);
		const results = [];
		let remains = iterable.length;
		// Create the common onReject handle
		function onReject(reason)
		{
			transit(aggregator, REJECTED, reason);
		}
		// Turns every value of the iterable into a promise
		iterable = Array.prototype.map.call(iterable, Promise.resolve);
		// Chain every promise to the aggregator
		function chain(promise, index)
		{
			promise.then(
				function (answer)
				{
					results[index] = answer;
					--remains;
					if (remains === 0)
					{
						transit(aggregator, ACCEPTED, results);
					}
				},
				onReject
			);
		}
		const length = iterable.length;
		let index = 0;
		for (; index < length; ++index)
		{
			chain(iterable[index], index);
		}
		return aggregator;
	};

	window.Promise = Promise;
}
/* ******************************************************** */
if (window.EventTarget === undefined)
{
	window.EventTarget = Node;
}
/* ******************************************************** */
if (window.RadioNodeList === undefined)
{
	window.RadioNodeList = HTMLCollection;
}
/* ******************************************************** */
if (String.prototype.includes === undefined)
{
	publish(
		String.prototype,
		"includes",
		function (needle, start_index)
		{
			return (this.indexOf(needle, (start_index || 0)) !== -1);
		}
	);
}
/* ******************************************************** */
if (Array.from === undefined)
{
	const slice = Array.prototype.slice;
	Array.from = function (array_like, callback, anchor)
	{
		const real_array = slice.call(array_like);
		return callback ? real_array.map(callback, anchor) : real_array;
	};
}
if (Array.of === undefined)
{
	Array.of = function ()
	{
		return Array.from(arguments);
	};
}
if (Array.prototype.includes === undefined)
{
	publish(
		Array.prototype,
		"includes",
		function (needle, start_index)
		{
			return (this.indexOf(needle, (start_index || 0)) !== -1);
		}
	);
}
if (Array.prototype.keys === undefined)
{
	publish(
		Array.prototype,
		"keys",
		function ()
		{
			const length = this.length;
			let index  = -1;
			return {
				next: function ()
				{
					++index;
					if (index < length)
					{
						return { done : false, value : index };
					}
					else
					{
						return { done : true };
					}
				}
			};
		}
	);
}
if (Array.prototype.values === undefined)
{
	publish(
		Array.prototype,
		"values",
		function ()
		{
			const copy   = Array.from(this);
			const length = this.length;
			let index = -1;
			return {
				next: function ()
				{
					++index;
					if (index < length)
					{
						return { done : false, value : copy[index] };
					}
					else
					{
						return { done : true };
					}
				}
			};
		}
	);
}
if (Array.prototype.entries === undefined)
{
	publish(
		Array.prototype,
		"entries",
		function ()
		{
			const copy   = Array.from(this);
			const length = this.length;
			let index = -1;
			return {
				next: function ()
				{
					++index;
					if (index < length)
					{
						return { done : false, value : [index, copy[index]] };
					}
					else
					{
						return { done : true };
					}
				}
			};
		}
	);
}
/* ******************************************************** */
if (Number.EPSILON === undefined)
{
	Number.EPSILON = Math.pow(2, -52);
}
if (Number.MAX_SAFE_INTEGER === undefined)
{
	Number.MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;
}
if (Number.MIN_SAFE_INTEGER === undefined)
{
	Number.MIN_SAFE_INTEGER = -Number.MAX_SAFE_INTEGER;
}
if (Number.parseInt === undefined)
{
	Number.parseInt = window.parseInt;
}
if (Number.parseFloat === undefined)
{
	Number.parseFloat = window.parseFloat;
}
if (Number.isNaN === undefined)
{
	Number.isNaN = window.isNaN;
}
if (Number.isFinite === undefined)
{
	Number.isFinite = window.isFinite;
}
if (Number.isInteger === undefined)
{
	Number.isInteger = function (value)
	{
		return Number.isFinite(value) && (Math.floor(value) === value);
	};
}
if (Number.isSafeInteger === undefined)
{
	Number.isSafeInteger = function (value)
	{
		return Number.isInteger(value) && (Number.MIN_SAFE_INTEGER <= value) && (value <= Number.MAX_SAFE_INTEGER);
	};
}
/* ******************************************************** */
if (Node.prototype.remove === undefined)
{
	publish(
		Node.prototype,
		"remove",
		function ()
		{
			this.parentNode.removeChild(this);
		}
	);
}
if (Node.prototype.replaceWith === undefined)
{
	publish(
		Node.prototype,
		"replaceWith",
		function ()
		{
			const parentNode = this.parentNode;
			const args = arguments;
			let i = 0;
			for (; i < args.length; ++i)
			{
				const arg = args[i];
				parentNode.insertBefore(((typeof arg === "string") ? document.createTextNode(arg) : arg), this);
			}
			this.remove();
		}
	);
}
{
	const input = document.createElement("input");
	input.type = "checkbox";
	input.name = "test_checkValidity";
	input.checked = false;
	input.required = true;
	if (input.checkValidity())
	{
		{
			const defective_checkValidity = HTMLInputElement.prototype.checkValidity;
			publish(
				HTMLInputElement.prototype,
				"checkValidity",
				function ()
				{
					return !(this.required && !this.disabled && !this.readonly && ((this.type === "checkbox" || this.type === "radio") ? this.checked : this.value)) && defective_checkValidity.call(this);
				}
			);
		}
		{
			const defective_checkValidity = HTMLSelectElement.prototype.checkValidity;
			publish(
				HTMLSelectElement.prototype,
				"checkValidity",
				function ()
				{
					return !(this.required && !this.disabled && !this.readonly && (this.selectedIndex === -1 || defective_checkValidity.call(this)));
				}
			);
		}
		{
			const defective_checkValidity = HTMLTextAreaElement.prototype.checkValidity;
			publish(
				HTMLTextAreaElement.prototype,
				"checkValidity",
				function ()
				{
					return !(this.required && !this.disabled && !this.readonly && this.value) && defective_checkValidity.call(this);
				}
			);
		}
		publish(
			HTMLFormElement.prototype,
			"checkValidity",
			function ()
			{
				return this.querySelectorAll("[required]:not([disabled]):not([readonly])").wrap().every(
					function (node)
					{
						return node.closest("fieldset[disabled]") || field.checkValidity();
					}
				);
			}
		);
	}
}
/* ******************************************************** */
if (Element.prototype.matches === undefined)
{
	publish(
		Element.prototype,
		"matches",
		(Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector)
	);
}
if (Element.prototype.closest === undefined)
{
	publish(
		Element.prototype,
		"closest",
		function (selector)
		{
			let current = this;
			while (current)
			{
				if (!(current instanceof Element))
				{
					return null;
				}
				else if (current.matches(selector))
				{
					return current;
				}
				else
				{
					current = current.parentNode;
				}
			}
			return null;
		}
	);
}
/* ******************************************************** */
if (navigator.sendBeacon === undefined)
{
	navigator.sendBeacon = function (url, data)
	{
		const xhr = new XMLHttpRequest();
		xhr.open("POST", url, false);
		xhr.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
		xhr.send(data);
	};
}
/* ******************************************************** */
if (window.setImmediate === undefined)
{
	window.setImmediate = function ()
	{
		const args = Array.from(arguments);
		const callback = args.shift();
		return setTimeout(
			function ()
			{
				callback.apply(undefined, args);
			},
			0
		);
	};
	window.clearImmediate = function (id)
	{
		clearTimeout(id);
	};
}
/* ******************************************************** */
if (typeof window.CustomEvent !== "function")
{
	window.CustomEvent = function (event, params)
	{
		const mimic = document.createEvent("CustomEvent");
		mimic.initCustomEvent(
			event,
			params && params.bubbles	&& true,
			params && params.cancelable	&& true,
			params && params.detail		|| undefined
		);
		return mimic;
	};
}
/* ******************************************************** */
{
	const div = document.createElement("div");
	div.classList.toggle("test", false);
	if (div.className === "test")
	{
		const defective_toggle = DOMTokenList.prototype.toggle;
		DOMTokenList.prototype.toggle = function (className, state)
		{
			if (state === undefined)
			{
				return defective_toggle.call(this, className);
			}
			else if (state)
			{
				this.add(className);
				return true;
			}
			else
			{
				this.remove(className);
				return false;
			}
		};
	}
	div.classList.add("alpha", "beta");
	if (!div.className.includes("beta"))
	{
		const defective_add = DOMTokenList.prototype.add;
		DOMTokenList.prototype.add = function ()
		{
			let i = 0;
			for (; i < arguments.length; ++i)
			{
				defective_add.call(this, arguments[i]);
			}
		};
		const defective_remove = DOMTokenList.prototype.remove;
		DOMTokenList.prototype.remove = function ()
		{
			let i = 0;
			for (; i < arguments.length; ++i)
			{
				defective_remove.call(this, arguments[i]);
			}
		};
	}
}
/* ******************************************************** */
/*		MISSING CLASSES										*/
/* ******************************************************** */
if (window.Map === undefined)
{
	window.Map = function (iterable)
	{
		Object.defineProperty(this, "_keys",   { value : [] });
		Object.defineProperty(this, "_values", { value : [] });
		if (Iterator.isIterable(iterable))
		{
			Iterator.toArray(iterable).forEach(this.set, this);
		}
	};
	Map.prototype = {
		"set": function (key, value)
		{
			const index = this._keys.indexOf(key);
			if (index === -1)
			{
				this._keys.push(key);
				this._values.push(value);
			}
			else
			{
				this._values[index] = value;
			}
			return this;
		},
		"get": function (key)
		{
			const index = this._keys.indexOf(key);
			if (index !== -1)
			{
				return this._values[index];
			}
		},
		"has": function (key)
		{
			return this._keys.includes(key);
		},
		"delete": function (key)
		{
			const index = this._keys.indexOf(key);
			if (index === -1)
			{
				return false;
			}
			else
			{
				this._keys.splice(index, 1);
				this._values.splice(index, 1);
				return true;
			}
		},
		"clear": function ()
		{
			this._keys.length = 0;
			this._values.length = 0;
		},
		"keys": function ()
		{
			return Iterator.from(this._keys, true);
		},
		"values": function ()
		{
			return Iterator.from(this._values, true);
		},
		"entries": function ()
		{
			const answer = [];
			const length = this._values.length;
			let i = 0;
			for (; i < length; ++i)
			{
				answer.push([this._keys[i], this._values[i]]);
			}
			return Iterator.from(answer);
		},
		"forEach": function (callback, anchor)
		{
			const length = this._values.length;
			let i = 0;
			for (; i < length; ++i)
			{
				callback.call(anchor, this._values[i], this._keys[i], this);
			}
		}
	};
	Object.defineProperty(
		Map.prototype,
		"size",
		{
			get: function ()
			{
				return this._keys.length;
			}
		}
	);
}
/* ******************************************************** */
if (window.Set === undefined)
{
	window.Set = function (iterable)
	{
		Object.defineProperty(this, "_values", { value : [] });
		if (Iterator.isIterable(iterable))
		{
			Iterator.toArray(iterable).forEach(this.add, this);
		}
	};
	Set.prototype = {
		"add": function (value)
		{
			const index = this._values.indexOf(value);
			if (index === -1)
			{
				this._values.push(value);
			}
			return this;
		},
		"get": function (value)
		{
			const index = this._values.indexOf(value);
			if (index !== -1)
			{
				return this._values[index];
			}
		},
		"has": function (value)
		{
			return this._values.includes(value);
		},
		"delete": function (value)
		{
			const index = this._values.indexOf(value);
			if (index === -1)
			{
				return false;
			}
			else
			{
				this._values.splice(index, 1);
				return true;
			}
		},
		"clear": function ()
		{
			this._values.length = 0;
		},
		"values": function ()
		{
			return Iterator.from(this._values, true);
		},
		"entries": function ()
		{
			const answer = [];
			const length = this._values.length;
			let i = 0;
			for (; i < length; ++i)
			{
				answer.push([this._values[i], this._values[i]]);
			}
			return Iterator.from(answer);
		},
		"forEach": function (callback, anchor)
		{
			const length = this._values.length;
			let i = 0;
			for (; i < length; ++i)
			{
				callback.call(anchor, this._values[i], this._values[i], this);
			}
		}
	};
	Object.defineProperty(
		Set.prototype,
		"size",
		{
			get: function ()
			{
				return this._values.length;
			}
		}
	);
}
/* ******************************************************** */
if (window.WeakMap === undefined)
{
	window.WeakMap = function (iterable)
	{
		++WeakMap.index;
		Object.defineProperty(this, "_ref", "_weakmap_polyfill_"+WeakMap.index);
		if (Iterator.isIterable(iterable))
		{
			Iterator.toArray(iterable).forEach(this.set, this);
		}
	};
	Object.defineProperty(WeakMap, "index", { writable : true, value : 0 });
	WeakMap.prototype = {
		"set": function (key, value)
		{
			if (Object.isObject(key))
			{
				Object.defineProperty(
					key,
					this._ref,
					{
						configurable: true,
						value: value
					}
				);
				return this;
			}
			else
			{
				throw new TypeError("Invalid value used as weak map key");
			}
		},
		"get": function (key)
		{
			return Object.isObject(key) ? key[this._ref] : undefined;
		},
		"has": function (key)
		{
			return Object.isObject(key) && (this._ref in key);
		},
		"delete": function (key)
		{
			if (Object.isObject(key) && key[this._ref])
			{
				delete key[this._ref];
				return true;
			}
			else
			{
				return false;
			}
		}
	};
}
/* ******************************************************** */
if (window.WeakSet === undefined)
{
	window.WeakSet = function (iterable)
	{
		++WeakSet.index;
		Object.defineProperty(this, "_ref", "_weakset_polyfill_"+WeakSet.index);
		if (Iterator.isIterable(iterable))
		{
			Iterator.toArray(iterable).forEach(this.add, this);
		}
	};
	Object.defineProperty(WeakSet, "index", { writable : true, value : 0 });
	WeakSet.prototype = {
		"add": function (value)
		{
			if (Object.isObject(value))
			{
				Object.defineProperty(
					value,
					this._ref,
					{
						configurable: true,
						value: true
					}
				);
				return this;
			}
			else
			{
				throw new TypeError("Invalid value used as weak map value");
			}
		},
		"has": function (value)
		{
			return Object.isObject(value) && (this._ref in value);
		},
		"delete": function (value)
		{
			if (Object.isObject(value) && value[this._ref])
			{
				delete value[this._ref];
				return true;
			}
			else
			{
				return false;
			}
		}
	};
}
/* ******************************************************** */
{
	const template = document.createElement("template");
	if (!(template.content instanceof DocumentFragment))
	{
		Object.defineProperty(
			template.__proto__,
			"content",
			{
				get: function ()
				{
					if (this.tagName === "TEMPLATE")
					{
						const content = document.createDocumentFragment();
						const children = item.childNodes;
						while (children.length)
						{
							fragment.appendChild(children[0]);
						}
						publish(this, "content", content);
						return content;
					}
				}
			}
		);
	}
}