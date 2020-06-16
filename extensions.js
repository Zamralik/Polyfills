"use strict";
function publish(root, name, module)
{
	Object.defineProperty(root, name, { value: module });
};
/* ******************************************************** */
/*		EXTENSIONS											*/
/* ******************************************************** */
publish(
	window,
	"assert",
	function (test_result, error_message)
	{
		if (!test_result)
		{
			throw new Error(error_message || "Assertion failed");
		}
	}
);
/* ******************************************************** */
publish(
	window,
	"debounce",
	function (delay, callback)
	{
		let id = 0;

		function debounced()
		{
			const args = arguments;

			function wrapper()
			{
				callback.apply(undefined, args);
			}

			clearTimeout(id);
			id = setTimeout(wrapper, delay);
		}

		return debounced;
	}
);
/* ******************************************************** */
publish(
	window,
	"debounce_event",
	function (target, event_type, delay, callback, options)
	{
		// Deprecated
		target.addEventListener(event_type, debounce(delay, callback), options || false);
	}
);
/* ******************************************************** */
publish(
	window,
	"timeout",
	function (delay)
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
	}
);
/* ******************************************************** */
window.TypeCheck = {
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
	},
	isDefined: function (value)
	{
		return (value !== undefined) && (value !== null);
	},
	isObjectLike: function (value)
	{
		return (value !== null) && ((typeof value === "object") || (typeof value === "function"));
	},
	isObject: function (value)
	{
		return (value !== null) && (typeof value === "object");
	},
	isIterable: function (value)
	{
		return (value instanceof Array) || (TypeCheck.isObject(value) && Number.isSafeInteger(value.length));
	},
	getType: function (value)
	{
		return Object.prototype.toString.call(value).slice(8, -1);
	},
	getClass: function (value)
	{
		if (TypeCheck.isObject(value))
		{
			const prototype = Object.getPrototypeOf(value);

			if (prototype instanceof Object && prototype.hasOwnProperty("constructor"))
			{
				const constructor = prototype.constructor;

				if (typeof constructor === "function" && constructor.hasOwnProperty("name"))
				{
					const name = constructor.name;

					if (typeof name === "string" && name.length > 0)
					{
						return name;
					}
				}

				return "Unnamed";
			}

			return "RawData";
		}

		return Typecheck.getType(value);
	}
};
/* ******************************************************** */
{
	// Polyfill itself
	let pixel = null;

	if (Element.prototype.scrollIntoView && (window.InstallTrigger !== undefined || (window.chrome && (window.chrome.webstore || window.chrome.runtime))))
	{
		pixel = document.createElement("scroll-pixel");
		pixel.style.pointerEvents = "none";
		pixel.style.opacity = "0.1";
		pixel.style.background = "none";
		pixel.style.border = "none";
		pixel.style.display = "block";
		pixel.style.width = "1px";
		pixel.style.height = "1px";
		pixel.style.clip = "rect(1px, 1px, 1px, 1px)";
		pixel.style.position = "absolute";
		pixel.style.left = "0px";
		document.body.appendChild(pixel);
	};

	publish(
		window,
		"SmoothScroller",
		{
			moveTo: function (y)
			{
				if (!Number.isFinite(y) || y < 0)
				{
					y = 0;
				}

				if (pixel)
				{
					pixel.style.top = y + "px";
					pixel.scrollIntoView({
						behavior: "smooth",
						block: "start",
						inline: "nearest"
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
								Math.round(x0 - x0 * p),
								Math.round(y0 - (y0 - y) * p)
							);

							requestAnimationFrame(next);
						}
						else
						{
							window.scrollTo(0, y);
						}
					}

					requestAnimationFrame(next);
				}
			},
			moveBy: function (dy)
			{
				SmoothScroller.moveTo(window.scrollY + dy);
			},
			moveToElement: function (element, offset)
			{
				const rect = element.getBoundingClientRect();
				offset = window.scrollY + rect.top - (Number.isFinite(offset) ? offset : 0);
				SmoothScroller.moveTo(offset);
			}
		}
	);
}
/* ******************************************************** */
window.scrollSmoothlyTo = function (x, y)
{
	// Deprecated
	SmoothScroller.moveTo(y);
};
window.scrollSmoothlyBy = function (dx, dy)
{
	// Deprecated
	SmoothScroller.moveBy(dy);
};
/* ******************************************************** */
// Deprecated
Function.NO_OP = function () { };
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

		return TypeCheck.isDefined(value) ? value : default_value;
	}
);

