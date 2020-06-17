"use strict";
function publish(root, name, module)
{
	Object.defineProperty(root, name, { value: module });
};
/* ******************************************************** */
/*		POLYFILLS											*/
/* ******************************************************** */
if (window.EventTarget === undefined)
{
	window.EventTarget = Node;
}
/* ******************************************************** */
if (window.scrollY === undefined)
{
	Object.defineProperty(
		window,
		"scrollY",
		{
			get: function ()
			{
				return window.pageYOffset;
			}
		}
	);
}
if (window.scrollX === undefined)
{
	Object.defineProperty(
		window,
		"scrollX",
		{
			get: function ()
			{
				return window.pageXOffset;
			}
		}
	);
}
/* ******************************************************** */
if (Object.values === undefined)
{
	publish(
		Object,
		"values",
		function (object)
		{
			return Object.keys(object).map(
				function (key)
				{
					return object[key];
				}
			);
		}
	);
}
if (Object.entries === undefined)
{
	publish(
		Object,
		"entries",
		function (object)
		{
			return Object.keys(object).map(
				function (key)
				{
					return [key, object[key]];
				}
			);
		}
	);
}
if (Object.assign === undefined)
{
	publish(
		Object,
		"assign",
		function (target)
		{
			let i = 1;
			let key;
			const argv = arguments;
			const argc = argv.length;

			for (; i < argc; ++i)
			{
				let names = Object.getOwnPropertyNames(argv[i]);

				for (key in argv[i])
				{
					if (names.includes(key))
					{
						target[key] = argv[i][key];
					}
				}
			}

			return target;
		}
	);
}
/* ******************************************************** */
if (NodeList.prototype.forEach === undefined)
{
	publish(
		NodeList.prototype,
		"forEach",
		function (callback, anchor)
		{
			let i = 0;
			for (; i < this.length; ++i)
			{
				callback.call(anchor, this[i], i, this);
			}
		}
	);
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
			let index = -1;
			return {
				next: function ()
				{
					++index;
					if (index < length)
					{
						return { done: false, value: index };
					}
					else
					{
						return { done: true };
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
			const copy = Array.from(this);
			const length = this.length;
			let index = -1;
			return {
				next: function ()
				{
					++index;
					if (index < length)
					{
						return { done: false, value: copy[index] };
					}
					else
					{
						return { done: true };
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
			const copy = Array.from(this);
			const length = this.length;
			let index = -1;
			return {
				next: function ()
				{
					++index;
					if (index < length)
					{
						return { done: false, value: [index, copy[index]] };
					}
					else
					{
						return { done: true };
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
				return Array.from(this.querySelectorAll("[required]:not([disabled]):not([readonly])")).every(
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
			params && params.bubbles && true,
			params && params.cancelable && true,
			params && params.detail || undefined
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
		Object.defineProperty(this, "_keys", { value: [] });
		Object.defineProperty(this, "_values", { value: [] });
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
		Object.defineProperty(this, "_values", { value: [] });
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
		Object.defineProperty(this, "_ref", { value: "_weakmap_polyfill_" + WeakMap.index });
		if (Iterator.isIterable(iterable))
		{
			Iterator.toArray(iterable).forEach(this.set, this);
		}
	};
	Object.defineProperty(WeakMap, "index", { writable: true, value: 0 });
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
		Object.defineProperty(this, "_ref", { value: "_weakset_polyfill_" + WeakSet.index });
		if (Iterator.isIterable(iterable))
		{
			Iterator.toArray(iterable).forEach(this.add, this);
		}
	};
	Object.defineProperty(WeakSet, "index", { writable: true, value: 0 });
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
// The end of callback hell!
// Promise Polyfill (A+ compliant)
if (window.Promise === undefined)
{
	// States constants
	const PENDING = undefined;
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
	// Promise::finally([callback])
	Promise.prototype.finally = function _finally_(callback)
	{
		function onAny()
		{
			return callback();
		}

		return this.then(onAny, onAny);
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

if (!Promise.prototype.finally)
{
	publish(
		Promise.prototype,
		"finally",
		function (callback)
		{
			return this.then(callback, callback);
		}
	);
}
/* ******************************************************** */
if (typeof URL !== "function")
{
	function validate_protocol(value)
	{
		return value.match(/^[a-z]+(-[a-z]+)*:$/);
	}

	function validate_hostname(value)
	{
		if (value.length > 253)
		{
			return false;
		}

		// DNS
		if (/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/.test(value))
		{
			return true;
		}

		// IPv4
		if (value.match(/^[0-9]{1,3}(\.[0-9]{1,3}){3}$/))
		{
			return value.split(".").reduce(
				function (success, value)
				{
					return success && (+value < 256);
				},
				true
			);
		}

		// IPv6
		if (value[0] === "[" && value.substr(-1) === "]" && value.includes(":"))
		{
			const nb = value.match(/:/g).length;

			if (nb < 2 || 7 < nb)
			{
				return false;
			}

			const is_shrinked = value.includes("::");

			if (is_shrinked ? nb === 7 : nb < 7)
			{
				return false;
			}

			if (is_shrinked && value.match(/::/g).length > 1)
			{
				return false;
			}

			if (is_shrinked)
			{
				value = value.replace("[::", "[0::").replace("::]", "::0]").replace("::", ":0:");
			}

			value = value.substr(1, -1);

			if (/^[0-9a-f]{1,4}(:[0-9a-f]{1,4})+$/.test(value))
			{
				return true;
			}

			return false;
		}

		return false;
	}

	function validate_port(value)
	{
		return value.match(/^\d+$/);
	}

	function URL(href, base)
	{
		if (href === undefined)
		{
			throw new Error("Missing argument 1");
		}

		Object.defineProperty(this, "searchParams", { value: new URLSearchParams() });
		this._parse(href, base);
	}

	URL.prototype._parse = function parse(href, base)
	{
		href = String(href);
		base = base ? String(base) : document.location.href;

		this._username = "";
		this._password = "";

		if (href.includes("@"))
		{
			const authenticate = href.replace(/^(\w+:)?\/\//, "").replace(/@.*$/, "");
			const index = authenticate.indexOf(":");

			if (index < 0)
			{
				this._username = authenticate;
			}
			else
			{
				this._username = authenticate.substr(0, index);
				this._password = authenticate.substr(index + 1);
			}

			href = href.replace(authenticate, "");
		}

		const virtual_document = document.implementation.createHTMLDocument("");
		const base_element = virtual_document.createElement("base");
		base_element.href = base;
		virtual_document.head.appendChild(base_element);
		const anchor_element = document.createElement("a");
		anchor_element.href = href;
		virtual_document.body.appendChild(anchor_element);

		if (!anchor_element.href.match(/:/))
		{
			throw new TypeError('Invalid URL');
		}

		this._protocol = anchor_element.protocol;
		this._hostname = anchor_element.hostname;
		this._port = anchor_element.port || this._getDefaultPort();
		this._pathname = anchor_element.pathname;
		this.search = anchor_element.search;
		this._hash = anchor_element.hash;
	};

	URL.prototype._getDefaultPort = function ()
	{
		switch (this._protocol)
		{
			case "http:":
				return "80";
			case "https:":
				return "443";
			case "ftp:":
				return "21";
			default:
				return "";
		}
	};

	URL.prototype.toString = function ()
	{
		return this.href;
	};

	URL.prototype.toJSON = function ()
	{
		return this.href;
	};

	Object.defineProperties(
		URL.prototype,
		{
			href: {
				get: function ()
				{
					const parts = [this._protocol + "//"];

					if (this._username)
					{
						parts.push(this._username);

						if (this._password)
						{
							parts.push(":" + this._password);
						}

						parts.push("@");
					}

					parts.push(this.hostname + this.pathname);

					const search = this.search;

					if (search)
					{
						parts.push("?" + search);
					}

					parts.push(this._hash);

					return parts.join("");
				},
				set: function (href)
				{
					parse.call(this, href);
				}
			},
			username: {
				get: function()
				{
					return this._username;
				},
				set: function (value)
				{
					this._username = encodeURIComponent(value);
				}
			},
			password: {
				get: function()
				{
					return this._password;
				},
				set: function (value)
				{
					this._password = encodeURIComponent(value);
				}
			},
			protocol: {
				get: function ()
				{
					return this._protocol;
				},
				set: function (value)
				{
					value = String(value);

					if (validate_protocol(value))
					{
						this._protocol = value;
					}
				}
			},
			hostname: {
				get: function ()
				{
					return this._hostname;
				},
				set: function (value)
				{
					value = String(value).toLowerCase();

					if (validate_hostname(value))
					{
						this._hostname = value;
					}
				}
			},
			port: {
				get: function ()
				{
					return (this._port === this._getDefaultPort()) ? "" : this._port;
				},
				set: function (value)
				{
					value = String(value);

					if (validate_port(value))
					{
						this._port = value;
					}
				}
			},
			host: {
				get: function ()
				{
					const port = this.port;

					if (port)
					{
						return this._hostname + ":" + port;
					}
					else
					{
						return this._hostname;
					}
				},
				set: function (value)
				{
					value = String(value);
					const index = value.indexOf(":");

					if (index < 0)
					{
						if (validate_hostname(value))
						{
							this._hostname = value;
						}
					}
					else
					{
						const hostname = value.substr(0, index);
						const port = value.substr(index + 1);

						if (validate_hostname(hostname) && validate_port(port))
						{
							this._hostname = hostname;
							this._port = port;
						}
					}
				}
			},
			origin: {
				get: function ()
				{
					return this._protocol + "//" + this.host;
				}
			},
			search: {
				get: function ()
				{
					return this.searchParams.toString();
				},
				set: function (value)
				{
					const self = this;
					// clear
					Array.from(this.searchParams.keys()).forEach(
						function (name)
						{
							self.searchParams.delete(name);
						}
					);
					// refill
					(new URLSearchParams(value)).forEach(
						function (value, name)
						{
							self.searchParams.append(name, value);
						}
					);
				}
			},
			hash: {
				get: function()
				{
					return this._hash;
				},
				set: function (value)
				{
					value = String(value);

					if (value[0] === "#")
					{
						value = "#" + value;
					}

					this._hash = value;
				}
			}
		}
	);

	URL.createObjectURL = window.URL.createObjectURL;
	URL.revokeObjectURL = window.URL.revokeObjectURL;
	publish(window, "URL", URL);
}
/* ******************************************************** */
if (window.URLSearchParams === undefined)
{
	function URLSearchParams(init)
	{
		this.parameters = {};
		if (init instanceof Location || init instanceof URL)
		{
			init = init.search;
		}
		if (typeof init === "string")
		{
			if (init[0] === "?")
			{
				init = init.substr(1);
			}
			init = init.split("&").map(
				function (item)
				{
					item = item.split("=");
					return [item.shift(), item.join("=")];
				},
				this
			);
		}
		else if (init instanceof URLSearchParams)
		{
			init = Object.entries(init.parameters);
		}
		else if (!Array.isArray(init))
		{
			init = Object.entries(init);
		}
		init.forEach(
			function (item)
			{
				this.append(item[0], item[1]);
			},
			this
		);
	}
	URLSearchParams.prototype.set = function (name, value)
	{
		name = String(name);
		value = String(value);
		this.parameters[name] = [value];
	};
	URLSearchParams.prototype.append = function (name, value)
	{
		name = String(name);
		value = String(value);
		if (this.parameters.hasOwnProperty(name))
		{
			this.parameters[name].push(value);
		}
		else
		{
			this.parameters[name] = [value];
		}
	};
	URLSearchParams.prototype.delete = function (name)
	{
		name = String(name);
		if (this.parameters.hasOwnProperty(name))
		{
			delete this.parameters[name];
		}
	};
	URLSearchParams.prototype.has = function (name)
	{
		name = String(name);
		return this.parameters.hasOwnProperty(name);
	};
	URLSearchParams.prototype.get = function (name)
	{
		name = String(name);
		return this.parameters.hasOwnProperty(name) ? this.parameters[name][0] : null;
	};
	URLSearchParams.prototype.getAll = function (name)
	{
		name = String(name);
		return this.parameters.hasOwnProperty(name) ? this.parameters[name].slice() : [];
	};
	URLSearchParams.prototype.keys = function ()
	{
		return Object.keys(this.parameters);
	};
	URLSearchParams.prototype.values = function ()
	{
		return Object.values(this.parameters);
	};
	URLSearchParams.prototype.entries = function ()
	{
		return Object.entries(this.parameters);
	};
	URLSearchParams.prototype.sort = function ()
	{
		const copy = this.parameters;
		const names = Object.getOwnPropertyNames(copy);
		names.sort();
		this.parameters = {};
		names.forEach(
			function (name)
			{
				this.parameters[name] = copy[name];
			},
			this
		);
	};
	URLSearchParams.prototype.forEach = function (callback, thisArg)
	{
		Object.getOwnPropertyNames(this.parameters).forEach(
			function (name)
			{
				this.parameters[name].forEach(
					function (value)
					{
						callback.call(thisArg, value, name, this);
					},
					this
				);
			},
			this
		);
	};
	URLSearchParams.prototype.toString = function ()
	{
		const output = [];
		this.forEach(
			function (value, name)
			{
				name = encodeURIComponent(name);
				value = encodeURIComponent(value);
				output.push((name + "=" + value).replace(/%20/g, "+"));
			},
			this
		);
		return output.join("&");
	};
	publish(window, "URLSearchParams", URLSearchParams);
}
/* ******************************************************** */
if (window.AbortController === undefined)
{
	function AbortEvent(signal)
	{
		this.timeStamp = Date.now();
		this.target = signal;
		this.srcElement = signal;
		this.currentTarget = signal;
		this.originalTarget = signal;
		this.explicitOriginalTarget = signal;
		this.__proto__.__proto__ = Event.prototype;
	}
	AbortEvent.prototype.isTrusted = true;
	AbortEvent.prototype.type = "abort";
	AbortEvent.prototype.eventPhase = 2;
	AbortEvent.prototype.bubbles = false;
	AbortEvent.prototype.cancelable = false;
	AbortEvent.prototype.returnValue = true;
	AbortEvent.prototype.defaultPrevented = false;
	AbortEvent.prototype.composed = false;
	AbortEvent.prototype.cancelBubble = false;
	AbortEvent.prototype.composedPath = function () { return []; };
	{
		const NOOP = function () { };
		AbortEvent.prototype.stopPropagation = NOOP;
		AbortEvent.prototype.stopImmediatePropagation = NOOP;
		AbortEvent.prototype.preventDefault = NOOP;
		AbortEvent.prototype.initEvent = NOOP;
	}
	let prevent_signal_instanciation = true;
	function AbortSignal()
	{
		if (prevent_signal_instanciation)
		{
			throw new Error("Cannot instanciate AbortSignal");
		}
		this.aborted = false;
	}
	AbortSignal.prototype.addEventListener = function (type, listener)
	{
		if (!this.aborted && type === "abort" && !this.listeners.includes(listener))
		{
			this.listeners.push(listener);
		}
	};
	AbortSignal.prototype.removeEventListener = function (type, listener)
	{
		if (!this.aborted && type === "abort" && this.listeners.includes(listener))
		{
			this.listeners.splice(listener, this.listeners.indexOf(listener), 1);
		}
	};
	function AbortController()
	{
		prevent_signal_instanciation = false;
		Object.defineProperty(this, "signal", { value: new AbortSignal() });
		prevent_signal_instanciation = true;
	}
	AbortController.prototype.abort = function ()
	{
		this.signal.aborted = true;
		const event = new AbortEvent(this.signal);
		this.signal.listeners.forEach(
			function (listener)
			{
				try
				{
					listener(event);
				}
				catch (error) { }
			}
		);
		this.signal.listeners = undefined;
	}
	publish(window, "AbortController", AbortController);
	publish(window, "AbortSignal", AbortSignal);
}
/* ******************************************************** */
if (typeof DOMException !== "function")
{
	function DOMException(message, name)
	{
		const error = new Error(message);
		error.stack = error.stack.split(/\n/g).splice(-2, 2, "").join("\n");
		error.__proto__ = AbortError.prototype;
		error.name = name;
		return error;
	}
	DOMException.prototype = Object.create(Error.prototype);
	Object.assign(DOMException, window.DOMException)
	DOMException.prototype.constructor = DOMException;
	publish(window, "DOMException", DOMException);
}
/* ******************************************************** */
// No more needs for XMLHttpRequest!
if (window.fetch === undefined)
{
	const standard_methods = ["DELETE", "GET", "HEAD", "OPTIONS", "POST", "PUT"];
	const redirect_statuses = [301, 302, 303, 307, 308];
	/* Class Headers */
	function normalize_name(name)
	{
		name = String(name).toLowerCase();
		if (!name.match(/^[a-z0-9\-#$%&'*+.^_`|~]+$/))
		{
			throw new TypeError("Invalid character in header field name");
		}
		return name;
	}
	function Headers(headers)
	{
		this.map = {};
		if (headers instanceof Headers)
		{
			headers.forEach(
				function (value, name)
				{
					this.append(name, value);
				},
				this
			);
		}
		else if (Array.isArray(headers))
		{
			headers.forEach(
				function (header)
				{
					this.append(header[0], header[1]);
				},
				this
			);
		}
		else if (headers)
		{
			Object.getOwnPropertyNames(headers).forEach(
				function (name)
				{
					this.append(name, headers[name]);
				},
				this
			);
		}
	}
	Headers.prototype.append = function (name, value)
	{
		name = normalize_name(name);
		value = String(value);
		const oldValue = this.map[name];
		this.map[name] = oldValue ? oldValue + ", " + value : value;
	};
	Headers.prototype.delete = function (name)
	{
		delete this.map[normalize_name(name)];
	};
	Headers.prototype.get = function (name)
	{
		name = normalize_name(name);
		return this.has(name) ? this.map[name] : null;
	};
	Headers.prototype.has = function (name)
	{
		return this.map.hasOwnProperty(normalize_name(name));
	};
	Headers.prototype.set = function (name, value)
	{
		this.map[normalize_name(name)] = String(value);
	};
	Headers.prototype.forEach = function (callback, thisArg)
	{
		Object.getOwnPropertyNames(this.map).forEach(
			function (name)
			{
				callback.call(thisArg, this.map[name], name, this);
			},
			this
		);
	};
	Headers.prototype.keys = function ()
	{
		return Object.keys(this.map).values();
	};
	Headers.prototype.values = function ()
	{
		return Object.values(this.map).values();
	};
	Headers.prototype.entries = function ()
	{
		return Object.entries(this.map).values();
	};
	/* Class Body */
	function initialize_file_reader(reader)
	{
		return new Promise(
			function (accept, reject)
			{
				reader.onload = function ()
				{
					accept(reader.result)
				};
				reader.onerror = function ()
				{
					reject(reader.error)
				};
			}
		);
	}
	function clone_buffer(buffer)
	{
		if (buffer.slice)
		{
			return buffer.slice(0);
		}
		else
		{
			const view = new Uint8Array(buffer.byteLength);
			view.set(new Uint8Array(buffer));
			return view.buffer;
		}
	}
	function consume(body)
	{
		return new Promise(
			function (accept)
			{
				if (body.bodyUsed)
				{
					throw new TypeError("Already read");
				}
				else
				{
					body.bodyUsed = true;
					accept();
				}
			}
		);
	};
	function Body(init)
	{
		this.bodyUsed = false;
		this._bodyInit = init;
		if (!init)
		{
			this._bodyText = "";
		}
		else if (typeof init === "string")
		{
			this._bodyText = init;
		}
		else if (init instanceof Blob)
		{
			this._bodyBlob = init;
		}
		else if (init instanceof FormData)
		{
			this._bodyFormData = init;
		}
		else if (init instanceof URLSearchParams)
		{
			this._bodyText = init.toString();
		}
		else if (init instanceof DataView)
		{
			this._bodyArrayBuffer = clone_buffer(init.buffer);
			// IE 11 can't handle a DataView body.
			this._bodyInit = new Blob([this._bodyArrayBuffer]);
		}
		else if ((init instanceof ArrayBuffer) || ArrayBuffer.isView(init))
		{
			this._bodyArrayBuffer = clone_buffer(init);
		}
		else
		{
			init = String(init);
			this._bodyText = init;
		}
		if (!this.headers.get("content-type"))
		{
			if (typeof init === "string")
			{
				this.headers.set("content-type", "text/plain;charset=UTF-8");
			}
			else if (this._bodyBlob && this._bodyBlob.type)
			{
				this.headers.set("content-type", this._bodyBlob.type);
			}
			else if (init instanceof URLSearchParams)
			{
				this.headers.set("content-type", "application/x-www-form-urlencoded;charset=UTF-8");
			}
		}
	}
	Body.prototype.blob = function ()
	{
		const self = this;
		return consume(this).then(
			function ()
			{
				if (self._bodyBlob)
				{
					return self._bodyBlob;
				}
				else if (self._bodyArrayBuffer)
				{
					return new Blob([self._bodyArrayBuffer]);
				}
				else if (self._bodyFormData)
				{
					throw new Error("could not read FormData body as blob");
				}
				else
				{
					return new Blob([self._bodyText]);
				}
			}
		);
	};
	Body.prototype.arrayBuffer = function ()
	{
		if (this._bodyArrayBuffer)
		{
			const self = this;
			return consume(this).then(
				function ()
				{
					return self._bodyArrayBuffer;
				}
			);
		}
		else
		{
			return this.blob().then(
				function (blob)
				{
					const reader = new FileReader();
					reader.readAsArrayBuffer(blob);
					return initialize_file_reader(reader);
				}
			);
		}
	};
	Body.prototype.text = function ()
	{
		const self = this;
		return consume(this).then(
			function ()
			{
				if (self._bodyBlob)
				{
					const reader = new FileReader();
					reader.readAsText(self._bodyBlob);
					return initialize_file_reader(reader);
				}
				else if (self._bodyArrayBuffer)
				{
					const view = new Uint8Array(self._bodyArrayBuffer);
					const length = view.length;
					const chars = new Array(length);
					let i = 0;
					for (; i < length; ++i)
					{
						chars[i] = String.fromCharCode(view[i]);
					}
					return chars.join("");
				}
				else if (self._bodyFormData)
				{
					throw new Error("could not read FormData body as text");
				}
				else
				{
					return self._bodyText;
				}
			}
		);
	};
	Body.prototype.formData = function ()
	{
		return this.text().then(
			function (body)
			{
				const form = new FormData();
				body.trim().split("&").forEach(
					function (bytes)
					{
						if (bytes)
						{
							const split = bytes.replace(/\+/g, " ").split("=");
							const name = split.shift();
							const value = split.join("=");
							form.append(decodeURIComponent(name), decodeURIComponent(value));
						}
					}
				);
				return form;
			}
		);
	};
	Body.prototype.json = function ()
	{
		return this.text().then(JSON.parse);
	};
	/* Class Request */
	function getStatusText(status)
	{
		switch (status)
		{
			// Information
			case 100: return "Continue";
			case 101: return "Switching Protocols";
			case 102: return "Processing";
			case 103: return "Early Hints";
			// Success
			case 200: return "OK";
			case 201: return "Created";
			case 202: return "Accepted";
			case 203: return "Non-Authoritative Information";
			case 204: return "No Content";
			case 205: return "Reset Content";
			case 206: return "Partial Content";
			case 207: return "Multi-Status";
			case 208: return "Already Reported";
			case 226: return "IM Used";
			// Redirection
			case 300: return "Multiple Choices";
			case 301: return "Moved Permanently";
			case 302: return "Found";
			case 303: return "See Other";
			case 304: return "Not Modified";
			case 305: return "Use Proxy";
			case 306: return "Switch Proxy";
			case 307: return "Temporary Redirect";
			case 308: return "Permanent Redirect";
			// Client Error
			case 400: return "Bad Request";
			case 401: return "Unauthorized";
			case 402: return "Payment Required";
			case 403: return "Forbidden";
			case 404: return "Not Found";
			case 405: return "Method Not Allowed";
			case 406: return "Not Acceptable";
			case 407: return "Proxy Authentication Required";
			case 408: return "Request Timeout";
			case 409: return "Conflict";
			case 410: return "Gone";
			case 411: return "Length Required";
			case 412: return "Precondition Failed";
			case 413: return "Payload Too Large";
			case 414: return "URI Too Long";
			case 415: return "Unsupported Media Type";
			case 416: return "Range Not Satisfiable";
			case 417: return "Expectation Failed";
			case 418: return "I'm a teapot";
			case 421: return "Misdirected Request";
			case 422: return "Unprocessable Entity";
			case 423: return "Locked";
			case 424: return "Failed Dependency";
			case 425: return "Too Early";
			case 426: return "Upgrade Required";
			case 428: return "Precondition Required";
			case 429: return "Too Many Requests";
			case 431: return "Request Header Fields Too Large";
			case 451: return "Unavailable For Legal Reasons";
			// Server Error
			case 500: return "Internal Server Error";
			case 501: return "Not Implemented";
			case 502: return "Bad Gateway";
			case 503: return "Service Unavailable";
			case 504: return "Gateway Timeout";
			case 505: return "HTTP Version Not Supported";
			case 506: return "Variant Also Negotiates";
			case 507: return "Insufficient Storage";
			case 508: return "Loop Detected";
			case 510: return "Not Extended";
			case 511: return "Network Authentication Required";
			// Other
			default: return "Unknown Status";
		}
	}
	function Request(input, options)
	{
		if (!options)
		{
			options = {};
		}
		if (input instanceof Request)
		{
			if (input.bodyUsed)
			{
				throw new TypeError("Already read");
			}
			this.url = input.url;
			this.credentials = input.credentials;
			if (!options.headers)
			{
				this.headers = new Headers(input.headers);
			}
			this.method = input.method;
			this.mode = input.mode;
			this.signal = input.signal;
			if (!options.body && input._bodyInit)
			{
				options.body = input._bodyInit;
				input.bodyUsed = true;
			}
		}
		else
		{
			this.url = String(input);
		}
		this.credentials = options.credentials || this.credentials || "same-origin";
		if (options.headers || !this.headers)
		{
			this.headers = new Headers(options.headers);
		}
		const method = options.method || this.method || "GET";
		const upcased = method.toUpperCase();
		this.method = standard_methods.includes(upcased) ? upcased : method;
		this.mode = options.mode || this.mode || null;
		this.signal = options.signal || this.signal;
		this.referrer = null;
		if (options.body && (this.method === "GET" || this.method === "HEAD"))
		{
			throw new TypeError("Body not allowed for GET or HEAD requests");
		}
		Body.call(this, options.body);
	}
	Request.prototype = Object.create(Body.prototype);
	Request.prototype.constructor = Request;
	Request.prototype.clone = function ()
	{
		return new Request(this, { body: this._bodyInit });
	};
	/* Class Response */
	function Response(body, options)
	{
		if (!options)
		{
			options = {};
		}
		this.type = "default";
		this.status = Number.isInteger(options.status) ? options.status : 200;
		this.ok = 199 < this.status && this.status < 300;
		this.statusText = getStatusText(this.status);
		this.headers = new Headers(options.headers);
		this.url = options.url || "";
		Body.call(this, body);
	}
	Response.prototype = Object.create(Body.prototype);
	Response.prototype.constructor = Response;
	Response.prototype.clone = function ()
	{
		return new Response(
			this._bodyInit,
			{
				status: this.status,
				statusText: this.statusText,
				headers: new Headers(this.headers),
				url: this.url
			}
		);
	};
	Response.error = function ()
	{
		const response = new Response(null, { status: 0, statusText: "" });
		response.type = "error";
		return response;
	};
	Response.redirect = function (url, status)
	{
		if (!redirect_statuses.includes(status))
		{
			throw new RangeError("Invalid status code");
		}
		return new Response(null, { status: status, headers: { location: url } });
	};
	/* Function fetch */
	function fetch(input, init)
	{
		return new Promise(
			function (accept, reject)
			{
				const request = new Request(input, init);
				if (request.signal && request.signal.aborted)
				{
					return reject(new DOMException("The operation was aborted.", "AbortError"));
				}
				const xhr = new XMLHttpRequest();
				function abort_xhr()
				{
					xhr.abort();
				}
				xhr.onload = function ()
				{
					const headers = new Headers();
					let raw_headers = xhr.getAllResponseHeaders();
					if (raw_headers)
					{
						raw_headers = raw_headers.replace(/\r?\n[\t ]+/g, " ").trim();
						raw_headers.split(/\r?\n/).forEach(
							function (line)
							{
								line = line.split(":");
								const name = line.shift().trim();
								const value = line.join(":").trim();
								if (name)
								{
									headers.append(name, value);
								}
							}
						);
					}
					const options = {
						status: xhr.status,
						statusText: xhr.statusText,
						headers: headers
					};
					options.url = "responseURL" in xhr ? xhr.responseURL : options.headers.get("X-Request-URL");
					const body = "response" in xhr ? xhr.response : xhr.responseText;
					accept(new Response(body, options));
				};
				xhr.onerror = function ()
				{
					reject(new TypeError("Network request failed"));
				}
				xhr.ontimeout = function ()
				{
					reject(new TypeError("Network request failed"));
				}
				xhr.onabort = function ()
				{
					reject(new DOMException("The operation was aborted.", "AbortError"));
				}
				xhr.open(request.method, request.url, true);
				if (request.credentials === "include")
				{
					xhr.withCredentials = true;
				}
				else if (request.credentials === "omit")
				{
					xhr.withCredentials = false;
				}
				if ("responseType" in xhr)
				{
					xhr.responseType = "blob";
				}
				request.headers.forEach(
					function (value, name)
					{
						xhr.setRequestHeader(name, value);
					}
				);
				if (request.signal)
				{
					request.signal.addEventListener("abort", abort_xhr);
					xhr.onreadystatechange = function ()
					{
						// DONE (success or failure)
						if (xhr.readyState === 4)
						{
							request.signal.removeEventListener("abort", abort_xhr);
						}
					}
				}
				if (request._bodyInit)
				{
					xhr.send(request._bodyInit);
				}
				else
				{
					xhr.send();
				}
			}
		);
	}
	publish(window, "fetch", fetch);
	publish(window, "Headers", Headers);
	publish(window, "Request", Request);
	publish(window, "Response", Response);
}
/* ******************************************************** */
{
	const template = document.createElement("template");
	if (!(template.content instanceof DocumentFragment))
	{
		Object.defineProperty(
			Object.getPrototypeOf(template),
			"content",
			{
				configurable: true,
				get: function()
				{
					if (this.tagName === "TEMPLATE")
					{
						if (!this._content)
						{
							const content = document.createDocumentFragment();
							const children = this.childNodes;
							while (children.length > 0)
							{
								content.appendChild(children[0]);
							}
							publish(this, "_content", content);
						}

						return this._content;
					}
				}
			}
		);
	}
}
