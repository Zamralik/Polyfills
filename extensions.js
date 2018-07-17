"use strict";
function publish(root, name, module)
{
	Object.defineProperty(root, name, { value : module });
};
/* ******************************************************** */
/*		EXTENSIONS											*/
/* ******************************************************** */
Function.NO_OP = function () {};
/* ******************************************************** */
document.html = document.head.parentNode;
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
navigator.geolocation.askCurrentPosition = function(options)
{
	return new Promise(
		function (accept, reject)
		{
			navigator.geolocation.getCurrentPosition(accept, reject, options);
		}
	);
};
/* ******************************************************** */
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
	function ()
	{
		return this.then(
			function (answer)
			{
				return { error : false, detail : answer };
			},
			function (reason)
			{
				return { error : true, reason : reason };
			}
		);
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
		return Promise.try(callback);
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
	function wrap()
	{
		return Array.from(this);
	}
	publish(HTMLCollection.prototype, "wrap", wrap);
	publish(      NodeList.prototype, "wrap", wrap);
}
{
	function extract()
	{
		const fragment = document.createDocumentFragment();
		const length = this.length;
		let i = 0;
		for (; i < length; ++i)
		{
			fragment.appendChild(this[0]);
		}
		return fragment;
	}
	publish(HTMLCollection.prototype, "extract", extract);
	publish(      NodeList.prototype, "extract", extract);
}
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
	publish(      NodeList.prototype, "removeAll", removeAll);
}
/* ******************************************************** */
publish(
	EventTarget.prototype,
	"dispatchCustomEvent",
	function (name, data)
	{
		this.dispatchEvent(new CustomEvent(name, { bubbles : true, cancelable : true, detail : data }));
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
						done  : false,
						value : value
					};
				}
				else
				{
					return { done : true };
				}
			}
		};
	}
};
/* ******************************************************** */
{
	function aggregator(stack, element)
	{
		const name = element.name;
		if (!stack.includes(name))
		{
			stack.push(name);
		}
		return stack;
	}
	publish(
		HTMLFormElement.prototype,
		"getFieldNames",
		function ()
		{
			return this.querySelectorAll("input[name], select[name], textarea[name]").wrap().reduce(aggregator, []);
		}
	);
}
{
	function extractor(name)
	{
		return this[name];
	}
	publish(
		HTMLFormElement.prototype,
		"getFields",
		function ()
		{
			const names = this.getFieldNames();
			return Object.combine(names, names.map(extractor, this.elements));
		}
	);
}
{
	function extractor(name)
	{
		const field = this[name];
		if (field instanceof RadioNodeList)
		{
			if (this[0].type === "checkbox")
			{
				return field.wrap().reduce(
					function (stack, input)
					{
						if (input.checked)
						{
							stack.push(input.value);
						}
						return stack;
					},
					[]
				);
			}
			else
			{
				const length = this.length;
				let i = 0;
				for (; i < length; ++i)
				{
					if (this[i].checked)
					{
						return this[i].value;
					}
				}
				return null;
			}
		}
		else
		{
			switch (field.type)
			{
				case "select-multiple":
					return field.options.wrap().reduce(
						function (stack, option)
						{
							if (option.selected)
							{
								stack.push(option.value);
							}
							return stack;
						},
						[]
					);

				case "checkbox":
				case "radio":
					return field.checked ? field.value : null;

				default:
					return field.value;
			}
		}
	}
	publish(
		HTMLFormElement.prototype,
		"getData",
		function ()
		{
			const names = this.getFieldNames();
			return Object.combine(names, names.map(extractor, this.elements));
		}
	);
}
/* ******************************************************** */
publish(
	HTMLInputElement.prototype,
	"isEmpty",
	function ()
	{
		return !((this.type === "checkbox" || this.type === "radio") ? this.checked : this.value);
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
		get: function()
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
		document.querySelectorAll("form").wrap().forEach(
			function (form)
			{
				form.reset();
			}
		);
	}
);