publish(
	Object,
	"combine",
	function (keys, values)
	{
		const answer = {};
		const length = keys.length;
		let i = 0;

		for (; i < length; ++i)
		{
			answer[keys[i]] = values[i];
		}

		return answer;
	}
);
Object.isObject = function (value)
{
	// Deprecated
	return TypeCheck.isObject(value);
};
Object.getType = function (value)
{
	// Deprecated
	return TypeCheck.getType(value);
};
Object.getClass = function (value)
{
	// Deprecated
	return TypeCheck.getClass(value);
};
publish(
	Object.prototype,
	"enumerate",
	function (callback, anchor)
	{
		// Deprecated
		let key;

		for (key in this)
		{
			callback.call(anchor, key, this[key]);
		}
	}
);
/* ******************************************************** */
publish(
	Number,
	"equals",
	function (value1, value2, epsilon)
	{
		return Math.abs(value1 - value2) < (epsilon || Number.EPSILON);
	}
);
publish(
	Number,
	"isFloat",
	function (value)
	{
		// Deprecated
		return TypeCheck.isNumber(value);
	}
);
publish(
	Number.prototype,
	"sign",
	function ()
	{
		// Deprecated
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
		// Deprecated
		return Number.equals(this, value);
	}
);
/* ******************************************************** */
publish(
	Math,
	"randomInt",
	function (min, max)
	{
		const delta = (1 + max - min);
		return (Math.floor(Math.random() * delta + Date.now()) % delta) + min;
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
publish(
	Array.prototype,
	"get",
	function (index)
	{
		// Deprecated
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
		// Deprecated
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
/* ******************************************************** */

/* ******************************************************** */
publish(
	window,
	"Iterator",
	{
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
	}
);
/* ******************************************************** */
publish(
	Promise,
	"try",
	function (callback)
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
	}
);
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
				return callback[TypeCheck.isIterable(answer) ? "apply" : "call"](undefined, answer);
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
document.html = document.head.parentNode;
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
publish(
	HTMLFormElement.prototype,
	"debugFill",
	function (data)
	{
		this.getFieldNames().forEach(
			(name) =>
			{
				const element = this.elements.namedItem(name);

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
					element.value = data && data[name] || `${name} - Lorem ipsum dolor sit amet`;
				}
				else if (element instanceof HTMLSelectElement && element.selectedIndex > 0)
				{
					if (data && typeof data[name] === "number" && data[name] < element.options.length)
					{
						element.selectedIndex = data && data[name];
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
publish(
	HTMLInputElement.prototype,
	"reset",
	function ()
	{
		if (this.type === "checkbox" || this.type === "radio")
		{
			this.checked = this.defaultChecked;
		}
		else
		{
			this.value = this.defaultValue;
		}
	}
);
publish(
	HTMLInputElement.prototype,
	"clear",
	function ()
	{
		if (this.type === "checkbox" || this.type === "radio")
		{
			this.checked = false;
		}
		else
		{
			this.value = "";
		}
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
publish(
	HTMLSelectElement.prototype,
	"reset",
	function ()
	{
		if (this.multiple)
		{
			const option = this.querySelector("option[selected]");
			this.selectedIndex = option ? option.index : 0;
		}
		else
		{
			Array.from(this.options).forEach(
				function (option)
				{
					option.selected = option.defaultSelected;
				}
			);
		}
	}
);
publish(
	HTMLSelectElement.prototype,
	"clear",
	function ()
	{
		this.selectedIndex = -1;
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
publish(
	HTMLTextAreaElement.prototype,
	"reset",
	function ()
	{
		this.value = this.defaultValue;
	}
);
publish(
	HTMLTextAreaElement.prototype,
	"clear",
	function ()
	{
		this.value = "";
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
