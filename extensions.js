"use strict";
function publish(root, name, module)
{
	Object.defineProperty(root, name, { value: module });
};
/* ******************************************************** */
/*		EXTENSIONS											*/
/* ******************************************************** */
Function.NO_OP = function () { };
/* ******************************************************** */
document.html = document.head.parentNode;
/* ******************************************************** */
window.assert = function (test_result, error_message)
{
	if (!test_result)
	{
		throw new Error(error_message || "Assertion failed");
	}
};
/* ******************************************************** */
window.timeout = function (delay)
{
	const promise = new Promise(
		function (accept, reject)
		{
			const id = setTimeout(accept, delay);
			promise.clear = function ()
			{
				clearTimeout(id);
				reject();
			};
		}
	);
	return promise;
};
/* ******************************************************** */
window.scrollSmoothlyTo = function (x, y)
{
	const hasNativeSmoothScroll = (
		window.InstallTrigger !== undefined
		||
		(window.chrome && (window.chrome.webstore || window.chrome.runtime))
	);
	if (Element.prototype.scrollIntoView && hasNativeSmoothScroll)
	{
		let pixel = document.querySelector("scroll-pixel");
		if (!pixel)
		{
			pixel = document.createElement("scroll-pixel");
			pixel.style.pointerEvents = "none";
			pixel.style.opacity = "0";
			pixel.style.display = "block";
			pixel.style.width = "1px";
			pixel.style.height = "1px";
			pixel.style.position = "absolute";
			document.body.appendChild(pixel);
		}
		pixel.style.left = x + "px";
		pixel.style.top = y + "px";
		pixel.scrollIntoView({
			behavior: "smooth",
			block: "start",
			inline: "start"
		});
	}
	else
	{
		const t0 = Date.now();
		const x0 = window.scrollX;
		const y0 = window.scrollY;
		function next()
		{
			const t = Date.now() - t0;
			if (t < 300)
			{
				const p = t / 300;
				window.scrollTo(
					Math.round((x - x0) * p + x0),
					Math.round((y - y0) * p + y0)
				);
				requestAnimationFrame(next);
			}
			else
			{
				window.scrollTo(x, y);
			}
		}
		requestAnimationFrame(next);
	}
};
window.scrollSmoothlyBy = function (dx, dy)
{
	scrollSmoothlyTo(window.scrollX + dx, window.scrollY + dy);
};
/* ******************************************************** */
navigator.geolocation.askCurrentPosition = function (options)
{
	return new Promise(
		function (accept, reject)
		{
			navigator.geolocation.getCurrentPosition(accept, reject, options);
		}
	);
};
/* ******************************************************** */
window.TypeCheck = {
	isDefined: function (value)
	{
		return (value !== undefined && value !== null);
	},
	isObject: function (value)
	{
		return (value !== null) && (typeof value === "object");
	},
	isFunction: function (value)
	{
		return (typeof value === "function");
	},
	isBoolean: function (value)
	{
		return (typeof value === "boolean");
	},
	isString: function (value)
	{
		return (typeof value === "string");
	},
	isNumber: function (value)
	{
		return (typeof value === "number");
	}
};
/* ******************************************************** */
publish(
	Object,
	"dive",
	function (item, chain, default_value)
	{
		const value = chain.reduce(
			function (item, key)
			{
				return (item instanceof Object && item.hasOwnProperty(key)) ? item[key] : undefined;
			},
			item
		);

		return value === undefined ? default_value : value;
	}
);
/* ******************************************************** */
publish(
	Number,
	"isFloat",
	function (value)
	{
		return (typeof value === "number") && !Number.isNaN(value);
	}
);
publish(
	Number.prototype,
	"sign",
	function ()
	{
		const value = this;
		if (Number.isNaN(value))
		{
			return NaN;
		}
		else if (value < 0)
		{
			return -1;
		}
		else if (value > 0)
		{
			return 1;
		}
		else
		{
			return 0;
		}
	}
);
publish(
	Number.prototype,
	"equals",
	function (value)
	{
		return Math.abs(this - value) < Number.EPSILON;
	}
);
/* ******************************************************** */
Object.isObject = function (value)
{
	return (value instanceof Object) || value && (typeof value === "object");
};
{
	const toString = Object.prototype.toString;
	Object.getType = function (value)
	{
		return toString(value).slice(8, -1);
	};
}
Object.getClass = function (value)
{
	return (value && value.constructor) ? (value.constructor.name || "Anonymous") : Object.getType(value);
};
Object.combine = function (keys, values)
{
	const answer = {};
	const length = keys.length;
	let i = 0;
	for (; i < length; ++i)
	{
		answer[keys[i]] = values[i];
	}
	return answer;
};
publish(
	Object.prototype,
	"enumerate",
	function (callback, anchor)
	{
		let key;
		for (key in this)
		{
			callback.call(anchor, key, this[key]);
		}
	}
);
/* ******************************************************** */
publish(
	Array.prototype,
	"startsBy",
	function (needle)
	{
		const length = needle.length;

		if (this.length > length)
		{
			let i = 0;
			for (; i < length; ++i)
			{
				if (this[i] !== needle[i])
				{
					return false;
				}
			}
			return true;
		}
		else
		{
			return this === needle;
		}
	}
);
/* ******************************************************** */
publish(
	Array.prototype,
	"get",
	function (index)
	{
		if (!Number.isSafeInteger(index))
		{
			throw new Error("Invalid index");
		}
		else
		{
			const length = this.length;
			if (index < 0)
			{
				index += length;
			}
			if ((index < 0) || (index >= length))
			{
				throw new Error("Index out of range");
			}
			else
			{
				return this[index];
			}
		}
	}
);
publish(
	Array.prototype,
	"column",
	function (key)
	{
		const answer = [];
		const length = this.length;
		let i = 0;
		for (; i < length; ++i)
		{
			answer.push(this[i][key]);
		}
		return answer;
	}
);
publish(
	Array.prototype,
	"unique",
	function ()
	{
		const answer = [];
		const length = this.length;
		let i = 0;
		for (; i < length; ++i)
		{
			if (!answer.includes(this[i]))
			{
				answer.push(this[i]);
			}
		}
		return answer;
	}
);
publish(
	Array.prototype,
	"diff",
	function (other)
	{
		const answer = [];
		const length = this.length;
		let i = 0;
		for (; i < length; ++i)
		{
			if (!other.includes(this[i]))
			{
				answer.push(this[i]);
			}
		}
		return answer;
	}
);
publish(
	Array.prototype,
	"intersect",
	function (other)
	{
		const answer = [];
		const length = this.length;
		let i = 0;
		for (; i < length; ++i)
		{
			if (other.includes(this[i]))
			{
				answer.push(this[i]);
			}
		}
		return answer;
	}
);
/* ******************************************************** */
Promise.try = function (callback)
{
	try
	{
		const answer = callback();
		return (answer instanceof Promise) ? answer : Promise.resolve(answer);
	}
	catch (reason)
	{
		return Promise.reject(reason);
	}
};
publish(
	Promise.prototype,
	"collapse",
	function (callback)
	{
		const promise = this.then(
			function (answer)
			{
				return { error: false, data: answer };
			},
			function (reason)
			{
				return { error: true, data: reason };
			}
		);

		if (callback)
		{
			return promise.then(callback);
		}
		else
		{
			return promise;
		}
	}
);
publish(
	Promise.prototype,
	"afterward",
	function (callback)
	{
		return this.then(
			function (answer)
			{
				return callback[Iterator.isIterable(answer) ? "apply" : "call"](undefined, answer);
			}
		);
	}
);
publish(
	Promise.prototype,
	"finally",
	function (callback)
	{
		return this.then(callback, callback);
	}
);
/* ******************************************************** */
Math.randomInt = function (min, max)
{
	const delta = (1 + max - min);
	return (Math.floor(Math.random() * delta + Date.now()) % delta) + min;
};
/* ******************************************************** */
publish(
	Node.prototype,
	"prependChild",
	function (child_node)
	{
		this.insertBefore(child_node, this.firstChild);
	}
);
publish(
	Node.prototype,
	"appendSibling",
	function (sibling_node)
	{
		this.parentNode.insertBefore(sibling_node, this.nextSibling);
	}
);
publish(
	Node.prototype,
	"prependSibling",
	function (sibling_node)
	{
		this.parentNode.insertBefore(sibling_node, this);
	}
);
publish(
	Node.prototype,
	"getLineage",
	function ()
	{
		const lineage = [];
		let node = this;
		while (node)
		{
			lineage.unshift(node);
			node = node.parentNode;
		}
		return lineage;
	}
);
Node.getCommonAncestor = function (node1, node2)
{
	const ancestors1 = node1.getLineage();
	const ancestors2 = node2.getLineage();

	if (ancestors1[0] !== ancestors2[0])
	{
		return null;
	}
	const length = Math.min(ancestors1.length, ancestors2.length);
	let i = 1;
	for (; i < length; ++i)
	{
		if (ancestors1[i] !== ancestors2[i])
		{
			return ancestors1[i - 1];
		}
	}
	return ancestors1[length - 1];
};
/* ******************************************************** */
{
	function removeAll()
	{
		const length = this.length;
		let i = 0;
		for (; i < length; ++i)
		{
			this[0].remove();
		}
	}
	publish(HTMLCollection.prototype, "removeAll", removeAll);
	publish(NodeList.prototype, "removeAll", removeAll);
}
{
	function toFragment(clone_nodes)
	{
		const fragment = document.createDocumentFragment();
		const length = this.length;
		let i = 0;
		if (clone_nodes)
		{
			for (; i < length; ++i)
			{
				fragment.appendChild(this[i].cloneNode(true));
			}
		}
		else
		{
			for (; i < length; ++i)
			{
				fragment.appendChild(this[0]);
			}
		}
		return fragment;
	}
	publish(HTMLCollection.prototype, "toFragment", toFragment);
	publish(NodeList.prototype, "toFragment", toFragment);
}
/* ******************************************************** */
publish(
	EventTarget.prototype,
	"dispatchCustomEvent",
	function (name, data)
	{
		this.dispatchEvent(new CustomEvent(name, { bubbles: true, cancelable: true, detail: data }));
	}
);
/* ******************************************************** */
publish(
	Event.prototype,
	"cancel",
	function ()
	{
		this.preventDefault();
	}
);
publish(
	Event.prototype,
	"stop",
	function (immediately)
	{
		if (immediately)
		{
			this.stopImmediatePropagation();
		}
		else
		{
			this.stopPropagation();
		}
	}
);
publish(
	Event.prototype,
	"kill",
	function ()
	{
		this.preventDefault();
		this.stopImmediatePropagation();
	}
);
/* ******************************************************** */
window.Iterator = {
	isIterable: function (mixed)
	{
		return mixed && ((mixed instanceof Array) || Object.isObject(mixed) && !(mixed instanceof Function) && Number.isSafeInteger(mixed.length));
	},
	toArray: function (iterable)
	{
		return (iterable instanceof Array) ? iterable : Array.from(iterable);
	},
	from: function (iterable, copy)
	{
		if (copy)
		{
			iterable = Array.from(iterable);
		}
		const length = iterable.length;
		let index = 0;
		return {
			next: function ()
			{
				if (index < length)
				{
					const value = iterable[index];
					++index;
					return {
						done: false,
						value: value
					};
				}
				else
				{
					return { done: true };
				}
			}
		};
	}
};
/* ******************************************************** */
publish(
	Element.prototype,
	"getComputedStyle",
	function (pseudo_element)
	{
		return window.getComputedStyle(this, pseudo_element || null);
	}
);
/* ******************************************************** */
publish(
	HTMLFormElement.prototype,
	"getEditableElements",
	function ()
	{
		function discriminator(element)
		{
			return (
				element instanceof HTMLInputElement
				||
				element instanceof HTMLSelectElement
				||
				element instanceof HTMLTextAreaElement
			);
		}
		return Array.from(this.elements).filter(discriminator);
	}
);
publish(
	HTMLFormElement.prototype,
	"getFieldNames",
	function ()
	{
		function aggregator(stack, element)
		{
			const name = element.name;
			if (name && !stack.includes(name))
			{
				stack.push(name);
			}
			return stack;
		}
		return this.getEditableElements().reduce(aggregator, []);
	}
);
publish(
	HTMLFormElement.prototype,
	"getFields",
	function ()
	{
		function extractor(name)
		{
			return this.namedItem(name);
		}
		const names = this.getFieldNames();
		return Object.combine(names, names.map(extractor, this.elements));
	}
);
publish(
	HTMLFormElement.prototype,
	"getData",
	function ()
	{
		throw new Error("Deprecated, use 'new FormData(form_element)' instead.");
	}
);
publish(
	HTMLFormElement.prototype,
	"clear",
	function ()
	{
		this.getEditableElements().forEach(
			function (element)
			{
				switch (element.type)
				{
					case "select-one":
					case "select-multiple":
						element.selectedIndex = -1;
					break;

					case "radio":
					case "checkbox":
						element.checked = false;
					break;

					default:
						element.value = "";
				}
			}
		);
	}
);
/* ******************************************************** */
publish(
	HTMLInputElement.prototype,
	"isEmpty",
	function ()
	{
		return !((this.type === "radio" || this.type === "checkbox") ? this.checked : this.value);
	}
);
/* ******************************************************** */
publish(
	HTMLSelectElement.prototype,
	"isEmpty",
	function ()
	{
		return this.selectedIndex === -1;
	}
);
/* ******************************************************** */
publish(
	HTMLTextAreaElement.prototype,
	"isEmpty",
	function ()
	{
		return !this.value;
	}
);
/* ******************************************************** */
Object.defineProperty(
	document.location.constructor.prototype,
	"parameters",
	{
		get: function ()
		{
			return this.search.substr(1).split("&").reduce(
				function (stack, pair)
				{
					pair = pair.split("=");
					stack[pair[0]] = pair[1];
					return stack;
				},
				{}
			);
		}
	}
);
/* ******************************************************** */
document.addEventListener(
	"DOMContentLoaded",
	function ()
	{
		Array.from(document.querySelectorAll("form")).forEach(
			function (form)
			{
				form.reset();
			}
		);
		document.querySelectorAll("select:not([multiple]):not(:checked)").forEach(
			function (select)
			{
				select.selectedIndex = Array.from(select.options).reduce(
					function (selected_index, option)
					{
						return option.defaultSelected ? option.index : selected_index;
					},
					0
				);
			}
		);
	}
);
